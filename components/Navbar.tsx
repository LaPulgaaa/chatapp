'use client'

import { Button } from "./ui/button"
import { useRouter } from "next/navigation"

export default function Navbar(){
    const router=useRouter();
    return <div className="p-4 font-bold flex justify-between cursor-pointer">
        <h2 onClick={()=>router.push("/")}>chatcity</h2>
        <div className="flex justify-between">
        <Button variant={"ghost"}>Login</Button>
        <Button variant="ghost">Signup</Button>
        </div>
    </div>
}