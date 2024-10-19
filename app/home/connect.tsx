'use client'

import { DirectMessageState } from "@/lib/store/atom/dm";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRecoilRefresher_UNSTABLE } from "recoil";
import { Signal } from "./signal";
import { useToast } from "@/hooks/use-toast";
import assert from "minimalistic-assert";


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
    }
    
    useEffect(()=>{
        if(session.status === "authenticated"){
            //@ts-ignore
            Signal.get_instance(session.data.id).REGISTER_CALLBACK("INVITE",recieve_invite_callback);
        }
    },[session.status])

    return(
        <></>
    )
}