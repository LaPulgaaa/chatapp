"use client";
import { useRef } from "react";

import { Signal } from "@/app/home/signal";

import { useEffect, useState } from "react";

import { useSession } from "next-auth/react";
import Inbox from "@/components/Inbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRecoilValue, useRecoilState} from "recoil";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon, ListEndIcon,} from "lucide-react";
import { DarkLight } from "@/components/DarkLight";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { user_chat_uuid } from "@/app/home/page";
import Message from "@/components/Message";
import type { ChatMessageData } from "@/packages/zod";
import { chat_messages_response_schema } from "@/packages/zod";
import { leave_room } from "@/app/home/util";
import { UserStateChats } from "@/lib/store/atom/chats";
import { RoomHeaderDetails } from "@/packages/zod";
import { get_room_details } from "./action";
import { room_member_details_schema } from "@/packages/zod";
import { isSidebarHidden } from "@/lib/store/atom/sidebar";
import { member_online_state } from "@/lib/store/atom/status";

export type RecievedMessage={
    type:string,
    payload:{
        roomId:string,
        message:{
            content:string,
            user:string,
            name?: string,
        }
    }
}

export default function Chat({params}:{params:{slug:string}}){
    const chat_ref = useRef<HTMLDivElement>(null);
    const [messages,setMessages]=useState<ChatMessageData>();
    const [realtimechat, setRealtimechat] = useState<JSX.Element[]>([]);
    const [compose,setCompose]=useState<string>("");
    const [chat,setChat]=useState<RecievedMessage[]>([]);
    const session = useSession();
    const [did,setDid]=useState<number>();
    const [rooms,setRooms]=useRecoilState(UserStateChats);
    const [ishidden,setIshidden] = useRecoilState(isSidebarHidden) 
    const [disable,setDisable] = useState(true);
    const router=useRouter();
    const [room_details,setRoomDetails] = useState<RoomHeaderDetails>();
    const room_id = params.slug;
    //@ts-ignore
    const user_id = session.data?.id;
    const [memberStatus,setMemberStatus] = useRecoilState(member_online_state);
    
    useEffect(()=>{
        async function fetch_messages(){
            if(session.status !== "authenticated")
                return ;
            try{
                const resp=await fetch(`http://localhost:3001/chat/getMessage`,{
                    method:'POST',
                    body:JSON.stringify({
                        chat_id:params.slug,
                        //@ts-ignore
                        user_id:session.data.id
                    }),
                    headers:{
                        'Content-Type':"application/json"
                    },
                    credentials:"include"
                });
                const {raw_data,directory_id}=await resp.json();
                setDid(directory_id);

                const data=chat_messages_response_schema.parse(raw_data);
                setMessages(data);
                
               
            }catch(err)
            {
                alert(err);
                console.log(err);
                router.back();
            }
        }
        fetch_messages();

        const fetch_room_details = async() => {
            const resp = await get_room_details(params.slug);
            if(resp !== undefined)
                setRoomDetails(resp);
        }

        fetch_room_details();
    },[session.status])

    useEffect(()=>{
        if(room_id !== undefined && session.status === "authenticated" )
        {
            //@ts-ignore
            Signal.get_instance(session.data.id).SUBSCRIBE(params.slug, session.data.id, session.data.username);
            Signal.get_instance().REGISTER_CALLBACK("MSG_CALLBACK",recieve_msg);
            Signal.get_instance().REGISTER_CALLBACK("ONLINE_CALLBACK",update_member_online_status);
        }

        
        return ()=>{
            if(room_id !== undefined && session.status === "authenticated")
            {
                //@ts-ignore
                Signal.get_instance().UNSUBSCRIBE(params.slug,session.data.username);
                Signal.get_instance().DEREGISTER("MSG_CALLBACK");
                Signal.get_instance().DEREGISTER("ONLINE_CALLBACK");
            }
        }
    },[room_id,user_id])
    function recieve_msg(raw_data: string){
        const data:RecievedMessage = JSON.parse(`${raw_data}`);
        console.log("recieved a message"+data) 
        setChat([...chat,data]);
        setRealtimechat((realtimechat)=>[...realtimechat, <Message  key={(session.data?.user?.email?.substring(5) || "")+Date.now()} data={data}/>])
    }

    function update_member_online_status(raw_data: string){
        const data = JSON.parse(`${raw_data}`);
        const type: "MemberJoins" | "MemberLeaves" = data.type;
        const member = memberStatus.find((m) => m.username === data.payload.username);
        if(member !== undefined){
            const other_members = memberStatus.filter((m)=> m.username !== data.payload.username);
            setMemberStatus((memberStatus)=>[{...member, active: type === "MemberJoins" ? true : false},...other_members])
        }
    }

    useEffect(()=>{
            const chat_node = chat_ref.current;
            if(chat_node!==null)
            {
                const chat_history_comps = chat_node.querySelectorAll("#history");
                if(chat_history_comps.length < 1)
                    return;
                const last_comp_idx = chat_history_comps.length - 1;
                chat_history_comps[last_comp_idx].scrollIntoView({
                    behavior: "instant",
                    inline: "center"
                })
            }
    },[messages])

    useEffect(()=>{
        const chat_node = chat_ref.current;
        if(chat_node!==null)
        {
            const recent_msg_comps = chat_node.querySelectorAll("#recent");
            if(recent_msg_comps.length < 1)
                return;
            const last_recent_idx = recent_msg_comps.length - 1;
            recent_msg_comps[last_recent_idx].scrollIntoView({
                behavior: "smooth",
                inline: "center"
            })
        }
    },[chat])

    useEffect(()=>{
        if(compose.trim().length>0)
            setDisable(false);
        else
            setDisable(true);
    },[compose])

    function sendMessage(){
        const data={
            type:"message",
            payload:{
                roomId:params.slug,
                message:{
                    content:compose,
                    //@ts-ignore
                    user:session.data!.username,
                    name: session.data!.user?.name,
                    //@ts-ignore
                    id:session.data!.id,
                }
            }
        }
        setCompose("")
        Signal.get_instance().SEND(JSON.stringify(data));
    }
    async function deleteChat(){
        if(did===undefined)
        {
            alert("This chat does not support this feature.")
            return;
        }
        else{
            const resp=await fetch('http://localhost:3001/chat/updateFrom',{
                method:'PATCH',
                body:JSON.stringify({
                    date:new Date(),
                    did:did,
                    //@ts-ignore
                    user_id: session.data!.id,
                    chat_id:params.slug
                }),
                headers:{
                    'Content-Type':"application/json"
                },
                credentials:"include"
            })
            if(resp.status===200)
            {
                setChat([]);
                setMessages({messages:[]})
                alert("Chat cleaned!")
            }
        }

    }
    async function may_be_leave_room(){
        const opcode_id=user_chat_uuid.get(params.slug);
        if(opcode_id===undefined || session.status === "authenticated")
        {
            alert("Could not leave the chat!");
            return ;
        }

        const is_deleted = await leave_room({
            //@ts-ignore
            member_id: session.data?.id,
            chat_id: params.slug,
            conn_id: opcode_id
        });

        if(is_deleted){
            const left_rooms = rooms.filter((room)=>room.id!=params.slug);
            setRooms(left_rooms);
            router.push("/home");
        }
    }

    if(messages===undefined)
    {
        return <div>Loading....</div>
    }

    const InboxComponent=messages.messages.map((message)=>{
        return <Inbox key={message.id} data={message}/>
    })

    return <div className="h-svh pb-24 mt-4">
            <div className="flex justify-between">
                    <Button variant={`outline`} size={`icon`} className="ml-4"
                        onClick={()=>router.push("/home")}
                        ><ChevronLeftIcon/>
                    </Button>
                {
                    room_details && (
                        <>
                        <div
                        className="w-full flex justify-between mx-2 mr-4 border-[1.5px] border-slate-800 rounded">
                            <div className="w-full flex px-3 pt-1 mx-2 ">
                                <h4 className="scroll-m-20 text-xl pb-1 font-semibold tracking-tight mr-3">
                                {room_details.name}
                                </h4>
                                <h5 className="truncate border-l-2 pl-4 italic my-1">
                                {room_details.discription}
                                </h5>
                            </div>
                            <Button
                            onClick={()=>setIshidden(!ishidden)}
                            size={"icon"}
                            variant={"ghost"}
                            className="">
                                {
                                    ishidden ? <ChevronLeftIcon/> : <ChevronRightIcon/>
                                }
                            </Button>
                        </div>
                        </>
                    )
                }
                <div className="flex mr-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size={`icon`} variant={`outline`} className="mr-4">
                            <ListEndIcon/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={may_be_leave_room} className="cursor-pointer">
                            Leave Room
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={deleteChat} className="cursor-pointer">
                           Delete Chat
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DarkLight/>
                </div>
                               
            </div>
            
            <div className="mx-4 mt-4 h-full flex">
                <ScrollArea id="chatbox"
                className="flex flex-col h-full rounded-md border w-full">
                    <div className="mb-16" ref={chat_ref}>
                        <div>{InboxComponent}</div>
                        <div>{realtimechat}</div>
                    </div>
                    <div className="absolute bottom-0 w-full mb-3 flex">
                    <Input 
                    className="ml-4" 
                    value={compose}
                    onChange={(e)=>setCompose(e.target.value)}
                    onKeyDown={(e)=>{
                        if(e.key === "Enter" && compose.trim().length > 0)
                            sendMessage();
                    }}
                    type="text" placeholder="Message"/>
                    <Button
                    disabled = {disable}
                    onClick={()=>{
                        if(compose.trim().length > 0)
                            sendMessage();
                    }} className="mx-4">Send</Button>
                    </div>
                </ScrollArea>
                <Members room_id={params.slug}/>
            </div>
        </div>

}

export function Members({room_id}:{room_id: string}){
    const ishidden= useRecoilValue(isSidebarHidden);
    const [memberStatus, setMemberStatus] = useRecoilState(member_online_state);
    useEffect(()=>{
        const fetch_members = async()=>{
            try{
                const resp = await fetch(`http://localhost:3001/chat/getMembers/${room_id}`,{
                    credentials: "include",
                });
                if(resp.status === 200){
                    const { raw_data } = await resp.json();
                    const parsed = room_member_details_schema.safeParse(raw_data);
                    if(parsed.success)
                    {
                        setMemberStatus(parsed.data);
                    }
                    else
                    console.log(parsed.error);

                }
            }catch(err){
                console.log(err);
            }
        }
        fetch_members();
    },[room_id]);
    return (
        <ScrollArea className={`${ishidden === true ? "hidden" : ""} w-[400px]`}>
            <div>
                {
                    memberStatus.map((member)=>{
                        let initials = member.username.substring(0,2);
                        const names = member.name?.split(" ");
                        if(names){
                            initials = names.map((name)=> name.charAt(0)).join("");
                        }
                        return (
                            <div key={member.username} 
                            className={`flex justify-between rounded-md p-1 w-full h-[72px] m-1`}>
                                <div className="flex item-center p-2">
                                    <Avatar className="mr-1">
                                        <AvatarImage src={member.avatarurl ?? ""}/>
                                        <AvatarFallback>{initials}</AvatarFallback>
                                    </Avatar>
                                    <div className="mx-1 px-1 mx-1">
                                        <div>{member.username}</div>
                                        <div className="italic text-muted-foreground truncate w-[124px] text-[15px]">{member.status ?? "NA"}</div>
                                    </div>
                                </div>
                                    <Badge 
                                    className={`
                                    h-6 mt-4 mr-1
                                    ${member.active ? "bg-rose-600" : "bg-green-400"}
                                    `}>
                                        {
                                            member.active ? "Active" : "Offline"
                                        }
                                    </Badge>
                                <br/>
                            </div>
                        )
                    })
                }
            </div>
        </ScrollArea>
    )
}