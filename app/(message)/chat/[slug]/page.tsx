"use client";

import assert from "minimalistic-assert";

import { useRef } from "react";

import { Signal } from "@/app/home/signal";

import { useEffect, useState } from "react";

import { useSession } from "next-auth/react";
import Inbox from "@/components/Inbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRecoilValue, useRecoilState, useRecoilValueLoadable, useRecoilStateLoadable} from "recoil";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon, ListEndIcon, SendHorizonal } from "lucide-react";
import { DarkLight } from "@/components/DarkLight";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

import Message from "@/components/Message";
import type { ChatMessageData } from "@/packages/zod";
import { leave_room } from "@/app/home/util";
import { UserStateChats } from "@/lib/store/atom/chats";
import { RoomHeaderDetails, chat_messages_schema } from "@/packages/zod";
import { room_member_details_schema } from "@/packages/zod";
import { isSidebarHidden } from "@/lib/store/atom/sidebar";
import { member_online_state } from "@/lib/store/atom/status";
import { fetch_user_chats } from "@/lib/store/selector/fetch_chats";
import { chat_details_state } from "@/lib/store/atom/chat_details_state";

export type RecievedMessage={
    type:string,
    payload:{
        roomId:string,
        message:{
            content:string,
            user:string,
            name?: string,
        },
        createdAt: string,
    
    }
}

export default function Chat({params}:{params:{slug:string}}){
    const { toast } = useToast();

    const chat_ref = useRef<HTMLDivElement>(null);
    const [sweeped,setSweeped] = useState<ChatMessageData['messages']>([]);
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
    const roomsStateData = useRecoilValueLoadable(fetch_user_chats);
    const [roomDetailState,setRoomDetailState] = useRecoilStateLoadable(chat_details_state({chat_id: params.slug}));

    useEffect(()=>{
        if(roomsStateData.state === "hasValue" && roomsStateData.getValue()){
            const all_rooms_data = roomsStateData.getValue();
            const narrowed_room = all_rooms_data.find((room) => room.id === params.slug);
            assert(narrowed_room !== undefined);

            setRoomDetails({
                name: narrowed_room.name,
                discription: narrowed_room.discription,
                createdAt: narrowed_room.createdAt,
            });
        }
    //eslint-disable-next-line react-hooks/exhaustive-deps
    },[roomsStateData.state])
    
    async function sweep_latest_messages(last_msg_id: number | undefined){
        try{
            const resp = await fetch(`/api/message/chat/sweep/${params.slug}`,{
                method: "POST",
                body: JSON.stringify({
                    last_msg_id: last_msg_id ?? -1,
                })
            });
            const { raw_data } = await resp.json();
            const data = chat_messages_schema.parse(raw_data);
            setSweeped(data);
        }catch(err){
            console.log(err);
        }
    }

    useEffect(()=>{
        async function sweep_recent_chat_msgs(){
            if(roomDetailState.state === "hasValue" && roomDetailState.getValue() !== undefined){
                setSweeped([]);
                const last_msg = roomDetailState.getValue()!.slice(-1);
                sweep_latest_messages(last_msg[0]?.id);
            }
        }
        sweep_recent_chat_msgs();
        //eslint-disable-next-line react-hooks/exhaustive-deps
    },[roomDetailState.state])

    useEffect(()=>{
        if(sweeped.length > 0){
            setRoomDetailState((prev_state) => [...prev_state ?? [],...sweeped]);
            setRealtimechat([]);
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    },[sweeped])

    useEffect(()=>{
        if(room_id !== undefined && session.status === "authenticated" )
        {
            //@ts-ignore
            Signal.get_instance(session.data.username).SUBSCRIBE(room_id, session.data.id, session.data.username);
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
        //eslint-disable-next-line react-hooks/exhaustive-deps
    },[session.status])
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
    },[roomDetailState])

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
        if(realtimechat.length > 10){
            setSweeped([]);
            const last_msg = roomDetailState.getValue()!.slice(-1);
            sweep_latest_messages(last_msg[0]?.id);
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
                msg_type: "chat",
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
            const resp=await fetch(`/api/message/chat/${params.slug}`,{
                method:'PUT',
                body:JSON.stringify({
                    date:new Date(),
                    did:did,
                }),
                headers:{
                    'Content-Type':"application/json"
                },
                credentials:"include"
            })
            if(resp.status === 200)
            {
                setChat([]);
                setRealtimechat([]);
                toast({
                    variant: "destructive",
                    title: "Chat deleted successfully!",
                    duration: 3000
                });
            }
        }

    }
    async function may_be_leave_room(){
        const opcode_id = rooms.find((room) => room.id === params.slug)?.conn_id
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

    return <div className="h-svh w-full pb-24">
            <div className="flex justify-between mt-2 mx-1">
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
                            className="hidden lg:block">
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
            
            <div className="mt-2 h-[100%] flex w-full">
                <ScrollArea id="chatbox"
                className="flex flex-col w-full h-full rounded-md border m-2">
                    <div className="mb-16" ref={chat_ref}>
                        <div>
                        {
                            roomDetailState.state === "hasValue" ? roomDetailState.getValue()!.map((message)=>{
                            return <Inbox key={message.id} data={message}/>
                            }) : <div className="flex flex-col items-center justify-center mt-4">Loading...</div>
                        }
                        </div>
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
                    }} className="mx-4"><SendHorizonal/></Button>
                    </div>
                </ScrollArea>
                {/* @ts-ignore */}
                { session.status === "authenticated" && <Members room_id={params.slug} username={session.data.username}/>}
            </div>
        </div>

}

function Members({room_id,username}:{room_id: string,username: string}){
    const ishidden= useRecoilValue(isSidebarHidden);
    const [memberStatus, setMemberStatus] = useRecoilState(member_online_state);
    useEffect(()=>{
        const fetch_members = async()=>{
            try{
                const resp = await fetch(`https://chatbackend.varuncodes.com/chat/getMembers/${room_id}`,{
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
    },[room_id,setMemberStatus]);
    return (
        <ScrollArea className={`hidden ${ishidden === true ? "lg:hidden" : "lg:block"} w-[400px]`}>
            <div>
                {
                    memberStatus.map((member)=>{
                        let initials = member.username.substring(0,2);
                        const names = member.name?.split(" ");
                        let is_active = member.active;
                        if(names){
                            initials = names.map((name)=> name.charAt(0)).join("");
                        }
                        if(member.username === username)
                            is_active = true;
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
                                    ${is_active ? "bg-rose-600" : "bg-green-400"}
                                    `}>
                                        {
                                            is_active ? "Active" : "Offline"
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