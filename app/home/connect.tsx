'use client'

import { useEffect } from "react";
import assert from "minimalistic-assert";
import { useSession } from "next-auth/react";
import { useRecoilRefresher_UNSTABLE } from "recoil";
import { useToast } from "@/hooks/use-toast";
import { DirectMessageState } from "@/lib/store/atom/dm";
import { Signal } from "./signal";


export default function Connect(){
    const session = useSession();
    const { toast } = useToast();
    const refresh_dms = useRecoilRefresher_UNSTABLE(DirectMessageState);

    function recieve_invite_callback(raw_data: string){
        const data = JSON.parse(raw_data);
        toast({
            title: "Invited"
        });
        refresh_dms();
        assert(session.status === "authenticated");
        //@ts-ignore
        Signal.get_instance().ADD_ROOM(session.data.username, data.connection_id);
    }
    
    useEffect(()=>{
        if(session.status === "authenticated"){
            //@ts-ignore
            Signal.get_instance(session.data.username).REGISTER_CALLBACK("INVITE",recieve_invite_callback);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[session.status,session.data])

    return(
        <></>
    )
}