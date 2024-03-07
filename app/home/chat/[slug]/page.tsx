"use client";

import { useEffect, useState } from "react";
import type { ChatMessageData } from "@/packages/zod";
import { ChatMessagesResponseSchema } from "@/packages/zod";
import Inbox from "@/components/Inbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
export default function Chat({params}:{params:{slug:string}}){
    const [messages,setMessages]=useState<ChatMessageData>();

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

    
    if(messages===undefined)
    {
        return <div>Loading....</div>
    }

    const InboxComponent=messages.messages.map((message)=>{
        return <Inbox data={message}/>
    })

    return <div className="h-svh pb-24 ">
        <ScrollArea id="chatbox" className="m-4 h-full rounded-md border ">
            {InboxComponent}
         </ScrollArea>
        <div className="flex">
        </div>
    </div>

}