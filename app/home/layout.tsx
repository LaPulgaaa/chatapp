'use client'

import { tokenState } from "@/lib/store/atom/Token"
import { userDetails } from "@/lib/store/atom/userDetails";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil"


export default function ChatLayout({children}:{children:React.ReactNode}){
    return <section>
        <InitUser/>
        {children}
        </section>

}

function InitUser(){
    const setUserDetails=useSetRecoilState(userDetails);

    const init=async()=>{
        try{
            const resp=await fetch("http://localhost:3001/user/getCreds",{
                credentials:"include"
            });
            const {data}=await resp.json();
            if(resp.status===201)
            {
                setUserDetails({
                    username:data.username,
                    password:data.password,
                    id:data.id,
                    favorite:data.favorite,
                    status:data.status,
                    avatarurl:data.avatarurl,
                    about:data.about
                })
                console.log(data);
            }
            
        }catch(err)
        {
            console.log(err);
        }
    }

    useEffect(()=>{
        init()
    },[])

    return <></>
}