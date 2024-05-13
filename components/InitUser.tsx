'use client'

import { useSetRecoilState } from "recoil";
import { useEffect } from "react";
import { userDetails } from "@/lib/store/atom/userDetails";
export function InitUser(){
    const setUserDetails=useSetRecoilState(userDetails);
    const init=async()=>{
        try{
            const resp=await fetch("http://localhost:3001/user/getCreds");
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
            else{
                
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