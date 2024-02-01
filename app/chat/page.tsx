'use client'
import Message from "@/components/Message";
import { Avatar, AvatarImage ,AvatarFallback} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
export type RecievedMessage={
    type:string,
    payload:{
        roomId:string,
        message:string
    }
}
const imagesource="https://avatars.githubusercontent.com/u/123243429?v=4";

const routerState=history.state;
export default function Chat(){
    let ws:WebSocket;
    const [room,setRoom]=useState("");
    const router=useRouter();
    const [message,setMessage]=useState("");
    const [chat,setChat]=useState<RecievedMessage[]>([]);
    const [wsInstance,setWsInstance]=useState<WebSocket>();
    // console.log(chat);
    useEffect(()=>{
        console.log();
        setRoom(routerState.roomId);
         ws=new WebSocket("ws://localhost:3000");
         
        ws.onopen=function(){
            console.log("connection open");
            const data={
                type:"join",
                payload:{
                    roomId:routerState.roomId.toString(),
                }
            }
            ws.send(JSON.stringify(data));
            setWsInstance(ws);
        }
        return ()=>{ws.close();}
    },[])
    if(wsInstance!=undefined)
    {
         wsInstance.onmessage=function(event){
         const data=JSON.parse(event.data);
         console.log(data) 
         setChat([...chat,data]);
        }
    }
    function sendMessage(){
        const data={
            type:"message",
            payload:{
                roomId:room,
                message
            }
        }
        setMessage("")
        wsInstance!.send(JSON.stringify(data));
    }

    const chatComp=chat.map((data)=>{
        return <Message data={data}/>
            
    })
    
    return <div className="h-full m-32">
         <ScrollArea className="h-72 m-4 rounded-md border">
            {chatComp}
         </ScrollArea>
        <div className=" flex ">
        <Input 
        className="inline"
        value={message} 
        onChange={(e)=>{
            setMessage(e.target.value);
        }}
        type="text" placeholder="Message"/>
        <Button  onClick={sendMessage} className=" ml-4">Send</Button>
        
    </div>
   
    
    </div>
}