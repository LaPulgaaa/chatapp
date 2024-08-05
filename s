[1mdiff --git a/app/page.tsx b/app/page.tsx[m
[1mindex 61e6755..b298a04 100644[m
[1m--- a/app/page.tsx[m
[1m+++ b/app/page.tsx[m
[36m@@ -21,7 +21,7 @@[m [mexport default function Home() {[m
 [m
         const {msg,data}=await resp.json();[m
 [m
[31m-        if(msg==="user identified"){[m
[32m+[m[32m        if(msg==="user identified" && window.localStorage.getItem("token") == "valid"){[m
           console.log("cookie still alive");[m
 [m
           setUserDetails({[m
[1mdiff --git a/components/Inbox.tsx b/components/Inbox.tsx[m
[1mindex 58547a0..dd34cac 100644[m
[1m--- a/components/Inbox.tsx[m
[1m+++ b/components/Inbox.tsx[m
[36m@@ -3,13 +3,17 @@[m [mimport type { UnitMessage } from "@/packages/zod";[m
 import { userDetails } from "@/lib/store/atom/userDetails";[m
 import { useRecoilValue } from "recoil"[m
 export default function Inbox({data}:{data:UnitMessage}){[m
[32m+[m[32m    const time = (new Date(data.createdAt).toTimeString().split(" ")[0]).split(":").slice(0,-1);[m
     const {username}=useRecoilValue(userDetails);[m
[31m-    return <div key={data.id} className={`flex m-2 p-2  ${data.sender.username===username?'justify-end':data.sender.username===''?' justify-center':''}  `}>[m
[32m+[m[32m    return <div key={data.id} className={`flex m-2 ${data.sender.username===username?'justify-end':data.sender.username===''?' justify-center':''}  `}>[m
     <Avatar className={`w-[35px] h-[35px] border-2 border-slate-400 mr-2 mt-1 p-4 ${data.sender.username===username?'hidden':''}`}>[m
         [m
         <AvatarFallback>{data.sender.username?.substring(0,2)}</AvatarFallback>[m
     </Avatar>[m
[31m-    <p className={` border-2 pb-2 mr-2 italic p-2 px-4 text-wrap max-w-prose rounded-md`}>{data.content}</p>[m
[32m+[m[32m    <div className={` border-2 pb-1 mr-2 p-2  max-w-prose rounded-md flex`}>[m
[32m+[m[32m        <p className="italic text-wrap mr-2">{data.content}</p>[m
[32m+[m[32m        <p className="flex justify-end text-xs mt-3 ml-2">{time[0]+":"+time[1]}</p>[m
[32m+[m[32m    </div>[m
     <Avatar className={`w-[35px] h-[35px] border-2 border-slate-400  mr-2 mt-1 p-4 ${data.sender.username===username?'':'hidden'}`}>[m
         [m
         <AvatarFallback>{data.sender.username?.substring(0,2)}</AvatarFallback>[m
[1mdiff --git a/components/Message.tsx b/components/Message.tsx[m
[1mindex b64c896..cb7e48a 100644[m
[1m--- a/components/Message.tsx[m
[1m+++ b/components/Message.tsx[m
[36m@@ -4,12 +4,16 @@[m [mimport { userDetails } from "@/lib/store/atom/userDetails";[m
 import { useRecoilValue } from "recoil"[m
 export default function Message({data}:{data:RecievedMessage}){[m
     const {username}=useRecoilValue(userDetails);[m
[32m+[m[32m    const curr_time = new Date();[m
     return <div key={Math.floor(Math.random()*100000)} className={`flex m-2 p-2 ${data.payload.message.user===username?'justify-end':data.payload.message.user==='pulgabot'?' justify-center':''}  `}>[m
     <Avatar className={`w-[35px] h-[35px] mr-2 border-2 border-slate-400 mt-1 p-4 ${data.payload.message.user===username?'hidden':''}`}>[m
         [m
         <AvatarFallback>{data.payload.message.user?.substring(0,2)}</AvatarFallback>[m
     </Avatar>[m
[31m-    <p className={` border-l-2 pb-2 border-2  mr-2 italic p-2 px-4 rounded-lg text-wrap max-w-prose`}>{data.payload.message.content}</p>[m
[32m+[m[32m    <div className={` border-2 pb-1 mr-2 p-2  max-w-prose rounded-md flex`}>[m
[32m+[m[32m        <p className="italic text-wrap">{data.payload.message.content}</p>[m
[32m+[m[32m        <p className="flex justify-end text-xs mt-3 ml-2">{(curr_time.getHours() +":"+ curr_time.getMinutes())}</p>[m
[32m+[m[32m    </div>[m
     <Avatar className={`w-[35px] h-[35px] mr-2 border-2 border-slate-400 mt-1 p-4 ${data.payload.message.user===username?'':'hidden'}`}>[m
         [m
         <AvatarFallback>{data.payload.message.user?.substring(0,2)}</AvatarFallback>[m
