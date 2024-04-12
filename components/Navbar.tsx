'use client'

import { useRecoilValue, useResetRecoilState, useSetRecoilState } from "recoil";
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react";
import * as React from "react";
import { DarkLight } from "./DarkLight";
export default function Navbar(){
    const router=useRouter();
    const [token,setToken]=useState(window.localStorage.getItem("token"));
    return <div className="p-4 font-bold flex justify-between cursor-pointer">
        <h2 onClick={()=>router.push("/")}>chat.city</h2>
        <div className="flex justify-between">
        {token!==null?<Button
        className="mx-2"
         onClick={()=>{
            window.localStorage.removeItem("token");
            setToken(null);
            router.push("/")
         }}
         variant={"ghost"}>Logout</Button>:<Button variant="ghost" onClick={()=>router.push("/login")}>LogIn</Button>}
        {token===null?<Button
        className="px-2 mx-6"
        variant={"ghost"}
         onClick={()=>{
            router.push("/signup")
        }}>Signup</Button>:''}
        <DarkLight/>
        </div>
        
    </div>
}