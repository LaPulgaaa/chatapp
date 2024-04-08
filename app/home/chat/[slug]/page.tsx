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
import { ChevronLeftIcon, ListEndIcon,} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

function get_opcode_id(id?:string,messages?:ChatMessageData):string | undefined{
    if(id===undefined || messages===undefined)
    return undefined;
    const target_opcode=`chat_${id}`;
    const data=messages.messages;
    for(let i=0;i<data.length;i++)
    {
        if(data[i].content===target_opcode){
            return data[i].id;
        }
    }
    return undefined;
}
export default function Chat({params}:{params:{slug:string}}){
    const [messages,setMessages]=useState<ChatMessageData>();
    const [compose,setCompose]=useState<string>("");
    const [chat,setChat]=useState<RecievedMessage[]>([]);
    const creds=useRecoilValue(userDetails);
    const [ws,setWs]=useRecoilState(wsState);
    const [did,setDid]=useState<number>();
    const router=useRouter();
    useEffect(()=>{
        async function fetch_messages(){
            try{
                const resp=await fetch(`http://localhost:3000/chat/getMessage`,{
                    method:'POST',
                    body:JSON.stringify({
                        chat_id:params.slug,
                        user_id:creds.id
                    }),
                    headers:{
                        'Content-Type':"application/json"
                    }
                });
                const {raw_data,directory_id}=await resp.json();
                setDid(directory_id);

                const data=ChatMessagesResponseSchema.parse(raw_data);
                // Parse this data using zod.
                setMessages(data);
                
               
            }catch(err)
            {
                alert(err);
                console.log(err);
                router.back();
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
    async function deleteChat(){
        if(did===undefined)
        {
            alert("This chat does not support this feature.")
            return;
        }
        else{
            const resp=await fetch('http://localhost:3000/chat/updateFrom',{
                method:'PATCH',
                body:JSON.stringify({
                    date:new Date(),
                    did:did,
                    user_id:creds.id,
                    chat_id:params.slug
                }),
                headers:{
                    'Content-Type':"application/json"
                }
            })
            if(resp.status===200)
            {
                setChat([]);
                setMessages({messages:[]})
                alert("Chat cleaned!")
            }
        }

    }
    async function leaveRoom(){
        const opcode_id=get_opcode_id(creds.id,messages);
        if(opcode_id===undefined)
        return;

        try{
            const resp=await fetch(`http://localhost:3000/chat/leaveChat`,{
                method:'DELETE',
                body:JSON.stringify({
                    memberId:creds.id,
                    chatId:params.slug,
                    id:opcode_id
                }),
                headers:{
                    'Content-Type':"application/json"
                }
            })
            if(resp.status===204)
            {
                router.push("/home");
            }
        }catch(err){
            console.log(err)
            alert("could not leave room!")
        }
    }

    if(messages===undefined)
    {
        return <div>Loading....</div>
    }

    const InboxComponent=messages.messages.map((message)=>{
        return <Inbox data={message}/>
    })

    return <div className="h-svh pb-32 ">
            <div className="flex justify-between">
                <Button variant={`outline`} size={`icon`} className="ml-4"
                    onClick={()=>router.push("/home")}
                    ><ChevronLeftIcon/>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size={`icon`} variant={`outline`} className="mr-4">
                            <ListEndIcon/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={leaveRoom} className="cursor-pointer">
                            Leave Room
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={deleteChat} className="cursor-pointer">
                           Delete Chat
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                
            </div>
            
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