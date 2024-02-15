'use client'
import { Card,CardContent,CardDescription,CardFooter,CardHeader,CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useSetRecoilState,useRecoilValue  } from "recoil";
import { useRouter } from "next/navigation";
import { tokenState } from "@/lib/store/atom/Token";
import { userDetails } from "@/lib/store/atom/userDetails";

export default function login(){
    const setUserDetails=useSetRecoilState(userDetails);
    const setToken=useSetRecoilState(tokenState);
    const token=useRecoilValue(tokenState);
    const [username,setUsername]=useState("");
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
          setUserDetails(member);
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


    return  <div className='m-18 flex  flex-col items-center'>
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
  <CardFooter>
    <Button onClick={joinRoom} className='w-full'>Log in</Button>
  </CardFooter>
    </Card>
    <Button variant={"link"} onClick={()=>router.push("/signup")}>Don't have an account ?</Button>
  </div>
}