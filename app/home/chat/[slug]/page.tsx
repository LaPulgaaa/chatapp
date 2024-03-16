"use client";

import { useEffect, useState } from "react";
import Message from "@/components/Message";
import type { ChatMessageData } from "@/packages/zod";
import { ChatMessagesResponseSchema } from "@/packages/zod";
import Inbox from "@/components/Inbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRecoilState, useRecoilValue} from "recoil";
import { wsState } from "@/lib/store/atom/Socket";
import { userDetails } from "@/lib/store/atom/userDetails";
import { useRouter } from "next/navigation";
export type RecievedMessage={
    type:string,
    payload:{
        roomId:string,
        message:{
            content:string,
            user:string
        }
    }
}
export default function Chat({params}:{params:{slug:string}}){
    const [messages,setMessages]=useState<ChatMessageData>();
    const [compose,setCompose]=useState<string>("");
    const [chat,setChat]=useState<RecievedMessage[]>([]);
    const creds=useRecoilValue(userDetails);
    const [ws,setWs]=useRecoilState(wsState);
    const router=useRouter();
    useEffect(()=>{
        async function fetch_messages(){
            try{
                const resp=await fetch(`http://localhost:3000/chat/getMessage/${params.slug}`);
                const {raw_data}=await resp.json();
                const data=ChatMessagesResponseSchema.parse(raw_data);
                // Parse this data using zod.
                setMessages(data);
                
               
            }catch(err)
            {
                alert(err);
                console.log(err)
            }
        }
        fetch_messages();
    },[])

    useEffect(()=>{
        
        let ws=new WebSocket("ws://localhost:3000");
         
        ws.onopen=function(){
            console.log("connection open");
            const data={
                type:"join",
                payload:{
                    roomId:params.slug!,
                }
            }
            ws.send(JSON.stringify(data));
            setWs(ws);
        }
        return ()=>{ws.close();}
    },[])

    if(ws!==undefined)
    ws.onmessage=function(event){
        const data=JSON.parse(event.data);
        console.log("recieved a message"+data) 
        setChat([...chat,data]);
       }
    
       const RealtimeChats=chat.map((data)=>{
        return <Message data={data}/>
            
        })

    function sendMessage(){
        const data={
            type:"message",
            payload:{
                roomId:params.slug,
                message:{
                    content:compose,
                    user:creds.username,
                    id:creds.id
                }
            }
        }
        setCompose("")
        ws!.send(JSON.stringify(data));
    }

    if(messages===undefined)
    {
        return <div>Loading....</div>
    }

    const InboxComponent=messages.messages.map((message)=>{
        return <Inbox data={message}/>
    })

    return <div className="h-svh pb-32 ">
            <Button className="ml-4"
            onClick={()=>router.push("/home")}
            >Back  </Button>
            <ScrollArea id="chatbox" className="m-4 h-full flex flex-col pb-8  rounded-md border">
                {InboxComponent}
                {RealtimeChats}
                <div className="absolute bottom-0 w-full mb-3 flex">
                <Input 
                className="ml-4" 
                value={compose}
                onChange={(e)=>setCompose(e.target.value)}
                type="text" placeholder="Message"/>
                <Button onClick={sendMessage} className="mx-4">Send</Button>
                </div>
            </ScrollArea>
        </div>

}