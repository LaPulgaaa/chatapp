import {createClient} from 'redis';
import { RedisClientType } from 'redis';


export class RedisSubscriptionManager{
    private static instance:RedisSubscriptionManager;
    private subscriber:RedisClientType;
    public publisher:RedisClientType;
    public subscription:Map<string,string[]>;//contains record with key as userId and value as array of roomId he is subscribed to 
    public reverseSubscription:Map<string,{
        [userId:string]:{
            userId:string,
            ws:any
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
                ws:WebSocket
            }
        }>();
    }

    static get_instance(){
        if(!this.instance){
            return new RedisSubscriptionManager();
        }

        return this.instance;
    }

    handleSubscription(roomId:string,wss:any,userId:string){

        this.subscription.set(userId,[...(this.subscription.get(userId))||[],roomId]);

        this.reverseSubscription.set(roomId,{
            ...(this.reverseSubscription.get(roomId) || {}),
            [userId]:{
                userId:userId,
                ws:wss
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
    }

    async addChatMessage(roomId:string,message:{content:string,user:string}){
        this.publisher.publish(roomId,JSON.stringify({
            type:"message",
            payload:{
                roomId,
                message
            }
        }))
    }
}