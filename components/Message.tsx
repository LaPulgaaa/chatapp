import { Avatar,AvatarFallback } from "./ui/avatar"
import type { RecievedMessage } from "@/app/chat/page"
import { userState } from "@/lib/store/atom/User"
import { useRecoilValue } from "recoil"
export default function Message({data}:{data:RecievedMessage}){
    const {name}=useRecoilValue(userState);
    return <div key={Math.floor(Math.random()*100000)} className={`flex m-4  p-2 rounded-full ${data.payload.message.user===name?'justify-end':''}  `}>
    <Avatar className={`w-[35px] h-[35px] mr-2 bg-gray-200 mt-1 p-4 ${data.payload.message.user===name?'hidden':''}`}>
        
        <AvatarFallback>{data.payload.message.user?.substring(0,2)}</AvatarFallback>
    </Avatar>
    <p className=" border-l-2 pb-2 bg-gray-100 mr-2 italic p-2 px-4 rounded-full">{data.payload.message.content}</p>
    <Avatar className={`w-[35px] h-[35px] mr-2 bg-gray-200 mt-1 p-4 ${data.payload.message.user===name?'':'hidden'}`}>
        
        <AvatarFallback>{data.payload.message.user?.substring(0,2)}</AvatarFallback>
    </Avatar>
    </div>
}