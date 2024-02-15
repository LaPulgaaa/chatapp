'use client'
import { Card,CardContent,CardDescription,CardFooter,CardHeader,CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useSetRecoilState,useRecoilValue  } from "recoil";
import { userState } from "@/lib/store/atom/User";
import { useRouter } from "next/navigation";
import { tokenState } from "@/lib/store/atom/Token";

export default function login(){

    const setToken=useSetRecoilState(tokenState);
    const token=useRecoilValue(tokenState);
    const [username,setUsername]=useState("");
    const setUser=useSetRecoilState(userState);
    const [password,setPassword]=useState("");
    const router=useRouter();


  async function joinRoom(){
    console.log("button clicked")
    
    if(token)
    router.push("/home");
    else
    {
      
      try{
        const resp=await fetch(`http://localhost:3000/user/login`,{
          method:"POST",
          body:JSON.stringify({
            username,
            password
          }),

        });
        if(resp.status==200)
        {
          const {token,member}=await resp.json();
          console.log(member)
          console.log(token)
          setToken(token);
          router.push("/home");
        }
        else if(resp.status==404)
        {
          alert("Looks like you are new here!! Please sign to join chat!")
        }
      }catch(err)
      {
        console.log(err);
      }
    }
  }


    return  <div className='m-24 flex justify-center'>
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
  <CardFooter>
    <Button onClick={joinRoom} className='w-full'>Log In</Button>
  </CardFooter>
    </Card>
  </div>
}