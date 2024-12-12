'use client'

import assert from "minimalistic-assert";
import React,{ useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { SendHorizonal } from "lucide-react";
import { useRecoilRefresher_UNSTABLE, useRecoilStateLoadable } from "recoil";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea  } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

import { Signal } from "@/app/home/signal";
import DirectMessageHistory from "../history";
import type { RecievedMessage } from "@/app/(message)/chat/[slug]/page";
import type { UnitDM } from "../dm_ui";
import DmRender from "../dm_ui";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import ProfileDialog from "../profile_dialog";
import { dm_details_state } from "@/lib/store/atom/dm_details_state";
import { fetch_dms } from "@/lib/store/selector/fetch_dms";
import { get_new_local_id } from "../../util";

export default function Direct({params}:{params:{slug: string}}){
    const dm_ref = useRef<HTMLDivElement>(null);
    const [compose,setCompose] = useState<string>("");
    const [disable,setDisable] = useState<boolean>(true);
    const session = useSession();
    const [dmStateDetails,setDmStateDetails] = useRecoilStateLoadable(dm_details_state({username: params.slug}));
    const refresh_dm_state = useRecoilRefresher_UNSTABLE(dm_details_state({username: params.slug}));
    const refresh_dms = useRecoilRefresher_UNSTABLE(fetch_dms);
    const [inbox,setInbox] = useState<UnitDM[]>([]);
    const [history,setHistory] = useState<UnitDM[]>([]);
    const [sweeped,setSweeped] = useState<UnitDM[]>([]);
    const [active, setActive] = useState<boolean>(false);
    const [typing,setTyping] = useState<boolean>(false);
    const [send,setSend] = useState(false);

    useEffect(()=>{
        if(compose.trim().length === 0){
            setDisable(true);
        }
        else{
            setDisable(false);
        }
    },[compose])

    useEffect(()=>{
        const chat_node = dm_ref.current;
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
    },[history])

    useEffect(()=>{
        const chat_node = dm_ref.current;
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
        if(inbox.length >= 10){
            const friendship_data = dmStateDetails.getValue()!.friendship_data;
            const conc_id = friendship_data?.connectionId;
            const last_msg = friendship_data?.messages.slice(-1);
            
            if(conc_id !== undefined && last_msg){
                setSweeped([]);
                sweep_lastest_messages(conc_id,last_msg[0]?.id);
            }
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    },[inbox])

    function send_typing_notification(){
        
        if(dmStateDetails.state !== "hasValue" || dmStateDetails.getValue()?.is_friend === false)
            return;
        //@ts-ignore
        const username = session.data.username;
        const message = JSON.stringify({
            type:"typing",
            payload: {
                user_id: username,
                chat_id: dmStateDetails.getValue()?.friendship_data!.connectionId,
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

    async function sweep_lastest_messages(conc_id: string, last_msg_id: number | undefined){
        try{
            const resp = await fetch(`/api/message/dm/sweep/${conc_id}`,{
                method: 'POST',
                body: JSON.stringify({
                    last_msg_id: last_msg_id ?? -1,
                })
            });
            const { data }:{ data: UnitDM[] } = await resp.json();
            setSweeped(data);
        }catch(err){
            console.log(err);
        }
    }

    useEffect(()=>{
        async function sweep_lastest_dms(){
            if(
                dmStateDetails.state === "hasValue" && 
                dmStateDetails.getValue() !== undefined
            )
            {
                const friendship_data = dmStateDetails.getValue()!.friendship_data;
                const conc_id = friendship_data?.connectionId;
                const last_msg = friendship_data?.messages.slice(-1);
                
                if(conc_id !== undefined && last_msg){
                    setSweeped([]);
                    sweep_lastest_messages(conc_id,last_msg[0]?.id);
                }
            }
        }

        sweep_lastest_dms();
        //eslint-disable-next-line react-hooks/exhaustive-deps
    },[dmStateDetails.state])

    useEffect(()=>{
        if(sweeped.length > 0){
            setDmStateDetails((prev_state) => {
                assert(prev_state !== undefined);
                assert(prev_state.is_friend === true);

                return {
                    is_friend: prev_state.is_friend,
                    profile_info: prev_state.profile_info,
                    friendship_data: {
                        ...prev_state.friendship_data!,
                        messages: [...prev_state.friendship_data.messages, ...sweeped],

                    }
                }
            })
            setInbox([]);
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    },[sweeped])

    useEffect(()=>{
        if(
        session.status === "authenticated" && 
        dmStateDetails.state === "hasValue" && 
        dmStateDetails.getValue() !== undefined && 
        dmStateDetails.getValue()!.is_friend === true
        ){
            //@ts-ignore
            const username = session.data.username;
            //@ts-ignore
            const user_id = session.data.id;
            const conc_id = dmStateDetails.getValue()!.friendship_data!.connectionId;
            setActive(dmStateDetails.getValue()!.friendship_data!.is_active);
            setHistory(dmStateDetails.getValue()!.friendship_data!.messages);
            Signal.get_instance(username).SUBSCRIBE(conc_id,user_id,username);
            
        }
        else if(
            session.status === "authenticated" && 
            dmStateDetails.state === "hasValue" &&
            dmStateDetails.getValue()!.is_friend === false
        ){
            //@ts-ignore
            const username = session.data.username;
            Signal.get_instance(username).REGISTER_CALLBACK("DM_INVITE_SUCCESS",invite_success_callback);
        }
        Signal.get_instance().REGISTER_CALLBACK("MSG_CALLBACK",pm_recieve_callback);
        Signal.get_instance().REGISTER_CALLBACK("ONLINE_CALLBACK",update_member_online_status);
        Signal.get_instance().REGISTER_CALLBACK("TYPING_CALLBACK",typing_notif_callback);

        return () => {
            if(
                session.status === "authenticated" &&
                dmStateDetails.state === "hasValue" &&
                dmStateDetails.getValue() !== undefined &&
                dmStateDetails.getValue()!.is_friend === true
            ){
                //@ts-ignore
                const username = session.data.username;
                Signal.get_instance(username).UNSUBSCRIBE(dmStateDetails.getValue()!.friendship_data!.connectionId,username);
            }
            Signal.get_instance().DEREGISTER("MSG_CALLBACK");
            Signal.get_instance().DEREGISTER("ONLINE_CALLBACK");
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    },[session.status,dmStateDetails]);

    function typing_notif_callback(raw_data: string){
        const data = JSON.parse(`${raw_data}`);

        if(params.slug !== data.payload.user_id)
            return;
        if(dmStateDetails.getValue()?.friendship_data?.connectionId !== data.payload.chat_id)
            return;

        setTyping(true);

        setTimeout(() => {
            setTyping(false);
        }, 4000);
    }

    function pm_recieve_callback(raw_data: string){
        const data:RecievedMessage = JSON.parse(raw_data);
        if(dmStateDetails.state !== "hasValue" || (dmStateDetails.state === "hasValue" && !dmStateDetails.getValue()?.is_friend))
            return;
        if(data.payload.roomId !== dmStateDetails.getValue()!.friendship_data!.connectionId)
        return;
        else{
            const last_msg = dmStateDetails.getValue()!.friendship_data!.messages.slice(-1)[0];
            
            setInbox((inbox) => {
                let last_local_msg = inbox.slice(-1);
                const local_id = get_new_local_id(last_msg.id,last_local_msg[0]?.id);
                console.log(local_id)
                const new_dm = {
                    id: local_id,
                    content: data.payload.message.content,
                    createdAt: data.payload.createdAt,
                    sendBy: {
                        username: data.payload.message.user,
                    }
                }
                return [...inbox,new_dm]
            });
        }
    }

    function invite_success_callback(_raw_data: string){
        refresh_dm_state();
        refresh_dms();
    }

    function update_member_online_status(raw_data: string){
        const data = JSON.parse(raw_data);
        const type: "MemberJoins" | "MemberLeaves" = data.type;
        const username = data.payload.username;
        if(username === params.slug){
            setActive(type === "MemberJoins" ? true : false);
        }
    }
    
    if(dmStateDetails.state !== "hasValue" || dmStateDetails.getValue() === undefined || session.status !== "authenticated")
        return <div>Loading...</div>;

    //@ts-ignore
    const username = session.data.username;

    function sendMessage(){
        const data = dmStateDetails.getValue();
        assert(data !== undefined);

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
            Signal.get_instance().SEND(JSON.stringify(broadcast_data));
        }
        setCompose("");
    }
    
    return (
        <div className="w-full h-svh">
            {
                dmStateDetails.state === "hasValue" && session.status === "authenticated" ? <div className="flex flex-col w-full h-svh">
                <div className={`flex rounded-md h-[72px] mx-2 mt-2 mb-1 border-2`}>
                        <Dialog>
                            <DialogTrigger asChild>
                                <div className="flex item-center p-2 ml-2">
                                <Avatar className="mr-1 mt-1">
                                    <AvatarImage src={`https://avatar.varuncodes.com/${params.slug}`}/>
                                    <AvatarFallback>{params.slug.substring(0,2)}</AvatarFallback>
                                </Avatar>
                                <div className="mx-1 px-1 mx-1">
                                    <h3 className="scroll-m-20 text-xl font-semibold">{params.slug}</h3>
                                    <p className={`italic text-muted-foreground truncate w-[124px] text-[15px] ${active ? "text-rose-800" : "text-green-400"}`}>{active ? "Active" : "Offline"}</p>
                                </div>
                                </div>
                            </DialogTrigger>
                            <ProfileDialog profile_info={{...dmStateDetails.getValue()!.profile_info, username: params.slug }} />
                        </Dialog>
                </div>
                <ScrollArea id="chatbox"
                    className="flex flex-col h-full rounded-md border m-2">
                    <div className="mb-16" ref={dm_ref}>
                        {
                            dmStateDetails.getValue()!.is_friend && 
                            <DirectMessageHistory 
                            dms={ dmStateDetails.getValue()!.friendship_data!.messages } 
                            username={username}/>
                        }
                        {
                            inbox.map((live_dm) => {
                                return <DmRender id="recent" key={live_dm.id} dm={live_dm} username={username}/>
                            })
                        }
                    </div>
                    <div className="absolute bottom-0 mb-10">
                        {
                            typing === true && 
                            <div className="flex m-4 space-x-1 mb-6">
                                <Avatar className="w-[35px] h-[35px] mt-2">
                                    <AvatarImage src={`https://avatar.varuncodes.com/${params.slug}`}/>
                                    <AvatarFallback>{params.slug.substring(0,2)}</AvatarFallback>
                                </Avatar>
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
                </div> : <div>Loading...</div>
            }
        </div>
    )
}