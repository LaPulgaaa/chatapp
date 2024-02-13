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
    const [email,setEmail]=useState("");
    const setUser=useSetRecoilState(userState);
    const [room,setRoom]=useState("");
    const router=useRouter();


  async function joinRoom(){
    console.log("button clicked")
    setUser({
      name:email,
      roomId:room
    });
    if(token)
    router.push("/chat");
    else
    {
      
      try{
        const resp=await fetch(`http://localhost:3000/user/findUser/${email}`);
        if(resp.status==200)
        {
          const {token,user}=await resp.json();
          console.log(user)
          console.log(token)
          setToken(token);
          router.push("/chat");
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


    return  <div className='ml-12 p-4 flex justify-center'>
    <Card className='w-[400px]'>
      <CardHeader>
        <CardTitle>Join a Room</CardTitle>
        <CardDescription>Fill in the chat room details to join</CardDescription>
      </CardHeader>
      <CardContent>
      <div className="grid w-full items-center gap-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="emailId">Email</Label>
          <Input 
          onChange={(e)=>{
            setEmail(e.target.value)
          }}
          value={email} id="email" placeholder="Enter your email id" />
        </div>
        <div className="flex flex-col space-y-1.5">
        <Label htmlFor="id">Chatid</Label>
          <Input 
          onChange={(e)=>{
            setRoom(e.target.value)
          }}
          value={room} id="id" placeholder="Id of your chat room" />
        </div>
      </div>
  </CardContent>
  <CardFooter>
    <Button onClick={joinRoom} className='w-full'>Join/Create Chat</Button>
  </CardFooter>
    </Card>
  </div>
}