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
import { useRecoilValue, useRecoilState, useRecoilStateLoadable} from "recoil";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon, Edit, ListEndIcon, SendHorizonal } from "lucide-react";
import { DarkLight } from "@/components/DarkLight";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

import Message from "@/components/Message";
import { ChatMessageData, UserChat } from "@/packages/zod";
import { leave_room } from "@/app/home/util";
import { UserStateChats } from "@/lib/store/atom/chats";
import { RoomHeaderDetails, chat_messages_schema } from "@/packages/zod";
import { room_member_details_schema } from "@/packages/zod";
import { isSidebarHidden } from "@/lib/store/atom/sidebar";
import { member_online_state } from "@/lib/store/atom/status";
import { chat_details_state } from "@/lib/store/atom/chat_details_state";
import { subscribed_chats_state } from "@/lib/store/atom/subscribed_chats_state";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import EditRoomDetails from "../edit_room_details";

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
        hash: string,
    }
}



export default function Chat({params}:{params:{slug:string}}){
    const { toast } = useToast();

    const compose_ref = useRef<string | null>(null);
    const chat_ref = useRef<HTMLDivElement>(null);
    const type_ref = useRef<HTMLDivElement>(null);
    const [sweeped,setSweeped] = useState<ChatMessageData['messages']>([]);
    const [realtimechat, setRealtimechat] = useState<JSX.Element[]>([]);
    const [compose,setCompose]=useState<string>("");
    const [chat,setChat]=useState<RecievedMessage[]>([]);
    const session = useSession();
    const [did,_setDid]=useState<number>();
    const [rooms,setRooms]=useRecoilState(UserStateChats);
    const [ishidden,setIshidden] = useRecoilState(isSidebarHidden) 
    const [disable,setDisable] = useState(true);
    const router=useRouter();
    const [room_details,setRoomDetails] = useState<RoomHeaderDetails>();
    const room_id = params.slug;
    //@ts-ignore
    const user_id = session.data?.id;
    const [memberStatus,setMemberStatus] = useRecoilState(member_online_state);
    const [roomsStateData,setRoomsStateData] = useRecoilStateLoadable(subscribed_chats_state);
    const [roomDetailState,setRoomDetailState] = useRecoilStateLoadable(chat_details_state({chat_id: params.slug}));
    const [typing,setTyping] = useState<string[]>([]);
    const [send,setSend] = useState(false);

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
            setCompose(narrowed_room.draft ?? "")
        }
    //eslint-disable-next-line react-hooks/exhaustive-deps
    },[roomsStateData])

    function send_typing_notification(){
        //@ts-ignore
        const username = session.data.username;
        const message = JSON.stringify({
            type:"typing",
            payload: {
                user_id: username,
                chat_id: params.slug,
            }
        })
        if(send === true)
        {
            setTimeout(() => {
                setSend(false)
            },1000)
        }
        else{
            Signal.get_instance().SEND(message);
            setSend(true);
        }
    }

    function update_draft(){
        const draft = compose_ref.current;
        if(draft !== null && roomsStateData.state === "hasValue"){
            const rooms_with_draft_msg = roomsStateData.getValue().map((room) => {
                if(room.id !== params.slug)
                    return room;
                else{
                    const room_with_draft:UserChat = {
                        ...room,
                        draft,
                    }
                    return room_with_draft;
                }
            })
            setRoomsStateData([...rooms_with_draft_msg])
        }
    }


    function update_last_sent_message(){
        if(roomsStateData.state === "hasValue") {
            console.log("is this being updated")
            const all_rooms_data = roomsStateData.getValue();
            const narrowed_room = all_rooms_data.find((room) => room.id === params.slug);
            assert(narrowed_room !== undefined);
            const other_rooms = all_rooms_data.filter((room) => room.id !== narrowed_room.id);

            let new_last_msg;

            if(chat.length > 0)
            {
                
                const last_recent_msg = chat.slice(-1)[0];
                new_last_msg = {
                    id: Math.random(),
                    createdAt: last_recent_msg.payload.createdAt,
                    content: last_recent_msg.payload.message.content,
                    sender: {
                        username: last_recent_msg.payload.message.user,
                        name: last_recent_msg.payload.message.name,
                    }
                }
            }
            else if(sweeped.length > 0)
            {
                const last_sweeped_msg = sweeped.slice(-1)[0];
                new_last_msg = {
                    createdAt: last_sweeped_msg.createdAt,
                    content: last_sweeped_msg.content,
                    sender: {
                        username: last_sweeped_msg.sender.username,
                    }
                }
            }

            if(new_last_msg === undefined)
                return;

            const room_details_with_updated_last_msg = {
                ...narrowed_room,
                lastmsgAt: new_last_msg.createdAt,
                messages: [{
                    id: Math.random(),
                    content: new_last_msg.content,
                    createdAt: new_last_msg.createdAt,
                    sender: {
                        username: new_last_msg.sender.username,
                        name: new_last_msg.sender.name,
                    }
                }]
            }
            setRoomsStateData([...other_rooms,room_details_with_updated_last_msg]);

        }
    }
    
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
            update_last_sent_message();
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
            Signal.get_instance().REGISTER_CALLBACK("TYPING_CALLBACK",typing_notif_callback);
        }

        
        return ()=>{
            if(room_id !== undefined && session.status === "authenticated")
            {
                //@ts-ignore
                Signal.get_instance().UNSUBSCRIBE(params.slug,session.data.username);
                Signal.get_instance().DEREGISTER("MSG_CALLBACK");
                Signal.get_instance().DEREGISTER("ONLINE_CALLBACK");
                Signal.get_instance().DEREGISTER("TYPING_CALLBACK");
            }
            update_draft();
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    },[room_id,user_id,session.status])
    function recieve_msg(raw_data: string){
        const data:RecievedMessage = JSON.parse(`${raw_data}`);
        if(data.payload.roomId !== params.slug)
        return;
        else{
            setChat([...chat,data]);
            setRealtimechat((realtimechat)=>[...realtimechat, <Message  key={(session.data?.user?.email?.substring(5) || "")+Date.now()} data={data}/>])
        }
        
    }

    function typing_notif_callback(raw_data: string){
        const data = JSON.parse(`${raw_data}`);
        //@ts-ignore
        const username = session.data.username;
        if(data.payload.user_id === username || data.payload.chat_id !== params.slug)
            return;

        setTyping((members) => {
            if(members.find((member) => member === data.payload.user_id))
            return [...members];

            return [...members,data.payload.user_id]
        });

        setTimeout(()=>{
            setTyping((typing) => {
                const left_members = typing.filter((member) => member !== data.payload.user_id);
                return left_members;
            });
        },6000)

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

    useEffect(() => {
        const type_node = type_ref.current;
        if(typing.length > 0 && type_node !== null){
            const type_comp = type_node.querySelectorAll("#typing");
            if(type_comp.length !== 0){
                type_comp[type_comp.length-1].scrollIntoView({
                    behavior: "smooth",
                    inline: "center"
                })
            }
        }
    },[typing])

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
        //eslint-disable-next-line react-hooks/exhaustive-deps
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
        setCompose("");
        compose_ref.current = "";
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
                            <div className="flex space-x-2">
                                <Button
                                className="px-1"
                                onClick={()=>setIshidden(!ishidden)}
                                size={"icon"}
                                variant={"ghost"}
                                >
                                    {
                                        ishidden ? <ChevronLeftIcon/> : <ChevronRightIcon/>
                                    }
                                </Button>
                                <Button
                                className="px-1"
                                size={"icon"}
                                variant={"ghost"}
                                >
                                    <Dialog>
                                        <DialogTrigger>
                                            <Edit/>
                                        </DialogTrigger>
                                        <EditRoomDetails room_details={{
                                            name: room_details!.name,
                                            discription: room_details!.discription
                                        }} chat_id={params.slug}/>
                                    </Dialog>
                                </Button>
                            </div>
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
                    <div className="mb-2" ref={chat_ref}>
                        <div>
                        {
                            (roomDetailState.state === "hasValue" && roomDetailState.getValue()) ? roomDetailState.getValue()!.map((message)=>{
                            return <Inbox key={message.id} data={message}/>
                            }) : <div className="flex flex-col items-center justify-center mt-4">Loading...</div>
                        }
                        </div>
                        <div>{realtimechat}</div>
                    </div>
                    <div className="mb-16">
                        {
                            typing.length > 0 && 
                            <div className="flex m-3 space-x-1 mb-6">
                                {
                                    typing.map((member) => {
                                        return(
                                            <Avatar id="typing" key={member} className="w-[35px] h-[35px] mt-2">
                                                <AvatarImage src={`https://avatar.varuncodes.com/${member}`}/>
                                                <AvatarFallback>{member.substring(0,2)}</AvatarFallback>
                                            </Avatar>
                                        )
                                    })
                                }
                                <div className="bg-slate-200 dark:bg-slate-900 rounded-md p-1 px-2 mt-2 text-center">...</div>
                            </div>
                        }
                    </div>
                    <div className="absolute bottom-0 w-full mb-3 flex">
                    <Input 
                    className="ml-4" 
                    value={compose}
                    onChange={(e)=>{
                        setCompose(e.target.value);
                        compose_ref.current = e.target.value;
                        send_typing_notification();
                    }}
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
                                    <div className="px-1 mx-1">
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