'use client'

import { useRecoilValue, useResetRecoilState, useSetRecoilState } from "recoil";
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { tokenState } from "@/lib/store/atom/Token";

export default function Navbar(){
    const resetToken=useResetRecoilState(tokenState)
    const router=useRouter();
    const token=useRecoilValue(tokenState);
    return <div className="p-4 font-bold flex justify-between cursor-pointer">
        <h2 onClick={()=>router.push("/")}>chatcity</h2>
        <div className="flex justify-between">
        {token!==undefined?<Button
         onClick={()=>{
            resetToken();
            router.push("/")
         }}
         variant={"ghost"}>Logout</Button>:<Button variant="ghost" onClick={()=>router.push("/login")}>LogIn</Button>}
        <Button onClick={()=>{
            router.push("/signup")
        }}>Signup</Button>
        </div>
    </div>
}