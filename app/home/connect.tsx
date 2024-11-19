'use client'

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRecoilRefresher_UNSTABLE } from "recoil";
import { useToast } from "@/hooks/use-toast";
import { DirectMessageState } from "@/lib/store/atom/dm";
import { Signal } from "./signal";
import { usePathname,useRouter } from "next/navigation";


export default function Connect(){
    const session = useSession();
    const { toast } = useToast();
    const refresh_dms = useRecoilRefresher_UNSTABLE(DirectMessageState);
    const pathname = usePathname();
    const router = useRouter();

    function recieve_invite_callback(raw_data: string){
        const data = JSON.parse(raw_data);
        toast({
            title: data.payload.requestBy,
            description: data.payload.content,
        });
        refresh_dms();
        if(pathname === "/home"){
            router.refresh();
        }
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