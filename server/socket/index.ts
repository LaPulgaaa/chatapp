
import { WebSocketServer } from 'ws';
import { RedisSubscriptionManager } from './redisClient';


const users:{
    [wsId:string]:{
        roomId:string,
        ws:any
    }
}={};

let count=0;
export function ws(wss:WebSocketServer){
    
 wss.on("connection",(ws,req:Request)=>{
    const wsId=count++;
        console.log("connection made")

        ws.on("message",(message:string)=>{
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
                RedisSubscriptionManager.get_instance().addChatMessage(roomId,message);
            }

        })
        ws.on("close",()=>{
            // console.log("someone left this room");
            
            if(users[wsId]!==undefined)
            {
                RedisSubscriptionManager.get_instance().unsubscribe(wsId.toString(),users[wsId].roomId);
                RedisSubscriptionManager.get_instance().addChatMessage(users[wsId].roomId,{
                content:"someone just left the room",
                user:"pulgabot"
                })
            }
        })
        
    })


}