import { WebSocketServer } from 'ws';
import { RedisSubscriptionManager } from './redisClient';
import { createClient } from 'redis';

const client=createClient();

const users:{
    [wsId:string]:{
        roomId:string,
        ws:any,
        userId?: string,
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

                users[wsId]={
                    roomId:data.payload.roomId,
                    ws,
                    userId: data.payload.userId,
                }

                RedisSubscriptionManager.get_instance().handleSubscription(
                    data.payload.roomId,
                    ws,
                    wsId.toString(),
                    data.payload.userId
                );
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

            if(data.type==="message")
            {
                const roomId=users[wsId].roomId;
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
                RedisSubscriptionManager.get_instance().unsubscribe(wsId.toString(),data.payload.roomId);
            }

        })
        ws.on("close",()=>{

            if(users[wsId]!==undefined)
            {
                RedisSubscriptionManager.get_instance().unsubscribe(wsId.toString(),users[wsId].roomId);
                delete users[wsId];
            }
        })
        
    })


}