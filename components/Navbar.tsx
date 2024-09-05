import Link from "next/link";
import * as React from "react";

import { redirect } from "next/navigation";

import { Button } from "./ui/button";
import { DarkLight } from "./DarkLight";

import { userDetails } from "@/lib/store/atom/userDetails";
import { useRecoilState, useResetRecoilState } from "recoil";

export default function Navbar(){;
    const [userdetails,setUserdetails] = useRecoilState(userDetails);
    const clearUserDetails = useResetRecoilState(userDetails);
    return (
        <div className="p-4 font-bold flex justify-between cursor-pointer">
            <Link href="/">
                <h2>chat.city</h2>
            </Link>
            <div className="flex justify-between">
                {
                    userdetails.id && 
                    <Link href={"/"}>
                        <Button 
                        onClick={()=>{
                            clearUserDetails();
                            redirect("/login")
                        }}
                        className="mx-2" variant={"ghost"}>Logout</Button>
                    </Link>
                }
                {
                    !userdetails.id && <div>
                        <Link href={"/login"}><Button variant="ghost">LogIn</Button></Link>
                        <Link href={"/signup"}><Button className="px-2 mx-6" variant={"ghost"}>Signup</Button></Link>
                    </div>
                }
                <DarkLight/>
            </div>
        
        </div>
    )
}