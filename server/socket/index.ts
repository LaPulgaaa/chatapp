import { WebSocketServer } from 'ws';
import { RedisSubscriptionManager } from './redisClient';
import { createClient } from 'redis';
import { prisma } from '../../packages/prisma/prisma_client';

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
                            userId,
                        },
                        select:{
                            chat_id: true,
                        }
                    });
                    const rooms_arr = rooms_subscribed.map((rooms)=> rooms.chat_id);
                    RedisSubscriptionManager.get_instance().bulk_subscribe(ws,rooms_arr,wsId.toString(),userId);
                }catch(err){
                    console.log(err);
                }
            }

            if(data.type === "add_room"){
                const userId = data.payload.userId;
                const roomId = data.payload.roomId;

                RedisSubscriptionManager.get_instance().subscribe(ws,roomId,wsId.toString(),userId);
            }

            if(data.type === "bulk_leave"){
                const userId = data.payload.userId;
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
                }catch(err){
                    console.log(err);
                }
                
            }

            if(data.type==="message")
            {
                const roomId=data.payload.roomId;
                const message=data.payload.message;
                const {id, ...content} = message;
                const msg_data = JSON.stringify({
                    type:"message",
                    payload:{
                        roomId,
                        message: content
                    }
                });
                RedisSubscriptionManager.get_instance().addChatMessage(roomId,"MSG_CALLBACK",msg_data);

                await client.lPush("message",JSON.stringify({
                    content:message.content,
                    chatId:roomId,
                    memberId:id
                }))
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