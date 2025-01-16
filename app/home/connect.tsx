'use client'

import assert from "minimalistic-assert";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRecoilRefresher_UNSTABLE, useRecoilStateLoadable } from "recoil";
import { useToast } from "@/hooks/use-toast";
import { Signal } from "./signal";
import { fetch_dms } from "@/lib/store/selector/fetch_dms";
import { MessageDeletePayload, MessagePinPayload } from "@/packages/zod";
import { direct_msg_state } from "@/lib/store/atom/dm";
import type { UpdateDetailsData } from "../(message)/msg_connect";
import { subscribed_chats_state } from "@/lib/store/atom/subscribed_chats_state";

type DeleteMsgCallbackData = {
    type: string,
    payload: MessageDeletePayload,
}

type PinMsgCallbackData = {
    type: "pin",
    payload: MessagePinPayload
}

export default function Connect(){
    const session = useSession();
    const { toast } = useToast();
    const refresh_dms = useRecoilRefresher_UNSTABLE(fetch_dms);
    const [dms,setDms] = useRecoilStateLoadable(direct_msg_state);
    const [roomsStateData,setRoomsStateData] = useRecoilStateLoadable(subscribed_chats_state);

    function recieve_invite_callback(raw_data: string){
        const data = JSON.parse(raw_data);
        toast({
            title: data.payload.requestBy,
            description: data.payload.content,
        });
        refresh_dms();
    }

    function delete_msg_callback(raw_string: string){
        const data:DeleteMsgCallbackData = JSON.parse(`${raw_string}`);
        const payload = data.payload;
        
        if(payload.type === "DM" && dms.state === "hasValue"){
            const narrowed_dm = dms.getValue().find((dm) => dm.connectionId === payload.conc_id);

            assert(narrowed_dm !== undefined);

            const left_msgs = narrowed_dm.messages.filter((msg) => msg.id !== payload.id);

            const narrow_with_left_msgs = {
                ...narrowed_dm,
                messages: left_msgs
            }
            setDms((dms) => {
                const other_dms = dms.filter((dm) => dm.connectionId !== payload.conc_id);

                return [...other_dms,narrow_with_left_msgs];
            })
        }

    }
    function pin_msg_callback(raw_string: string){
        const data:PinMsgCallbackData = JSON.parse(`${raw_string}`);
        const payload = data.payload;
        
        if(payload.type === "DM" && dms.state === "hasValue"){
            const narrowed_dm = dms.getValue().find((dm) => dm.connectionId === payload.conc_id);

            assert(narrowed_dm !== undefined);

            const left_msgs = narrowed_dm.messages.map((msg) => {
                if(msg.id === payload.id)
                    return {
                        ...msg,
                        pinned: payload.pinned
                    }
                else
                return msg;
            });

            const narrow_with_left_msgs = {
                ...narrowed_dm,
                messages: left_msgs
            }
            console.log("pinned this msg")
            setDms((dms) => {
                const other_dms = dms.filter((dm) => dm.connectionId !== payload.conc_id);

                return [...other_dms,narrow_with_left_msgs];
            })
        }

    }

    function details_update_callback(raw_string: string){
        const data:UpdateDetailsData = JSON.parse(`${raw_string}`);
        if(data.type === "chat_details_update"){
            const all_rooms_data = roomsStateData.getValue();
            const narrowed_room = all_rooms_data.find((room) => room.id === data.payload.chat_id);
            assert(narrowed_room !== undefined);
            const other_rooms = all_rooms_data.filter((room) => room.id !== narrowed_room.id);
            const updated_narrowed_room = {
                ...narrowed_room,
                name: data.payload.updated_details.name,
                discription: data.payload.updated_details.discription,
            }
            setRoomsStateData([...other_rooms,updated_narrowed_room]);
        }
    }

    useEffect(()=>{
        if(session.status === "authenticated"){
            //@ts-ignore
            Signal.get_instance(session.data.username).REGISTER_CALLBACK("INVITE",recieve_invite_callback);
            Signal.get_instance().REGISTER_CALLBACK("DELETE_NON_ECHO",delete_msg_callback);
            Signal.get_instance().REGISTER_CALLBACK("PIN_MSG_CALLBACK",pin_msg_callback);
            Signal.get_instance().REGISTER_CALLBACK("UPDATE_DETAILS_CALLBACK",details_update_callback)
        }

        return () => {
            if(session.status === "authenticated")
            {
                //@ts-ignore
                Signal.get_instance(session.data.username).DEREGISTER("INVITE");
                Signal.get_instance().DEREGISTER("DELETE_NON_ECHO");
                Signal.get_instance().DEREGISTER("PIN_MSG_CALLBACK");
                Signal.get_instance().DEREGISTER("UPDATE_DETAILS_CALLBACK");
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[session.status,session.data])

    return(
        <></>
    )
}