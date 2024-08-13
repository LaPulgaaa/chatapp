import { WebSocketServer } from 'ws';
import { RedisSubscriptionManager } from './redisClient';
import { createClient } from 'redis';

const client=createClient();

const users:{
    [wsId:string]:{
        roomId:string,
        ws:any
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
            console.log(data);
            if(data.type==="join")
            {

                console.log("someone joined the room");
                users[wsId]={
                    roomId:data.payload.roomId,
                    ws
                }

                RedisSubscriptionManager.get_instance().handleSubscription(data.payload.roomId,ws,wsId.toString())
            }

            if(data.type==="message")
            {
                console.log("someone sent a message");
                const roomId=users[wsId].roomId;
                const message=data.payload.message;
                const {id, ...content} = message;
                RedisSubscriptionManager.get_instance().addChatMessage(roomId,content);

                await client.lPush("message",JSON.stringify({
                    content:message.content,
                    chatId:roomId,
                    memberId:id
                }))
            }

            if(data.type === "leave"){
                RedisSubscriptionManager.get_instance().unsubscribe(wsId.toString(),data.payload.roomId);
            }

        })
        ws.on("close",()=>{
            // console.log("someone left this room");

            if(users[wsId]!==undefined)
            {
                RedisSubscriptionManager.get_instance().unsubscribe(wsId.toString(),users[wsId].roomId);
                delete users[wsId];
                count--;
            }
        })
        
    })


}