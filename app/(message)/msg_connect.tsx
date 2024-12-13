'use client'

import assert from "minimalistic-assert";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRecoilStateLoadable } from "recoil";
import { Signal } from "../home/signal";
import { MessageDeletePayload } from "@/packages/zod";
import { direct_msg_state } from "@/lib/store/atom/dm";

type DeleteMsgCallbackData = {
    type: string,
    payload: MessageDeletePayload,
}

export default function Connect(){
    const session = useSession();
    const [dms,setDms] = useRecoilStateLoadable(direct_msg_state);

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
            console.log("deleted msg")
            setDms((dms) => {
                const other_dms = dms.filter((dm) => dm.connectionId !== payload.conc_id);

                return [...other_dms,narrow_with_left_msgs];
            })
        }

    }

    useEffect(()=>{
        if(session.status === "authenticated"){
            //@ts-ignore
            Signal.get_instance().REGISTER_CALLBACK("DELETE_NON_ECHO",delete_msg_callback);
        }

        return () => {
            if(session.status === "authenticated")
            {
                //@ts-ignore
                Signal.get_instance(session.data.username).DEREGISTER("DELETE_NON_ECHO");
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[session.status,session.data])

    return(
        <></>
    )
}