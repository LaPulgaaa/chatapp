import { Avatar,AvatarFallback } from "./ui/avatar"
import type { UnitMessage } from "@/packages/zod";

import { useRecoilValue } from "recoil"
export default function Inbox({data}:{data:UnitMessage}){
    return <div key={Math.floor(Math.random()*100000)} className={`flex m-4 p-2 rounded-full ${data.sender.username==="LaPulgaa"?'justify-end':data.sender.username===''?' justify-center':''}  `}>
    <Avatar className={`w-[35px] h-[35px] border-2 border-slate-400 mr-2 mt-1 p-4 ${data.sender.username==="LaPulgaa"?'hidden':''}`}>
        
        <AvatarFallback>{data.sender.username?.substring(0,2)}</AvatarFallback>
    </Avatar>
    <p className={` border-2 pb-2 mr-2 italic p-2 px-4 rounded-full`}>{data.content}</p>
    <Avatar className={`w-[35px] h-[35px] border-2 border-slate-400  mr-2 mt-1 p-4 ${data.sender.username==="LaPulgaa"?'':'hidden'}`}>
        
        <AvatarFallback>{data.sender.username?.substring(0,2)}</AvatarFallback>
    </Avatar>
    </div>
}