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
import { FriendSearchResult, MessageDeletePayload, friend_search_result_schema } from "@/packages/zod";
import { direct_msg_state } from "@/lib/store/atom/dm";

type DeleteMsgCallbackData = {
    type: string,
    payload: MessageDeletePayload,
}


export default function Direct({params}:{params:{slug: string}}){
    const dm_ref = useRef<HTMLDivElement>(null);
    const compose_ref = useRef<string>("");
    const [compose,setCompose] = useState<string>("");
    const [disable,setDisable] = useState<boolean>(true);
    const session = useSession();
    const [dmStateDetails,setDmStateDetails] = useState<FriendSearchResult | undefined>();
    const [dms,setDms] = useRecoilStateLoadable(direct_msg_state);
    const refresh_dm_state = useRecoilRefresher_UNSTABLE(dm_details_state({username: params.slug}));
    const refresh_dms = useRecoilRefresher_UNSTABLE(fetch_dms);
    const [inbox,setInbox] = useState<UnitDM[]>([]);
    const [history,setHistory] = useState<UnitDM[]>([]);
    const [sweeped,setSweeped] = useState<UnitDM[]>([]);
    const [active, setActive] = useState<boolean>(false);
    const [typing,setTyping] = useState<number>(0);
    const [send,setSend] = useState(false);
    const type_ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(dms.state === "hasValue" && dms.getValue()){
            const friend = dms.getValue().find((dm) => {
                if(dm.to.username === params.slug)
                    return dm;
            });

            if(friend !== undefined)
            {
                const {to, ...cond_details} = friend
                const data = {
                    is_friend: true as const,
                    friendship_data: {
                        ...cond_details,
                        is_active: false,
                    },
                    profile_info: {
                        avatarurl: to.avatarurl,
                        about: to.about,
                        name: to.name,
                        favorite: to.favorite,
                        status: to.status
                    }
                }

                setDmStateDetails(data);
                setCompose(friend.draft ?? "");
            }
            else {
                fetch_user_details();
            }
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    },[dms])

    // function update_draft(){
    //     const draft = compose_ref.current;
    //     if(draft.length > 0 && dms.state === "hasValue" && dms.getValue() !== undefined){
    //         const dms_with_draft:PrivateChats = dms.getValue().map((dm) => {
    //             if(dm.to.username !== params.slug)
    //                 return dm;
    //             else {
    //                 const updated_dm = {
    //                     ...dm,
    //                     draft
    //                 }
    //                 return updated_dm
    //             }
    //         })
    //         setDms([...dms_with_draft])
    //     }
    // }

    // function maybe_clear_draft_cache(){
    //     let has_draft_cache = false;
    //     dms.getValue().forEach((dm) => {
    //         if(dm.to.username === params.slug && dm.draft !== undefined && dm.draft.length > 0){
    //             has_draft_cache = true;
    //         }
    //     })
    //     //@ts-ignore
    //     if(has_draft_cache === true){
    //         const dms_with_draft:PrivateChats = dms.getValue().map((dm) => {
    //             if(dm.to.username !== params.slug)
    //                 return dm;
    //             else {
    //                 const updated_dm = {
    //                     ...dm,
    //                     draft: undefined
    //                 }
    //                 return updated_dm
    //             }
    //         })
    //         setDms([...dms_with_draft])
    //     }
    // }

    async function fetch_user_details(){
        try{
            const resp = await fetch(`/api/dm/${params.slug}`);
            const { raw_data } = await resp.json();
            const data = friend_search_result_schema.parse(raw_data);
            assert(data.is_friend === false)
            setDmStateDetails(data);
        }catch(err){
            console.log(err);
            return undefined;
        }
    }

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

    useEffect(() => {
        const type_node = type_ref.current;
        if(typing > 0 && type_node !== null){
            const type_comp = type_node.querySelector("#typing");
            if(type_comp !== null){
                type_comp.scrollIntoView({
                    behavior: "smooth",
                    inline: "end",
                })
            }
        }
    },[typing])

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
        if(inbox.length >= 5){
            const friendship_data = dmStateDetails!.friendship_data;
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
        
        if(dmStateDetails === undefined || dmStateDetails?.is_friend === false)
            return;
        //@ts-ignore
        const username = session.data.username;
        const message = JSON.stringify({
            type:"typing",
            payload: {
                user_id: username,
                chat_id: dmStateDetails?.friendship_data!.connectionId,
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
                dmStateDetails !== undefined
            )
            {
                const friendship_data = dmStateDetails.friendship_data;
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
    },[dmStateDetails])

    useEffect(()=>{
        if(sweeped.length > 0){
            setDms((dms) => {
                const updated_dms = dms.map((dm) => {
                    if(dm.to.username === params.slug){
                        const prev_state = dm;
                        return {
                            ...prev_state,
                            messages: [...prev_state.messages, ...sweeped]
                        }
                    }
                    else
                    return dm;
                });

                return updated_dms;
            })
            setInbox([]);
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    },[sweeped])

    useEffect(()=>{
        if(
        session.status === "authenticated" && 
        dmStateDetails !== undefined && 
        dmStateDetails.is_friend === true
        ){
            //@ts-ignore
            const username = session.data.username;
            //@ts-ignore
            const user_id = session.data.id;
            const conc_id = dmStateDetails.friendship_data!.connectionId;
            setActive(dmStateDetails.friendship_data!.is_active);
            setHistory(dmStateDetails.friendship_data!.messages);
            Signal.get_instance(username).SUBSCRIBE(conc_id,user_id,username);
            
        }
        else if(
            session.status === "authenticated" && 
            dmStateDetails !== undefined &&
            dmStateDetails.is_friend === false
        ){
            //@ts-ignore
            const username = session.data.username;
            Signal.get_instance(username).REGISTER_CALLBACK("DM_INVITE_SUCCESS",invite_success_callback);
        }
        Signal.get_instance().REGISTER_CALLBACK("MSG_CALLBACK",pm_recieve_callback);
        Signal.get_instance().REGISTER_CALLBACK("ONLINE_CALLBACK",update_member_online_status);
        Signal.get_instance().REGISTER_CALLBACK("TYPING_CALLBACK",typing_notif_callback);
        Signal.get_instance().REGISTER_CALLBACK('DELETE_ECHO',delete_msg_callback);

        return () => {
            if(
                session.status === "authenticated" &&
                dmStateDetails !== undefined &&
                dmStateDetails.is_friend === true
            ){
                //@ts-ignore
                const username = session.data.username;
                Signal.get_instance(username).UNSUBSCRIBE(dmStateDetails.friendship_data!.connectionId,username);
            }
            Signal.get_instance().DEREGISTER("MSG_CALLBACK");
            Signal.get_instance().DEREGISTER("ONLINE_CALLBACK");
            // update_draft();
            // maybe_clear_draft_cache();
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    },[session.status,dmStateDetails]);

    function typing_notif_callback(raw_data: string){
        const data = JSON.parse(`${raw_data}`);

        if(params.slug !== data.payload.user_id)
            return;
        if(dmStateDetails?.friendship_data?.connectionId !== data.payload.chat_id)
            return;

        setTyping((typing) => typing+6);

        setInterval(() => {
            setTyping((typing) => {
                if(typing > 0)
                    return typing-2;

                return 0;
            });
        }, 4000);
    }

    function pm_recieve_callback(raw_data: string){
        const data:RecievedMessage = JSON.parse(raw_data);
        if(dmStateDetails === undefined || (dmStateDetails !== undefined && !dmStateDetails.is_friend))
            return;
        if(data.payload.roomId !== dmStateDetails.friendship_data.connectionId)
        return;
        else{
            const last_msg = dmStateDetails.friendship_data.messages.slice(-1)[0];
            
            setInbox((inbox) => {
                let last_local_msg = inbox.slice(-1);
                const local_id = get_new_local_id(last_msg.id,last_local_msg[0]?.id);
                console.log(local_id)
                const new_dm:UnitDM = {
                    id: local_id,
                    content: data.payload.message.content,
                    createdAt: data.payload.createdAt,
                    sendBy: {
                        username: data.payload.message.user,
                    },
                    is_local_echo: true,
                    hash: data.payload.hash,
                    pinned: false,
                    starred: [],
                }
                return [...inbox,new_dm]
            });
        }
    }
    function delete_msg_callback(raw_data: string){
        const data:DeleteMsgCallbackData = JSON.parse(`${raw_data}`);
        const payload = data.payload;
        if(dmStateDetails === undefined)
            return;

        else if(payload.conc_id === dmStateDetails.friendship_data?.connectionId){
            setInbox((inbox) => {
                return inbox.filter((dm) => {
                    assert(dm.is_local_echo === true);
                    if(dm.hash !== payload.hash)
                        return dm;
                });
            })
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
    
    if(dmStateDetails === undefined || session.status !== "authenticated")
        return <div>Loading...</div>;

    //@ts-ignore
    const username = session.data.username;

    function sendMessage(){
        const data = dmStateDetails;
        assert(data !== undefined);

        if(data.is_friend === false){
            Signal.get_instance().INVITE(username,params.slug,compose);
        }
        else{
            const broadcast_data={
                type:"message",
                payload:{
                    roomId:data.friendship_data.connectionId,
                    msg_type: "dm",
                    message:{
                        content:compose,
                        user:username,
                        name: session.data?.user?.name,
                        //@ts-ignore
                        id:session.data.id,
                    },
                    friendshipId: data.friendship_data.id,
                }
            }
            Signal.get_instance().SEND(JSON.stringify(broadcast_data));
        }
        setCompose("");
    }
    
    return (
        <div className="w-full h-svh">
            {
                dmStateDetails !== undefined && session.status === "authenticated" ? 
                <div className="flex flex-col w-full h-svh">
                <div className={`flex rounded-md h-[72px] mx-2 mt-2 mb-1 border-2`}>
                        <Dialog>
                            <DialogTrigger asChild>
                                <div className="flex item-center p-2 ml-2">
                                <Avatar className="mr-1 mt-1">
                                    <AvatarImage src={`https://avatar.varuncodes.com/${params.slug}`}/>
                                    <AvatarFallback>{params.slug.substring(0,2)}</AvatarFallback>
                                </Avatar>
                                <div className="mx-1 px-1">
                                    <h3 className="scroll-m-20 text-xl font-semibold">{params.slug}</h3>
                                    <p className={`italic text-muted-foreground truncate w-[124px] text-[15px] ${active ? "text-rose-800" : "text-green-400"}`}>{active ? "Active" : "Offline"}</p>
                                </div>
                                </div>
                            </DialogTrigger>
                            <ProfileDialog profile_info={{...dmStateDetails.profile_info, username: params.slug }} />
                        </Dialog>
                </div>
                <ScrollArea id="chatbox"
                    className="flex flex-col h-full rounded-md border m-2">
                    <div className="mb-2" ref={dm_ref}>
                        {
                            dmStateDetails.is_friend && 
                            <DirectMessageHistory 
                            dms={ dmStateDetails.friendship_data.messages } 
                            username={username}/>
                        }
                        {
                            inbox.map((live_dm) => {
                                return <DmRender id="recent" key={live_dm.id} dm={live_dm} username={username}/>
                            })
                        }
                    </div>
                    <div ref={type_ref} className="mb-16">
                        {
                            typing > 0 && 
                            <div id="typing" className="flex m-4 space-x-1 mb-6">
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
                </div> : <div>Loading...</div>
            }
        </div>
    )
}