import { createId } from "@paralleldrive/cuid2";
import Base64 from "crypto-js/enc-base64";
import sha256 from "crypto-js/sha256";
import { createClient } from "redis";
import * as v from "valibot";
import type { WebSocketServer } from "ws";
import type WebSocket from "ws";

import { prisma } from "../../packages/prisma/prisma_client";
import { IDGenSingleton } from "../util/id_gen";

import { typing_notification_payload } from "./client_data";
import { RedisSubscriptionManager } from "./redisClient";

const client = createClient();

const users: {
  [wsId: string]: {
    ws: WebSocket;
    userId: string;
  };
} = {};

let count = 0;
export async function ws(wss: WebSocketServer) {
  await client.connect();
  await IDGenSingleton.get_instance().init();
  wss.on("connection", async (ws, _req: Request) => {
    const wsId = count++;
    console.log("connection made");

    ws.on("message", async (message: string) => {
      const data = JSON.parse(`${message}`);
      if (data.type === "lubb") {
        ws.send(
          JSON.stringify({
            type: "dubb",
            payload: {
              stamp: Date.now(),
            },
          }),
        );
      }
      if (data.type === "join") {
        const msg_data = JSON.stringify({
          type: "MemberJoins",
          payload: {
            username: data.payload.username,
          },
        });
        RedisSubscriptionManager.get_instance().addChatMessage(
          data.payload.roomId,
          "ONLINE_CALLBACK",
          msg_data,
        );
      }

      if (data.type === "bulk_join") {
        const userId = data.payload.userId;
        users[wsId] = {
          ws,
          userId: data.payload.userId,
        };
        try {
          const rooms_subscribed = await prisma.directory.findMany({
            where: {
              user: {
                username: userId,
              },
            },
            select: {
              chat_id: true,
            },
          });
          const dms = await prisma.friendShip.findMany({
            where: {
              fromId: userId,
            },
            select: {
              connectionId: true,
            },
          });
          const dm_arr = dms!.map((dm) => dm.connectionId);
          const rooms_arr = rooms_subscribed.map((rooms) => rooms.chat_id);
          RedisSubscriptionManager.get_instance().bulk_subscribe(
            ws,
            [...rooms_arr, ...dm_arr],
            wsId.toString(),
            userId,
          );
        } catch (err) {
          console.log(err);
        }
      }

      if (data.type === "add_room") {
        const userId = data.payload.userId;
        const roomId = data.payload.roomId;

        RedisSubscriptionManager.get_instance().subscribe(
          ws,
          roomId,
          wsId.toString(),
          userId,
        );
      }

      if (data.type === "invite") {
        const userId = data.payload.userId;
        const inviteeId = data.payload.inviteeId;
        const content = data.payload.content;
        const createdAt = new Date().toISOString();
        const hash = sha256(content + createdAt + userId);
        const hash_str = Base64.stringify(hash);
        const conc_id = createId();
        try {
          await prisma.$transaction(async (tx) => {
            const from_link = await tx.friendShip.create({
              data: {
                fromId: userId,
                toId: inviteeId,
                connectionId: conc_id,
              },
              select: {
                id: true,
              },
            });
            await tx.friendShip.create({
              data: {
                fromId: inviteeId,
                toId: userId,
                connectionId: conc_id,
              },
            });
            await tx.directMessage.create({
              data: {
                friendshipId: from_link.id,
                content: content,
                senderId: userId,
                connectionId: conc_id,
                hash: hash_str,
              },
            });

            return from_link.id;
          });

          RedisSubscriptionManager.get_instance().subscribe(
            ws,
            conc_id,
            wsId.toString(),
            userId,
          );

          const maybe_invitee_online = Object.entries(users).find(
            ([_, user]) => user.userId === inviteeId,
          );

          if (maybe_invitee_online !== undefined) {
            const [inviteeWsId, user_details] = maybe_invitee_online;
            RedisSubscriptionManager.get_instance().subscribe(
              user_details.ws,
              conc_id,
              inviteeWsId,
              user_details.userId,
            );

            user_details.ws.send(
              JSON.stringify({
                type: "INVITE",
                data: JSON.stringify({
                  payload: {
                    requestBy: userId,
                    content,
                  },
                }),
              }),
            );
          }

          ws.send(
            JSON.stringify({
              type: "DM_INVITE_SUCCESS",
              data: JSON.stringify({
                payload: {
                  request: "SUCCESS",
                },
              }),
            }),
          );

          const msg_data = JSON.stringify({
            type: "message",
            payload: {
              roomId: conc_id,
              message: {
                content,
                user: userId,
              },
              createdAt,
            },
          });

          RedisSubscriptionManager.get_instance().addChatMessage(
            conc_id,
            "MSG_CALLBACK",
            msg_data,
          );
        } catch (err) {
          console.log(err);
          return;
        }
      }

      if (data.type === "bulk_leave") {
        const userId = data.payload.userId;
        try {
          const rooms_subscribed = await prisma.directory.findMany({
            where: {
              user: {
                username: userId,
              },
            },
            select: {
              chat_id: true,
            },
          });
          const dms = await prisma.friendShip.findMany({
            where: {
              fromId: userId,
            },
            select: {
              connectionId: true,
            },
          });
          const rooms_arr = rooms_subscribed.map((rooms) => rooms.chat_id);
          const dms_conc_id_arr = dms.map((dm) => dm.connectionId);
          RedisSubscriptionManager.get_instance().bulk_unsubscribe(userId, [
            ...rooms_arr,
            ...dms_conc_id_arr,
          ]);
          const msg_data = JSON.stringify({
            type: "MemberLeaves",
            payload: {
              username: userId,
            },
          });
          RedisSubscriptionManager.get_instance().addChatMessage(
            data.payload.roomId,
            "ONLINE_CALLBACK",
            msg_data,
          );
        } catch (err) {
          console.log(err);
        }
      }

      if (data.type === "message") {
        const roomId = data.payload.roomId;
        const message = data.payload.message;
        const msg_type: "chat" | "dm" = data.payload.msg_type;
        const { id, ...content } = message;
        const createdAt = new Date().toISOString();
        const hash = sha256(message.content + createdAt + message.user);
        const hash_str = Base64.stringify(hash);
        const msg_id = IDGenSingleton.get_instance().gen_id(msg_type);

        const msg_data = JSON.stringify({
          type: "message",
          payload: {
            id: msg_id,
            msg_type,
            roomId,
            message: content,
            createdAt,
            hash: hash_str,
          },
        });
        RedisSubscriptionManager.get_instance().addChatMessage(
          roomId,
          "MSG_CALLBACK",
          msg_data,
        );

        if (msg_type === "chat") {
          await client.lPush(
            "message",
            JSON.stringify({
              type: "chat",
              content: message.content,
              chatId: roomId,
              createdAt,
              memberId: id,
            }),
          );
        } else {
          await client.lPush(
            "message",
            JSON.stringify({
              type: "dm",
              content: message.content,
              concId: roomId,
              createdAt,
              friendshipId: data.payload.friendshipId,
              sender: message.user,
              hash: hash_str,
            }),
          );
        }
      }

      if (data.type === "TYPING") {
        const parsed_data = v.parse(typing_notification_payload, data.payload);
        const { user_id, type } = parsed_data;

        if (type === "DM") {
          const conc_id = parsed_data.conc_id;
          const msg_data = JSON.stringify({
            type: "TYPING",
            payload: {
              type,
              conc_id,
              op: parsed_data.operation,
              user_id,
            },
          });
          RedisSubscriptionManager.get_instance().addChatMessage(
            conc_id,
            "TYPING_CALLBACK",
            msg_data,
          );
        } else {
          const room_id = parsed_data.room_id;

          const msg_data = JSON.stringify({
            type: "TYPING",
            payload: {
              type,
              room_id,
              op: parsed_data.operation,
              user_id,
            },
          });
          RedisSubscriptionManager.get_instance().addChatMessage(
            room_id,
            "TYPING_CALLBACK",
            msg_data,
          );
        }
      }

      if (data.type === "update_details") {
        const chat_id = data.payload.id;
        const updated_details = data.payload.updated_details;

        try {
          const resp = await prisma.chat.update({
            where: {
              id: chat_id,
            },
            data: {
              name: updated_details.name,
              description: updated_details.description,
            },
          });
          const msg = JSON.stringify({
            type: "chat_details_update",
            payload: {
              chat_id,
              updated_details: {
                name: resp.name,
                description: resp.description,
              },
            },
          });

          RedisSubscriptionManager.get_instance().addChatMessage(
            chat_id,
            "UPDATE_DETAILS_CALLBACK",
            msg,
          );
        } catch (err) {
          console.log(err);
        }
      }

      if (data.type === "delete") {
        const { type,  delete_for_me, sender_id }:{
          type: 'CHAT' | 'DM',
          delete_for_me: boolean,
          sender_id: string,
        } = data.payload;
        let msg;
        let conc_id;
        try {
          if (delete_for_me === true) {
            if (type === "DM") {
              const id = data.payload.id;
                try {
                  const resp = await prisma.$transaction(async (tx) => {
                    const dm = await tx.directMessage.findUniqueOrThrow({
                      where: {
                        id,
                      },
                      select: {
                        deleteFor: true,
                        id: true,
                        connectionId: true,
                        hash: true,
                      },
                    });
                    await tx.directMessage.update({
                      where: {
                        id: dm.id,
                      },
                      data: {
                        deleteFor: `${dm.deleteFor}:${sender_id}`,
                      },
                    });

                    return dm;
                  });
                  msg = JSON.stringify({
                    type: "delete",
                    payload: {
                      type: "DM",
                      conc_id: resp.connectionId,
                      id: resp.id,
                    },
                  });

                  ws.send(
                    JSON.stringify({
                      type: "DELETE_CALLBACK",
                      data: msg,
                    }),
                  );
                } catch (err) {
                  console.log(err);
                }
            }else{
              const id = data.payload.id;
              const username = data.payload.sender_id
              const tx_resp = await prisma.$transaction(async(tx) => {
                const to_delete_msg = await tx.message.findUniqueOrThrow({
                  where: {
                    id: id,
                  },
                  select: {
                    deletedFor: true,
                    id: true,
                    chatId: true,
                  }
                })

                await prisma.message.update({
                  where: {
                    id: to_delete_msg.id
                  },
                  data: {
                    deletedFor: `${to_delete_msg.deletedFor}:${username}`
                  }
                })

                return to_delete_msg
              });

              msg = JSON.stringify({
                type: "delete",
                payload: {
                  type: "CHAT",
                  room_id: tx_resp.chatId,
                  id: tx_resp.id,
                },
              });

              ws.send(
                JSON.stringify({
                  type: "DELETE_CALLBACK",
                  data: msg,
                }),
              );
            }
          } else {
            if (type === "DM") {
              const id = data.payload.id;
                const resp = await prisma.directMessage.update({
                  where: {
                    id,
                  },
                  data: {
                    deleted: true,
                  },
                });
                msg = JSON.stringify({
                  type: "delete",
                  payload: {
                    type: "DM",
                    conc_id: resp.connectionId,
                    id: resp.id,
                  },
                });
                conc_id = resp.connectionId;
                RedisSubscriptionManager.get_instance().addChatMessage(
                  conc_id,
                  "DELETE_CALLBACK",
                  msg,
                );
            }else{
              const id = data.payload.id;
              const qry_resp = await prisma.message.update({
                where: {
                  id
                },
                data: {
                  deleted: true,
                },
                select: {
                  id: true,
                  chatId: true,
                }
              })
              msg = JSON.stringify({
                type: "delete",
                payload: {
                  type: "CHAT",
                  room_id: qry_resp.chatId,
                  id: qry_resp.id,
                },
              });
              const room_id = qry_resp.chatId;
              RedisSubscriptionManager.get_instance().addChatMessage(
                room_id,
                "DELETE_CALLBACK",
                msg,
              );
            }
          }
        } catch (err) {
          console.log(err);
        }
      }

      if (data.type === "star_msg") {
        const {
          sender_id,
          type,
        }: { sender_id: string; type: "DM" | "CHAT"; } =
          data.payload;
          const starred:boolean = data.payload.starred;
          const id:number = data.payload.id;
        switch (type) {
          case "DM": {
            let msg;
            if(starred === true)
            {
              try{
                const resp = await prisma.directMessage.update({
                  where: {
                    id: id,
                  },
                  data: {
                    starred: {
                      push: sender_id
                    }
                  },
                  select: {
                    starred: true,
                    hash: true,
                    id: true,
                    connectionId: true,

                  }
                });
                msg = JSON.stringify({
                  type: "star",
                  payload: {
                    type: "DM",
                    starred: true,
                    hash: resp.hash,
                    id: resp.id,
                    sender_id,
                    conc_id: resp.connectionId,
                  },
                });
              }catch(err){
                console.log(err);
              }
            }else{
              try{
                const unupdated_dm = await prisma.directMessage.findUniqueOrThrow({
                  where: {
                    id: id
                  },
                  select: {
                    id: true,
                    starred: true,
                  }
                });
                const resp = await prisma.directMessage.update({
                  where: {
                    id: unupdated_dm.id,
                  },
                  data: {
                    starred: unupdated_dm.starred.filter((ids) => ids !== sender_id)
                  },
                  select: {
                    id: true,
                    connectionId: true,
                    hash: true,
                  }
                });
                msg = JSON.stringify({
                  type: "star",
                  payload: {
                    type: "DM",
                    starred: true,
                    hash: resp.hash,
                    id: resp.id,
                    sender_id,
                    conc_id: resp.connectionId,
                  },
                });
              }catch(err){
                console.log(err)
              }
            }
            ws.send(
              JSON.stringify({
                type: "STARRED_CALLBACK",
                data: msg,
              }),
            );
            break;
          }
          case "CHAT" : {
            let msg;
            try{
              if(starred === true){
                const resp = await prisma.starredMessage.create({
                  data: {
                    msgId: id,
                    memberId: sender_id
                  },
                  select: {
                    msg: {
                      select: {
                        chatId: true,
                        id: true,
                      }
                    }
                  }
                });
  
                msg = JSON.stringify({
                  type: "star",
                  payload: {
                    type: "CHAT",
                    starred: true,
                    id: resp.msg.id,
                    room_id: resp.msg.chatId,
                    sender_id,
                  }
                })
              }else{
                const resp = await prisma.starredMessage.delete({
                  where: {
                   memberId_msgId: {
                    memberId: sender_id,
                    msgId: id,
                   }
                  },
                  select: {
                    msg: {
                      select: {
                        id: true,
                        chatId: true,
                      }
                    }
                  }
                })
                msg = JSON.stringify({
                  type: "star",
                  payload: {
                    type: "CHAT",
                    starred: false,
                    id: resp.msg.id,
                    room_id: resp.msg.chatId,
                    sender_id: true,
                  }
                })
              }
              ws.send(
                JSON.stringify({
                  type: "STARRED_CALLBACK",
                  data: msg,
                }),
              );
            }catch(err){
              console.log(err);
            }
            
            break;
          }
        }
      }

      if (data.type === "pin_msg") {
        const { pinned, sender_id, type }:{pinned: boolean, sender_id: string, type: "DM" | "CHAT"} = data.payload;

        if (type === "DM") {
          let msg;
          const msg_id = data.payload.id;
          
          try{
            const resp = await prisma.directMessage.update({
              where: {
                id: msg_id
              },
              data: {
                pinned: pinned,
              },
              select: {
                pinned: true,
                id: true,
                connectionId: true,
              }
            })
            msg = JSON.stringify({
              type: "pin",
              payload: {
                type: "DM",
                pinned: resp.pinned,
                id: resp.id,
                sender_id,
                conc_id: resp.connectionId,
              },
            });

            RedisSubscriptionManager.get_instance().
            addChatMessage(resp.connectionId,"PIN_MSG_CALLBACK",msg);
          }catch(err){
            console.log(err);
          }
        }else{
          const msg_id = data.payload.id;
          try{
            const resp = await prisma.message.update({
              where: {
                id: msg_id
              },
              data: {
                pinned
              },
              select: {
                pinned: true,
                id: true,
                chatId: true,
              }
            });

            const msg = JSON.stringify({
              type: "pin",
              payload: {
                type: 'CHAT',
                pinned: resp.pinned,
                room_id: resp.chatId,
                id: resp.id,
                sender_id,
              }
            });

            RedisSubscriptionManager.get_instance().
            addChatMessage(resp.chatId,'PIN_MSG_CALLBACK',msg)
          }catch(err){
            console.log(err)
          }
        }
      }

      if (data.type === "leave") {
        const msg_data = JSON.stringify({
          type: "MemberLeaves",
          payload: {
            username: data.payload.username,
          },
        });
        RedisSubscriptionManager.get_instance().addChatMessage(
          data.payload.roomId,
          "ONLINE_CALLBACK",
          msg_data,
        );
      }
    });
    ws.on("close", async () => {
      if (users[wsId] === undefined) return;

      const userId = users[wsId].userId;
      try {
        const rooms_subscribed = await prisma.directory.findMany({
          where: {
            userId,
          },
          select: {
            chat_id: true,
          },
        });
        const rooms_arr = rooms_subscribed.map((rooms) => rooms.chat_id);
        RedisSubscriptionManager.get_instance().bulk_unsubscribe(
          userId,
          rooms_arr,
        );
        delete users[wsId];
      } catch (err) {
        console.log(err);
      }
    });
  });
}
