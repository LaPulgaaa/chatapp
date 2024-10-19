'use client'

import assert from "minimalistic-assert";
import Link from "next/link";
import React,{ useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SendHorizonal, ChevronLeft } from "lucide-react";
import { useRecoilValueLoadable } from "recoil";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea  } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { get_friend_by_username } from "@/lib/store/selector/explore";
import { Signal } from "@/app/home/signal";
import DirectMessageHistory from "../history";
import type { RecievedMessage } from "@/app/chat/[slug]/page";
import type { UnitDM } from "../dm_ui";
import DmRender from "../dm_ui";


export default function Direct({params}:{params:{slug: string}}){
    const [compose,setCompose] = useState<string>("");
    const [disable,setDisable] = useState<boolean>(true);
    const router = useRouter();
    const session = useSession();
    const recipient_state = useRecoilValueLoadable(get_friend_by_username({username: params.slug}));
    const [inbox,setInbox] = useState<UnitDM[]>([]);
    const [active, setActive] = useState<boolean>(false);

    useEffect(()=>{
        if(compose.trim().length === 0){
            setDisable(true);
        }
        else{
            setDisable(false);
        }
    },[compose])

    useEffect(()=>{
        if(
        session.status === "authenticated" && 
        recipient_state.state === "hasValue" && 
        recipient_state.getValue() !== undefined && 
        recipient_state.getValue()!.is_friend === true
    ){
            //@ts-ignore
            const username = session.data.username;
            //@ts-ignore
            const user_id = session.data.id;
            Signal.get_instance(username).SUBSCRIBE(recipient_state.getValue()!.friendship_data!.connectionId,user_id,username);
            Signal.get_instance().REGISTER_CALLBACK("MSG_CALLBACK",pm_recieve_callback);
            Signal.get_instance().REGISTER_CALLBACK("ONLINE_CALLBACK",update_member_online_status);
        }
    },[session.status,recipient_state.state]);


    function pm_recieve_callback(raw_data: string){
        const data:RecievedMessage = JSON.parse(raw_data);
        const new_dm = {
            id: Math.random()*1000,
            content: data.payload.message.content,
            createdAt: data.payload.createdAt,
            sendBy: {
                username: data.payload.message.user,
            }
        }
        setInbox((inbox) => [...inbox,new_dm]);
    }

    function update_member_online_status(raw_data: string){
        const data = JSON.parse(raw_data);
        const type: "MemberJoins" | "MemberLeaves" = data.type;
        const username = data.payload.username;
        if(username === params.slug){
            setActive(type === "MemberJoins" ? true : false);
        }
    }
    
    if(recipient_state.state !== "hasValue" || recipient_state.getValue() === undefined || session.status !== "authenticated")
        return <div>Loading...</div>;

    const data = recipient_state.getValue();

    assert(data !== undefined);

    //@ts-ignore
    const username = session.data.username;

    function sendMessage(){
        if(data!.is_friend === false){
            Signal.get_instance().INVITE(username,params.slug,compose);
        }
        else{
            const broadcast_data={
                type:"message",
                payload:{
                    roomId:data!.friendship_data.connectionId,
                    msg_type: "dm",
                    message:{
                        content:compose,
                        user:username,
                        name: session.data?.user?.name,
                        //@ts-ignore
                        id:session.data!.id,
                    },
                    friendshipId: data!.friendship_data.id,
                }
            }
            setCompose("");
            Signal.get_instance().SEND(JSON.stringify(broadcast_data));
        }
    }
    
    return (
        <div className="w-full h-svh">
            {
                session.status === "authenticated" ? <div className="flex flex-col w-full h-svh">
                <div className={`flex rounded-md h-[72px] mx-2 mt-2 mb-1 border-2`}>
                        <div className="flex item-center p-2 ml-2">
                            <Avatar className="mr-1 mt-1">
                                <AvatarImage src={data.avatarurl ?? ""}/>
                                <AvatarFallback>{params.slug.substring(0,2)}</AvatarFallback>
                            </Avatar>
                            <div className="mx-1 px-1 mx-1">
                                <h3 className="scroll-m-20 text-xl font-semibold">{params.slug}</h3>
                                <p className={`italic text-muted-foreground truncate w-[124px] text-[15px] ${active ? "text-rose-800" : "text-green-400"}`}>{active ? "Active" : "Offline"}</p>
                            </div>
                        </div>
                </div>
                <ScrollArea id="chatbox"
                    className="flex flex-col h-full rounded-md border m-2">
                    <div className="mb-16">
                        {
                            data.is_friend && 
                            <DirectMessageHistory 
                            dms={ data.friendship_data.messages } 
                            username={username}/>
                        }
                        {
                            inbox.map((live_dm) => {
                                return <DmRender dm={live_dm} username={username}/>
                            })
                        }
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
                </div> : <div>Loading...</div>
            }
        </div>
    )
}