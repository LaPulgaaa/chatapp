import {createClient} from 'redis';
import { RedisClientType } from 'redis';
import WebSocket from 'ws';


export class RedisSubscriptionManager{
    private static instance:RedisSubscriptionManager;
    private subscriber:RedisClientType;
    public publisher:RedisClientType;
    public subscription:Map<string,string[]>;//contains record with key as userId and value as array of roomId he is subscribed to 
    public reverseSubscription:Map<string,{
        [userId:string]:{
            userId:string,
            ws:any,
            uuid: string,
        }
    }>;

    private constructor(){
        this.subscriber=createClient();
        this.subscriber.connect();
        this.publisher=createClient();
        this.publisher.connect();
        this.subscription=new Map<string,string[]>();
        this.reverseSubscription=new Map<string,{
            [userId:string]:{
                userId:string,
                ws:WebSocket,
                uuid: string,
            }
        }>();
    }

    static get_instance(){
        if(!this.instance){
            this.instance = new RedisSubscriptionManager();
        }

        return this.instance;
    }

    bulk_subscribe(wss: any, room_ids: string[], userId: string, uuid: string){
        this.subscription.set(userId,[...(this.subscription.get(userId) ?? []), ...room_ids]);

        room_ids.forEach((roomId)=>{
            this.reverseSubscription.set(roomId,{
                ...(this.reverseSubscription.get(roomId) || {}),
                [userId]:{
                    userId:userId,
                    ws:wss,
                    uuid,
                }
            })
    
    
            if(Object.keys(this.reverseSubscription.get(roomId)||{}).length==1){
                //first one in this room
    
                this.subscriber.subscribe(roomId,(payload)=>{
                    try{
                        Object.values(this.reverseSubscription.get(roomId)||{}).forEach(({ws})=>{
                            ws.send(payload);
                        })
                    }catch(err)
                    {
                        console.log(err);
                    }
                })
            }
        })
    }

    subscribe(wss: WebSocket, roomId: string, userId: string, uuid: string){
        this.subscription.set(userId, [...this.subscription.get(userId) ?? [],roomId]);

        this.reverseSubscription.set(roomId, {
            ...this.reverseSubscription.get(roomId) ?? {},
            [userId]:{
                userId,
                ws: wss,
                uuid
            }
        });

        if(Object.keys(this.reverseSubscription.get(roomId)||{}).length==1){
            //first one in this room

            this.subscriber.subscribe(roomId,(payload)=>{
                try{
                    Object.values(this.reverseSubscription.get(roomId)||{}).forEach(({ws})=>{
                        ws.send(payload);
                    })
                }catch(err)
                {
                    console.log(err);
                }
            })
        }
    }

    bulk_unsubscribe(userId: string, rooms: string[]){
        this.subscription.set(
            userId,
            []
        );
        this.subscription.delete(userId);

        rooms.map((room)=>{
            if(this.reverseSubscription.has(room)){
                delete this.reverseSubscription.get(room)![userId];
            }
            if(!this.reverseSubscription.get(room)||
            Object.keys(this.reverseSubscription.get(room)||{}).length===0){
                this.subscriber.unsubscribe(room);
                this.reverseSubscription.delete(room);
            }
        })
    }

    async addChatMessage(roomId:string,type: string,data: string){
        this.publisher.publish(roomId,JSON.stringify({
            type,
            data
        }))
    }

    getRoomMembers(roomId: string){
        const member_details = this.reverseSubscription.get(roomId);
        if(member_details === undefined){
            return new Set([]);
        }
        const member_ids = Object.values(member_details).flatMap((member)=> {
            if(member.uuid)
                return member.uuid
            return [];
        })
        return new Set(member_ids);
    }
}