'use client'

import {z} from "zod";
import { useEffect } from "react";

import { userDetails } from "@/lib/store/atom/userDetails";
import {  useSetRecoilState } from "recoil";
import { member_profile_schema } from "@/packages/zod";
import { useRouter } from "next/navigation";


export default function ChatLayout({children}:{children:React.ReactNode}){
    return <section>
        <InitUser/>
        {children}
        </section>

}

function InitUser(){
    const setUserDetails=useSetRecoilState(userDetails);
    const router = useRouter();

    const init=async()=>{
        try{
            const resp=await fetch("http://localhost:3001/user/getCreds",{
                credentials:"include"
            });
            const {creds}=await resp.json();

            const data = z.intersection
            (
                z.object({
                    id: z.string(),
                    avatarurl:z.string().nullable(),
                    status:z.string().nullable(),
                    about:z.string().nullable()
                }),
                member_profile_schema.omit({about:true, avatarurl:true, status:true})
            )
            .parse(creds);

            // TODO: after safeParsing we can also logout the user, it would show jwt expired state.
            if(resp.status===201)
            {
                setUserDetails({
                    username:data.username,
                    password:data.password,
                    id:data.id,
                    favorite:data.favorite,
                    status:data.status ?? "",
                    avatarurl:data.avatarurl ?? "",
                    about:data.about ?? ""
                })
                console.log(data);
            }
            else
            {
                window.localStorage.clear();
                alert("Token invalidated!!");
                router.push("/");
            }
            
        }catch(err)
        {
            console.log(err);
            window.localStorage.clear();
            router.push("/");
        }
    }

    useEffect(()=>{
        init()
    },[])

    return <></>
}