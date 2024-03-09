import { Avatar,AvatarFallback } from "./ui/avatar"
import type { RecievedMessage } from "@/app/home/chat/draft"
import { userDetails } from "@/lib/store/atom/userDetails";
import { useRecoilValue } from "recoil"
export default function Message({data}:{data:RecievedMessage}){
    const {username}=useRecoilValue(userDetails);
    console.log(username+"--"+data.payload.message.user)
    return <div key={Math.floor(Math.random()*100000)} className={`flex m-4  p-2 rounded-full ${data.payload.message.user===username?'justify-end':data.payload.message.user==='mybot'?' justify-center':''}  `}>
    <Avatar className={`w-[35px] h-[35px] mr-2 border-slate-400 mt-1 p-4 ${data.payload.message.user===username?'hidden':''}`}>
        
        <AvatarFallback>{data.payload.message.user?.substring(0,2)}</AvatarFallback>
    </Avatar>
    <p className={` border-l-2 pb-2  mr-2 italic p-2 px-4 rounded-full`}>{data.payload.message.content}</p>
    <Avatar className={`w-[35px] h-[35px] mr-2 border-slate-400 mt-1 p-4 ${data.payload.message.user===username?'':'hidden'}`}>
        
        <AvatarFallback>{data.payload.message.user?.substring(0,2)}</AvatarFallback>
    </Avatar>
    </div>
}