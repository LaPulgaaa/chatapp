'use client'

import { tokenState } from "@/lib/store/atom/Token"
import { useRecoilValue } from "recoil"


export default function ChatLayout({children}:{children:React.ReactNode}){
    const token=useRecoilValue(tokenState);
    
    if(token===undefined)
    return <div>Not verified</div>

    return <section>{children}</section>

}