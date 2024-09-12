'use client'

import { Avatar,AvatarFallback } from "./ui/avatar"
import type { RecievedMessage } from "@/app/home/chat/[slug]/page"
import { useSession } from "next-auth/react";

export default function Message({data}:{data:RecievedMessage}){
    const session = useSession();

    //@ts-ignore
    const username = session.data?.username

    let initials = data.payload.message.user.substring(0,2);
    const names = data.payload.message.name?.split(" ");
    if(names){
        initials = names.map((name)=> name.charAt(0)).join("");
    }

    let today_at = new Date().toTimeString().split(" ")[0];
    let hour_min = today_at.split(":").slice(0, -1);

    return <div 
    id="recent"
    key={Math.floor(Math.random()*100000)} 
    //@ts-ignore
    className={`flex m-2 ${data.payload.message.user === username ? 'justify-end':data.payload.message.user==='pulgabot'?' justify-center':''}  `}>
    <Avatar 
    className={`w-[35px] h-[35px] mr-2 border-2 border-slate-400 bg-slate-200 dark:bg-slate-900 mt-1 p-4 ${data.payload.
    // @ts-ignore
    message.user === username ? 'hidden':''}`}>
        
        <AvatarFallback>
            {initials}
        </AvatarFallback>
    </Avatar>

    <div className={` border-2 pb-1 mr-2 p-2 bg-slate-200 dark:bg-slate-900  max-w-prose rounded-md flex`}>
        <p className="italic text-wrap">{data.payload.message.content}</p>
        <p className="flex justify-end text-[10px] mt-3 ml-2">{(hour_min[0]+":"+ hour_min[1])}</p>
    </div>
    <Avatar 
    className={`w-[35px] h-[35px] mr-2 border-2 border-slate-400 bg-slate-200 dark:bg-slate-900 mt-1 p-4 ${data.payload.
    // @ts-ignore
    message.user === username ? '':'hidden'}`}>
        <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
    </div>
}