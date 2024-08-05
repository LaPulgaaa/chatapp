"use client";

import { useEffect, useState } from "react";
import Message from "@/components/Message";
import type { ChatMessageData } from "@/packages/zod";
import { chat_messages_response_schema } from "@/packages/zod";
import Inbox from "@/components/Inbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRecoilValue, useRecoilState} from "recoil";
import { userDetails } from "@/lib/store/atom/userDetails";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ListEndIcon,} from "lucide-react";
import { DarkLight } from "@/components/DarkLight";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { user_chat_uuid } from "../../page";
import { leave_room } from "../../util";
import { UserStateChats } from "@/lib/store/atom/chats";

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
    const [realtimechat, setRealtimechat] = useState<JSX.Element[]>([]);
    const [compose,setCompose]=useState<string>("");
    const [chat,setChat]=useState<RecievedMessage[]>([]);
    const creds=useRecoilValue(userDetails);
    const [ws,setWs]=useState<WebSocket>();
    const [did,setDid]=useState<number>();
    const [rooms,setRooms]=useRecoilState(UserStateChats)
    const router=useRouter();
    useEffect(()=>{
        async function fetch_messages(){
            try{
                const resp=await fetch(`http://localhost:3001/chat/getMessage`,{
                    method:'POST',
                    body:JSON.stringify({
                        chat_id:params.slug,
                        user_id:creds.id
                    }),
                    headers:{
                        'Content-Type':"application/json"
                    },
                    credentials:"include"
                });
                const {raw_data,directory_id}=await resp.json();
                setDid(directory_id);

                const data=chat_messages_response_schema.parse(raw_data);
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
        
        let ws=new WebSocket("ws://localhost:3001");
         
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
        return ()=>{
            if(ws.OPEN === 1){
                ws.close();
            }
        }
    },[])

    if(ws!==undefined)
    ws.onmessage=function(event){
        const data=JSON.parse(event.data);
        console.log("recieved a message"+data) 
        setChat([...chat,data]);
        setRealtimechat([...realtimechat, <Message data={data}/>])
       }
    
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
            const resp=await fetch('http://localhost:3001/chat/updateFrom',{
                method:'PATCH',
                body:JSON.stringify({
                    date:new Date(),
                    did:did,
                    user_id:creds.id,
                    chat_id:params.slug
                }),
                headers:{
                    'Content-Type':"application/json"
                },
                credentials:"include"
            })
            if(resp.status===200)
            {
                setChat([]);
                setMessages({messages:[]})
                alert("Chat cleaned!")
            }
        }

    }
    async function may_be_leave_room(){
        const opcode_id=user_chat_uuid.get(params.slug);
        if(opcode_id===undefined || creds.id === undefined)
        {
            alert("Could not leave the chat!");
            return ;
        }

        const is_deleted = await leave_room({
            member_id: creds.id,
            chat_id: params.slug,
            conn_id: opcode_id
        });

        if(is_deleted){
            const left_rooms = rooms.filter((room)=>room.id!=params.slug);
            setRooms(left_rooms);
            router.push("/home");
        }
    }

    if(messages===undefined)
    {
        return <div>Loading....</div>
    }

    const InboxComponent=messages.messages.map((message)=>{
        return <Inbox data={message}/>
    })

    return <div className="h-svh pb-24 mt-4">
            <div className="flex justify-between">
                <Button variant={`outline`} size={`icon`} className="ml-4"
                    onClick={()=>router.push("/home")}
                    ><ChevronLeftIcon/>
                </Button>
                <div className="flex mr-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size={`icon`} variant={`outline`} className="mr-4">
                            <ListEndIcon/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={may_be_leave_room} className="cursor-pointer">
                            Leave Room
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={deleteChat} className="cursor-pointer">
                           Delete Chat
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DarkLight/>
                </div>
                               
            </div>
            
            <ScrollArea id="chatbox" className="m-4 h-full flex flex-col pb-10  rounded-md border">
                {InboxComponent}
                {realtimechat}
                <div className="absolute bottom-0 w-full mb-3 flex">
                <Input 
                className="ml-4" 
                value={compose}
                onChange={(e)=>setCompose(e.target.value)}
                onKeyDown={(e)=>{
                    if(e.key==="Enter")
                    sendMessage();
                }}
                type="text" placeholder="Message"/>
                <Button onClick={sendMessage} className="mx-4">Send</Button>
                </div>
            </ScrollArea>
        </div>

}