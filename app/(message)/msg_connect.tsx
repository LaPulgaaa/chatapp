"use client";

import assert from "minimalistic-assert";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import {
  useRecoilRefresher_UNSTABLE,
  useRecoilStateLoadable,
  useSetRecoilState,
} from "recoil";
import * as v from "valibot";

import { inbound_typing_event } from "../home/connect";
import { Signal } from "../home/signal";

import type { RecievedMessage } from "./chat/[...slug]/page";

import { useToast } from "@/hooks/use-toast";
import { direct_msg_state } from "@/lib/store/atom/dm";
import { subscribed_chats_state } from "@/lib/store/atom/subscribed_chats_state";
import { typing_event_store } from "@/lib/store/atom/typing_event_store";
import { fetch_dms } from "@/lib/store/selector/fetch_dms";
import type {
  MessageDeletePayload,
  MessagePinPayload,
  MessageStarPayload,
} from "@/packages/valibot";

type DeleteMsgCallbackData = {
  type: string;
  payload: MessageDeletePayload;
};

export type PinMsgCallbackData = {
  type: "pin";
  payload: MessagePinPayload;
};

export type StarMsgCallbackData = {
  type: "star";
  payload: MessageStarPayload;
};

export type UpdateDetailsData = {
  type: "chat_details_update";
  payload: {
    chat_id: string;
    updated_details: {
      name: string;
      description: string;
    };
  };
};

export default function Connect() {
  const session = useSession();
  const { toast } = useToast();
  const pathname = usePathname();
  const [dms, setDms] = useRecoilStateLoadable(direct_msg_state);
  const [roomsStateData, setRoomsStateData] = useRecoilStateLoadable(
    subscribed_chats_state,
  );
  const refresh_dms = useRecoilRefresher_UNSTABLE(fetch_dms);
  const setTypingState = useSetRecoilState(typing_event_store);

  function recieve_invite_callback(raw_data: string) {
    const data = JSON.parse(raw_data);
    toast({
      title: data.payload.requestBy,
      description: data.payload.content,
    });
    refresh_dms();
  }

  function delete_msg_callback(raw_string: string) {
    const data: DeleteMsgCallbackData = JSON.parse(`${raw_string}`);
    const payload = data.payload;

    if (payload.type === "DM" && dms.state === "hasValue") {
      setDms((dms) => {
        const updated_dms = dms.map((dm) => {
          if (dm.connectionId !== payload.conc_id) {
            return dm;
          }
          const updated_msgs = dm.messages.filter((msg) => {
            if (msg.id !== payload.id) return msg;
          });

          return {
            ...dm,
            messages: updated_msgs,
          };
        });
        return updated_dms;
      });
    } else if (payload.type === "CHAT" && roomsStateData.state === "hasValue") {
      setRoomsStateData((rooms) => {
        return rooms.map((room) => {
          if (room.id !== payload.room_id) return room;

          const updated_msg_arr = room.messages.filter(
            (msg) => msg.id !== payload.id,
          );
          return {
            ...room,
            messages: updated_msg_arr,
          };
        });
      });
    }
  }

  function star_msg_callback(raw_string: string) {
    const data: StarMsgCallbackData = JSON.parse(`${raw_string}`);
    const payload = data.payload;

    if (payload.type === "DM" && dms.state === "hasValue") {
      setDms((dms) => {
        const new_dms = dms.map((dm) => {
          if (dm.connectionId !== payload.conc_id) return dm;

          const updated_msgs = dm.messages.map((msg) => {
            if (msg.id === payload.id) {
              return {
                ...msg,
                starred: payload.starred,
              };
            }
            return msg;
          });
          return {
            ...dm,
            messages: updated_msgs,
          };
        });

        return new_dms;
      });
    } else if (payload.type === "CHAT" && roomsStateData.state === "hasValue") {
      setRoomsStateData((rooms) => {
        const updated_rooms = rooms.map((room) => {
          if (room.id !== payload.room_id) return room;

          const updated_msgs = room.messages.map((msg) => {
            if (msg.id !== payload.id) return msg;
            return {
              ...msg,
              starred: payload.starred,
            };
          });

          return {
            ...room,
            messages: updated_msgs,
          };
        });
        return updated_rooms;
      });
    }
  }

  function pin_msg_callback(raw_string: string) {
    const data: PinMsgCallbackData = JSON.parse(`${raw_string}`);
    const payload = data.payload;

    if (payload.type === "DM" && dms.state === "hasValue") {
      setDms((dms) => {
        const new_dms = dms.map((dm) => {
          if (dm.connectionId !== payload.conc_id) return dm;

          const updated_msgs = dm.messages.map((msg) => {
            if (msg.id === payload.id) {
              return {
                ...msg,
                pinned: payload.pinned,
              };
            }
            return msg;
          });
          return {
            ...dm,
            messages: updated_msgs,
          };
        });

        return new_dms;
      });
    } else if (payload.type === "CHAT" && roomsStateData.state === "hasValue") {
      setRoomsStateData((rooms) => {
        return rooms.map((room) => {
          if (room.id !== payload.room_id) return room;

          const updated_msgs = room.messages.map((msg) => {
            if (msg.id !== payload.id) return msg;

            return {
              ...msg,
              pinned: payload.pinned,
            };
          });

          return {
            ...room,
            messages: updated_msgs,
          };
        });
      });
    }
  }

  function details_update_callback(raw_string: string) {
    const data: UpdateDetailsData = JSON.parse(`${raw_string}`);
    if (data.type === "chat_details_update") {
      const all_rooms_data = roomsStateData.getValue();
      const narrowed_room = all_rooms_data.find(
        (room) => room.id === data.payload.chat_id,
      );
      assert(narrowed_room !== undefined);
      const other_rooms = all_rooms_data.filter(
        (room) => room.id !== narrowed_room.id,
      );
      const updated_narrowed_room = {
        ...narrowed_room,
        name: data.payload.updated_details.name,
        description: data.payload.updated_details.description,
      };
      setRoomsStateData([...other_rooms, updated_narrowed_room]);
    }
  }

  function handle_inbound_typing_event(raw_data: string) {
    const username = session.data?.username;
    const data = v.parse(inbound_typing_event, JSON.parse(raw_data));
    const payload = data.payload;
    setTypingState((curr_state) => {
      return curr_state.map((s) => {
        if (payload.user_id === username) return s;

        if (
          payload.type === "CHAT" &&
          s.type === "CHAT" &&
          payload.room_id === s.room_id
        ) {
          let already_typists = s.typists;

          if (
            payload.op === "start" &&
            !already_typists.includes(payload.user_id)
          ) {
            already_typists = [...already_typists, payload.user_id];
          } else if (
            payload.op === "stop" &&
            already_typists.includes(payload.user_id)
          ) {
            already_typists = already_typists.filter(
              (typist) => typist !== payload.user_id,
            );
          }

          return {
            type: "CHAT",
            room_id: s.room_id,
            typists: already_typists,
          };
        } else if (
          payload.type === "DM" &&
          s.type === "DM" &&
          payload.conc_id === s.conc_id
        ) {
          let already_typists = s.typists;

          if (
            payload.op === "start" &&
            !already_typists.includes(payload.user_id)
          ) {
            already_typists = [...already_typists, payload.user_id];
          } else if (
            payload.op === "stop" &&
            already_typists.includes(payload.user_id)
          ) {
            already_typists = already_typists.filter(
              (typist) => typist !== payload.user_id,
            );
          }

          return {
            type: "DM",
            conc_id: s.conc_id,
            typists: already_typists,
          };
        }

        return s;
      });
    });
  }

  function handle_recieved_msg(raw_data: string) {
    const is_narrowed = !pathname.includes("home");
    const data: RecievedMessage = JSON.parse(raw_data);
    const payload = data.payload;

    if (payload.msg_type === "dm") {
      const narrowed_dm =
        is_narrowed === true && pathname.includes("dm")
          ? pathname.split("/").slice(-1)[0]
          : undefined;
      setDms((dms) => {
        const new_dms = dms.map((dm) => {
          if (dm.connectionId !== payload.roomId) return dm;

          const old_msgs = dm.messages;
          const updated_unreads =
            narrowed_dm === dm.to.username ? 0 : (dm.unreads ?? 0) + 1;
          const new_msg = {
            id: payload.id,
            content: payload.message.content,
            sendBy: {
              username: payload.message.user,
              name: payload.message.name,
            },
            createdAt: payload.createdAt,
            pinned: false,
            starred: false,
          };
          return {
            ...dm,
            lastmsgAt: new Date().toISOString(),
            messages: [...old_msgs, new_msg],
            unreads: updated_unreads,
          };
        });

        return new_dms;
      });
    } else {
      const narrowed_chat =
        is_narrowed === true && pathname.includes("chat")
          ? pathname.split("/").slice(-1)[0]
          : undefined;
      setRoomsStateData((chats) => {
        const new_chats = chats.map((chat) => {
          if (chat.id !== payload.roomId) {
            return chat;
          }

          const old_msgs = chat.messages;
          const updated_unreads =
            narrowed_chat === chat.id ? 0 : (chat.unreads ?? 0) + 1;
          const new_msg = {
            id: payload.id,
            content: payload.message.content,
            sender: {
              username: payload.message.user,
              name: payload.message.name,
            },
            createdAt: payload.createdAt,
            starred: false,
            pinned: false,
          };
          return {
            ...chat,
            lastmsgAt: new Date().toISOString(),
            messages: [...old_msgs, new_msg],
            unreads: updated_unreads,
          };
        });
        return new_chats;
      });
    }
  }

  useEffect(() => {
    if (session.status === "authenticated") {
      Signal.get_instance(session.data.username).REGISTER_CALLBACK(
        "INVITE",
        recieve_invite_callback,
      );
      Signal.get_instance().REGISTER_CALLBACK(
        "DELETE_CALLBACK",
        delete_msg_callback,
      );
      Signal.get_instance().REGISTER_CALLBACK(
        "PIN_MSG_CALLBACK",
        pin_msg_callback,
      );
      Signal.get_instance().REGISTER_CALLBACK(
        "STARRED_CALLBACK",
        star_msg_callback,
      );
      Signal.get_instance().REGISTER_CALLBACK(
        "UPDATE_DETAILS_CALLBACK",
        details_update_callback,
      );
      Signal.get_instance().REGISTER_CALLBACK(
        "TYPING_CALLBACK",
        handle_inbound_typing_event,
      );
      Signal.get_instance().REGISTER_CALLBACK(
        "MSG_CALLBACK",
        handle_recieved_msg,
      );
    }

    return () => {
      if (session.status === "authenticated") {
        Signal.get_instance(session.data.username).DEREGISTER("INVITE");
        Signal.get_instance().DEREGISTER("DELETE_CALLBACK");
        Signal.get_instance().DEREGISTER("PIN_MSG_CALLBACK");
        Signal.get_instance().DEREGISTER("STARRED_CALLBACK");
        Signal.get_instance().DEREGISTER("UPDATE_DETAILS_CALLBACK");
        Signal.get_instance().DEREGISTER("TYPING_CALLBACK");
        Signal.get_instance().DEREGISTER("MSG_CALLBACK");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return <></>;
}
