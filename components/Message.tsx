import { useRecoilValue } from "recoil"

import { Avatar,AvatarFallback } from "./ui/avatar"
import type { RecievedMessage } from "@/app/home/chat/[slug]/page"
import { userDetails } from "@/lib/store/atom/userDetails";

export default function Message({data}:{data:RecievedMessage}){
    const {username}=useRecoilValue(userDetails);

    let today_at = new Date().toTimeString().split(" ")[0];
    let hour_min = today_at.split(":").slice(0, -1);

    return <div key={Math.floor(Math.random()*100000)} className={`flex m-2 p-2 ${data.payload.message.user===username?'justify-end':data.payload.message.user==='pulgabot'?' justify-center':''}  `}>
    <Avatar className={`w-[35px] h-[35px] mr-2 border-2 border-slate-400 mt-1 p-4 ${data.payload.message.user===username?'hidden':''}`}>
        
        <AvatarFallback>{data.payload.message.user?.substring(0,2)}</AvatarFallback>
    </Avatar>
    <div className={` border-2 pb-1 mr-2 p-2  max-w-prose rounded-md flex`}>
        <p className="italic text-wrap">{data.payload.message.content}</p>
        <p className="flex justify-end text-[10px] mt-3 ml-2">{(hour_min[0]+":"+ hour_min[1])}</p>
    </div>
    <Avatar className={`w-[35px] h-[35px] mr-2 border-2 border-slate-400 mt-1 p-4 ${data.payload.message.user===username?'':'hidden'}`}>
        
        <AvatarFallback>{data.payload.message.user?.substring(0,2)}</AvatarFallback>
    </Avatar>
    </div>
}