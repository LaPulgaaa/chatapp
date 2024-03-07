'use client'

import { useRecoilValue, useResetRecoilState, useSetRecoilState } from "recoil";
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react";
import * as React from "react";
import { MoonIcon,SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger,} from "@/components/ui/dropdown-menu"

export default function Navbar(){
    const {setTheme}=useTheme();
    const router=useRouter();
    const [token,setToken]=useState(window.localStorage.getItem("token"));
    console.log(token)
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
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size={"icon"}>
                <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle Theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={()=>setTheme('Light')}>
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={()=>setTheme('dark')}>
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={()=>setTheme('system')}>
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        </div>
        
    </div>
}