'use client'

import { tokenState } from "@/lib/store/atom/Token"
import { useRouter } from "next/navigation";
import { useRecoilValue } from "recoil"


export default function ChatLayout({children}:{children:React.ReactNode}){
    const token=useRecoilValue(tokenState);
    const router=useRouter();
    
    // if(token===undefined)
    // router.push("/");

    return <section>{children}</section>

}