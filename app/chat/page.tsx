'use client'

import { Avatar, AvatarImage ,AvatarFallback} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react"

type RecievedMessage={
    type:string,
    payload:{
        roomId:string,
        message:string
    }
}

export default function Chat(){
    let ws:WebSocket;
    const [message,setMessage]=useState("");
    const [chat,setChat]=useState<RecievedMessage[]>([]);
    const [wsInstance,setWsInstance]=useState<WebSocket>();
    // console.log(chat);
    useEffect(()=>{
         ws=new WebSocket("ws://localhost:3000");
         
        ws.onopen=function(){
            console.log("connection open");
            const data={
                type:"join",
                payload:{
                    roomId:"1",
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
                roomId:"1",
                message
            }
        }
        wsInstance!.send(JSON.stringify(data));
    }

    const chatComp=chat.map((data)=>{
        return <div key={Math.floor(Math.random()*100000)} className="flex m-4">
            <Avatar className="w-[30px] h-[30px]">
                <AvatarImage src="https://avatars.githubusercontent.com/u/123243429?v=4" alt="gitProfile"/>
                <AvatarFallback>VS</AvatarFallback>
            </Avatar>
            <p className=" border-l-2 pt-1 mr-2 italic ">{data.payload.message}</p>
        </div>
    })
    
    return <div className="w-[550px] m-32">
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
    {chatComp}
    </div>
}