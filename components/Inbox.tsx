import { Avatar,AvatarFallback } from "./ui/avatar"
import type { UnitMessage } from "@/packages/zod";
import { userDetails } from "@/lib/store/atom/userDetails";
import { useRecoilValue } from "recoil"
export default function Inbox({data}:{data:UnitMessage}){
    const {username}=useRecoilValue(userDetails);
    return <div key={data.id} className={`flex m-2 p-2  ${data.sender.username===username?'justify-end':data.sender.username===''?' justify-center':''}  `}>
    <Avatar className={`w-[35px] h-[35px] border-2 border-slate-400 mr-2 mt-1 p-4 ${data.sender.username===username?'hidden':''}`}>
        
        <AvatarFallback>{data.sender.username?.substring(0,2)}</AvatarFallback>
    </Avatar>
    <p className={` border-2 pb-2 mr-2 italic p-2 px-4 text-wrap max-w-prose rounded-md`}>{data.content}</p>
    <Avatar className={`w-[35px] h-[35px] border-2 border-slate-400  mr-2 mt-1 p-4 ${data.sender.username===username?'':'hidden'}`}>
        
        <AvatarFallback>{data.sender.username?.substring(0,2)}</AvatarFallback>
    </Avatar>
    </div>
}