'use client'

import { Card,CardContent,CardDescription,CardFooter,CardHeader,CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";

export default function login(){
    const session = useSession();
    const [username,setUsername]=useState("");
    const [password,setPassword]=useState("");
    const router=useRouter();

    // a little shady
    useEffect(()=>{
      if(session.status === "authenticated")
        router.push("/home");
    },[])

  async function joinRoom(){
    try{
      const resp=await fetch(`http://localhost:3001/user/login`,{
        method:"POST",
        body:JSON.stringify({
          username,
          password
        }),
        headers:{
          'Content-Type':"application/json"
        },
        credentials:"include"

      });
      if(resp.status==200)
      {
        const {member}=await resp.json();
        router.push("/home");
      }
      else if(resp.status==404)
      {
        alert("Looks like you are new here!! Please sign to join chat!")
      }
    }catch(err)
    {
      console.log(err)
    }
  }


return(
      <div>
        <Navbar/>
        <div className='m-18 flex  flex-col items-center'>
          <h2 className="scroll-m-20 border-b pb-2 m-6 text-3xl font-semibold tracking-tight first:mt-0 ">
            Welcome Back !
          </h2>
        <Card className='w-[500px] p-6'>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Fill in the details to join your peers! </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                  onChange={(e)=>{
                    setUsername(e.target.value)
                  }}
                  value={username} id="email" placeholder="Username" />
                </div>
                <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                  <Input 
                  type="password"
                  onChange={(e)=>{
                    setPassword(e.target.value)
                  }}
                  value={password} id="password" placeholder="Password" />
                </div>
              </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button onClick={joinRoom} className='w-full my-2'>Log in</Button>
          </CardFooter>

          
        </Card>
        
        <Button variant={"link"} onClick={()=>router.push("/signup")}>Don't have an account ?</Button>
      </div>
    </div>
  )
}