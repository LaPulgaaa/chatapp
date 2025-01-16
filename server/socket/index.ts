import { WebSocketServer } from 'ws';
import { RedisSubscriptionManager } from './redisClient';
import { createClient } from 'redis';
import { prisma } from '../../packages/prisma/prisma_client';
import { createId } from '@paralleldrive/cuid2';
import sha256 from "crypto-js/sha256";
import Base64 from "crypto-js/enc-base64";

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
                const hash = sha256(content+createdAt+userId);
                const hash_str = Base64.stringify(hash);
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
                                hash: hash_str,
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
                const hash = sha256(message.content+createdAt+message.user);
                const hash_str = Base64.stringify(hash);
                const msg_data = JSON.stringify({
                    type:"message",
                    payload:{
                        roomId,
                        message: content,
                        createdAt,
                        hash: hash_str,
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
                        hash: hash_str
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

            if(data.type === "update_details"){
                const chat_id = data.payload.id;
                const updated_details = data.payload.updated_details; 

                try{
                    const resp = await prisma.chat.update({
                        where: {
                            id: chat_id
                        },
                        data: {
                            name: updated_details.name,
                            discription: updated_details.discription
                        }
                    })
                    const msg = JSON.stringify({
                        type: "chat_details_update",
                        payload: {
                            chat_id,
                            updated_details:{
                                name: resp.name,
                                discription: resp.discription,
                            },
                        }
                    });
    
                    RedisSubscriptionManager.get_instance().addChatMessage(chat_id,"UPDATE_DETAILS_CALLBACK",msg);
                }catch(err){
                    console.log(err);
                 }

                
            }

            if(data.type === "delete"){
                const {type,is_local_echo,delete_for_me,sender_id} = data.payload;
                let msg;
                let conc_id;
                try{
                    if(delete_for_me === true){
                        if(type === 'DM'){
                            if(is_local_echo === false){
                                const id = data.payload.id;
                                const resp = await prisma.directMessage.update({
                                    where: {
                                        id
                                    },
                                    data: {
                                        deleteFor: sender_id
                                    }
                                })
                                msg = JSON.stringify({
                                    type: "delete",
                                    payload: {
                                        type: "DM",
                                        conc_id: resp.connectionId,
                                        id: resp.id,
                                        hash: resp.hash
                                    }
                                })

                                ws.send(JSON.stringify({
                                    type: "DELETE_NON_ECHO",
                                    data: msg
                                }))
                            }else{
                                const { hash } = data.payload;
    
                                const resp = await prisma.directMessage.update({
                                    where: {
                                        hash: hash
                                    },
                                    data: {
                                        deleteFor: sender_id
                                    }
                                })

                                msg = JSON.stringify({
                                    type: "delete",
                                    payload: {
                                        type: "DM",
                                        conc_id: resp.connectionId,
                                        id: resp.id,
                                        hash: resp.hash,
                                    }
                                })

                                ws.send(JSON.stringify({
                                    type: 'DELETE_ECHO',
                                    data: msg,
                                }))

                            }
                        }
                        
                    }
                    else{
                        if( type === "DM"){
                            if(is_local_echo === false){
                                const id = data.payload.id;
                                const resp = await prisma.directMessage.update({
                                    where: {
                                        id
                                    },
                                    data: {
                                        deleted: true,
                                    }
                                })
                                msg = JSON.stringify({
                                    type: "delete",
                                    payload: {
                                        type: "DM",
                                        conc_id: resp.connectionId,
                                        id: resp.id,
                                        hash: resp.hash
                                    }
                                })
                                conc_id = resp.connectionId;
                            }
                            else{
                                const { hash } = data.payload;
    
                                const resp = await prisma.directMessage.update({
                                    where: {
                                        hash: hash
                                    },
                                    data: {
                                        deleted: true,
                                    }
                                })
                                msg = JSON.stringify({
                                    type: "delete",
                                    payload: {
                                        type: "DM",
                                        conc_id: resp.connectionId,
                                        id: resp.id,
                                        hash: resp.hash,
                                    }
                                })
                                conc_id = resp.connectionId;
                            }
                            RedisSubscriptionManager.get_instance().addChatMessage(conc_id,"DELETE_ECHO",msg);
                            RedisSubscriptionManager.get_instance().addChatMessage(conc_id,"DELETE_NON_ECHO",msg);
        
                        }
                    }
                    
                }catch(err){
                    console.log(err);
                }
            }

            if(data.type === "pin_msg"){
                const { pinned, sender_id, type, is_local_echo } = data.payload;

                if(type === "DM"){
                    let msg;
                    let conc_id;
                    if(is_local_echo === true){
                        const hash: string = data.payload.hash;
                        try{
                            const resp = await prisma.directMessage.update({
                                where: {
                                    hash
                                },
                                data: {
                                    pinned: pinned,
                                },
                                select: {
                                    id: true,
                                    hash: true,
                                    pinned: true,
                                    connectionId: true,
                                }
                            })
                            conc_id = resp.connectionId;
                            msg = JSON.stringify({
                                type: "pin",
                                payload: {
                                    type: "DM",
                                    pinned: resp.pinned,
                                    hash: resp.hash,
                                    id: resp.id,
                                    sender_id,
                                    conc_id:resp.connectionId
                                }
                            })

                        }catch(err){
                            console.log(err);
                        }
                        
                    }else{
                        const msg_id = data.payload.id;

                        try{
                            const resp = await prisma.directMessage.update({
                                where: {
                                    id: msg_id
                                },
                                data: {
                                    pinned: pinned
                                },
                                select:{
                                    id: true,
                                    hash: true,
                                    pinned: true,
                                    connectionId: true,
                                }
                            })

                            conc_id = resp.connectionId;

                            msg = JSON.stringify({
                                type: "pin",
                                payload: {
                                    type: "DM",
                                    pinned: resp.pinned,
                                    hash: resp.hash,
                                    id: resp.id,
                                    sender_id,
                                    conc_id: resp.connectionId
                                }
                            })
                        }catch(err){
                            console.log(err);
                        }
                        if(conc_id !== undefined && msg !== undefined)
                        RedisSubscriptionManager.get_instance().addChatMessage(conc_id,"PIN_MSG_CALLBACK",msg);
                    }
                }
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