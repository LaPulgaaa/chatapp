import { WebSocketServer } from 'ws';
import { RedisSubscriptionManager } from './redisClient';
import { createClient } from 'redis';
import { prisma } from '../../packages/prisma/prisma_client';
import { createId } from '@paralleldrive/cuid2';

const client=createClient();

const users:{
    [wsId:string]:{
        ws:any,
        userId: string,
    }
}={};

let count=0;
export async function ws(wss:WebSocketServer){
 await client.connect();
 wss.on("connection", async(ws,req:Request)=>{

        const wsId=count++;
        console.log("connection made")

        ws.on("message",async(message:string)=>{
            const data=JSON.parse(`${message}`);
            if(data.type === "lubb"){
                ws.send(JSON.stringify({
                    type: "dubb",
                    payload:{
                        stamp: Date.now(),
                    }
                }));
            }
            if(data.type==="join")
            {
                const msg_data = JSON.stringify(
                    {
                        type: "MemberJoins",
                        payload:{
                            username: data.payload.username,
                        }
                    }
                )
                RedisSubscriptionManager.get_instance().addChatMessage(data.payload.roomId,"ONLINE_CALLBACK",msg_data);
            }

            if(data.type === "bulk_join"){
                const userId = data.payload.userId;
                users[wsId]={
                    ws,
                    userId: data.payload.userId,
                }
                try{
                    const rooms_subscribed = await prisma.directory.findMany({
                        where:{
                            user: {
                                username: userId
                            },
                        },
                        select:{
                            chat_id: true,
                        }
                    });
                    const dms = await prisma.friendShip.findMany({
                        where: {
                            fromId: userId
                        },
                        select: {
                            connectionId: true,
                        }
                    })
                    const dm_arr = dms!.map((dm) => dm.connectionId);
                    const rooms_arr = rooms_subscribed.map((rooms)=> rooms.chat_id);
                    RedisSubscriptionManager.get_instance().bulk_subscribe(ws,[...rooms_arr,...dm_arr],wsId.toString(),userId);
                }catch(err){
                    console.log(err);
                }
            }

            if(data.type === "add_room"){
                const userId = data.payload.userId;
                const roomId = data.payload.roomId;

                RedisSubscriptionManager.get_instance().subscribe(ws,roomId,wsId.toString(),userId);
            }

            if(data.type === "invite"){
                const userId = data.payload.userId;
                const inviteeId = data.payload.inviteeId;
                const content = data.payload.content;
                const createdAt = new Date().toISOString();
                let conc_id = createId();
                try{
                    
                    await prisma.$transaction(async(tx) => {
                        const from_link = await tx.friendShip.create({
                            data: {
                                fromId: userId,
                                toId: inviteeId,
                                connectionId: conc_id,
                            },
                            select: {
                                id: true,
                            }
                        });
                        await tx.friendShip.create({
                            data: {
                                fromId: inviteeId,
                                toId: userId,
                                connectionId: conc_id,
                            }
                        })
                        await tx.directMessage.create({
                            data: {
                                friendshipId: from_link.id,
                                content: content,
                                senderId: userId,
                                connectionId: conc_id,
                            }
                        });

                        return from_link.id;
                    });

                    RedisSubscriptionManager.get_instance().subscribe(ws,conc_id,wsId.toString(),userId);

                    const maybe_invitee_online = Object.entries(users).find(([_,user]) => user.userId === inviteeId);

                    if(maybe_invitee_online !== undefined){
                        const [inviteeWsId, user_details ] = maybe_invitee_online;
                        RedisSubscriptionManager.get_instance()
                        .subscribe(user_details.ws,conc_id,inviteeWsId,user_details.userId);

                        user_details.ws.send(JSON.stringify({
                            type: "INVITE",
                            data: JSON.stringify({
                                payload: {
                                    requestBy: userId,
                                    content,
                                }
                            })
                        }));
                    }

                    ws.send(JSON.stringify({
                        type: 'DM_INVITE_SUCCESS',
                        data: JSON.stringify({
                            payload: {
                                request: "SUCCESS"
                            }
                        })
                    }))

                    const msg_data = JSON.stringify({
                        type:"message",
                        payload:{
                            roomId: conc_id,
                            message: {
                                content,
                                user: userId,
                            },
                            createdAt,
                        }
                    });

                    RedisSubscriptionManager.get_instance().addChatMessage(conc_id,"MSG_CALLBACK",msg_data)

                }catch(err){
                    console.log(err);
                    return;
                }
            }

            if(data.type === "bulk_leave"){
                const userId = data.payload.userId;
                try{
                    const rooms_subscribed = await prisma.directory.findMany({
                        where:{
                            user: {
                                username: userId,
                            }
                        },
                        select:{
                            chat_id: true,
                        }
                    });
                    const dms = await prisma.friendShip.findMany({
                        where: {
                            fromId: userId,
                        },
                        select: {
                            connectionId: true,
                        }
                    })
                    const rooms_arr = rooms_subscribed.map((rooms)=> rooms.chat_id);
                    const dms_conc_id_arr = dms.map((dm) => dm.connectionId);
                    RedisSubscriptionManager.get_instance().bulk_unsubscribe(userId,[...rooms_arr,...dms_conc_id_arr]);
                    const msg_data = JSON.stringify(
                        {
                            type: "MemberLeaves",
                            payload:{
                                username: userId,
                            }
                        }
                    )
                    RedisSubscriptionManager.get_instance().addChatMessage(data.payload.roomId,"ONLINE_CALLBACK",msg_data);
                }catch(err){
                    console.log(err);
                }
                
            }

            if(data.type==="message")
            {
                const roomId=data.payload.roomId;
                const message=data.payload.message;
                const msg_type: "chat" | "dm" = data.payload.msg_type;
                const {id, ...content} = message;
                const createdAt = new Date().toISOString();
                const msg_data = JSON.stringify({
                    type:"message",
                    payload:{
                        roomId,
                        message: content,
                        createdAt,
                    }
                });
                RedisSubscriptionManager.get_instance().addChatMessage(roomId,"MSG_CALLBACK",msg_data);

                if(msg_type === "chat"){
                    await client.lPush("message",JSON.stringify({
                        type: "chat",
                        content:message.content,
                        chatId:roomId,
                        createdAt,
                        memberId:id
                    }))
                }
                else {
                    await client.lPush("message",JSON.stringify({
                        type: "dm",
                        content:message.content,
                        concId: roomId,
                        createdAt,
                        friendshipId: data.payload.friendshipId,
                        sender: message.user,
                    }))
                }
            }
            if(data.type === "typing"){
                const { chat_id, user_id } = data.payload;

                const msg_data = JSON.stringify({
                    type: 'typing',
                    payload: {
                        chat_id,
                        user_id
                    }
                })

                RedisSubscriptionManager.get_instance().addChatMessage(chat_id,"TYPING_CALLBACK",msg_data)
            }
            if(data.type === "leave"){
                const msg_data = JSON.stringify(
                    {
                        type: "MemberLeaves",
                        payload:{
                            username: data.payload.username,
                        }
                    }
                )
                RedisSubscriptionManager.get_instance().addChatMessage(data.payload.roomId,"ONLINE_CALLBACK",msg_data);
            }

        })
        ws.on("close",async()=>{
            if(users[wsId]!==undefined)
            {
                const userId = users[wsId].userId;
                try{
                    const rooms_subscribed = await prisma.directory.findMany({
                        where:{
                            userId,
                        },
                        select:{
                            chat_id: true,
                        }
                    });
                    const rooms_arr = rooms_subscribed.map((rooms)=> rooms.chat_id);
                    RedisSubscriptionManager.get_instance().bulk_unsubscribe(userId,rooms_arr);
                    delete users[wsId];
                }catch(err){
                    console.log(err);
                }
            }
        })
        
    })


}