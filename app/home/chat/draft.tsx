'use client'
import Message from "@/components/Message";
import { Avatar, AvatarImage ,AvatarFallback} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { useRecoilState, useRecoilValue } from "recoil";
import { userState } from "@/lib/store/atom/User";
import { wsState } from "@/lib/store/atom/Socket";
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
const imagesource="https://avatars.githubusercontent.com/u/123243429?v=4";


export default function Chat(){
    let ws:WebSocket;
    const user=useRecoilValue(userState);
    const router=useRouter();
    const [message,setMessage]=useState("");
    const [chat,setChat]=useState<RecievedMessage[]>([]);
    const [wsInstance,setWsInstance]=useRecoilState(wsState);
    useEffect(()=>{
        
        ws=new WebSocket("ws://localhost:3000");
         
        ws.onopen=function(){
            console.log("connection open");
            const data={
                type:"join",
                payload:{
                    roomId:user.roomId!,
                }
            }
            ws.send(JSON.stringify(data));
            setWsInstance(ws);
        }
        return ()=>{ws.close();}
    },[])

    // if(wsInstance===undefined)
    // {
    //      return <div className="grid justify-center">Loading</div>
    // }
    if(wsInstance!==undefined)
    wsInstance.onmessage=function(event){
        const data=JSON.parse(event.data);
        setChat([...chat,data]);
       }

    function sendMessage(){
        const data={
            type:"message",
            payload:{
                roomId:user.roomId!,
                message:{
                    content:message,
                    user:user.name
                }
            }
        }
        setMessage("")
        wsInstance!.send(JSON.stringify(data));
    }

    const chatComp=chat.map((data)=>{
        return <Message data={data}/>
            
    })
    
    

    return <div className="h-lvh mx-32 pb-48">
         <ScrollArea id="chatbox" className="m-4 h-full rounded-md border ">
            {chatComp}
         </ScrollArea>
        <div className="flex">
        <Input 
        className="ml-4"
        value={message} 
        onChange={(e)=>{
            setMessage(e.target.value);
        }}
        type="text" placeholder="Message"/>
        <Button  onClick={sendMessage} className=" ml-4">Send</Button>
        
        </div>
   
    
    </div>
}