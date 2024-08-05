import { Avatar,AvatarFallback } from "./ui/avatar"
import type { UnitMessage } from "@/packages/zod";
import { userDetails } from "@/lib/store/atom/userDetails";
import { useRecoilValue } from "recoil"
export default function Inbox({data}:{data:UnitMessage}){
    const time = (new Date(data.createdAt).toTimeString().split(" ")[0]).split(":").slice(0,-1);
    const {username}=useRecoilValue(userDetails);
    return <div key={data.id} className={`flex m-2 ${data.sender.username===username?'justify-end':data.sender.username===''?' justify-center':''}  `}>
    <Avatar className={`w-[35px] h-[35px] border-2 border-slate-400 mr-2 mt-1 p-4 ${data.sender.username===username?'hidden':''}`}>
        
        <AvatarFallback>{data.sender.username?.substring(0,2)}</AvatarFallback>
    </Avatar>
    <div className={` border-2 pb-1 mr-2 p-2  max-w-prose rounded-md flex`}>
        <p className="italic text-wrap mr-2">{data.content}</p>
        <p className="flex justify-end text-[10px] mt-3 ml-2">{time[0]+":"+time[1]}</p>
    </div>
    <Avatar className={`w-[35px] h-[35px] border-2 border-slate-400  mr-2 mt-1 p-4 ${data.sender.username===username?'':'hidden'}`}>
        
        <AvatarFallback>{data.sender.username?.substring(0,2)}</AvatarFallback>
    </Avatar>
    </div>
}