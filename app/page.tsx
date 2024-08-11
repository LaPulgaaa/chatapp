"use client"

import { useEffect } from "react";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowRightCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { userDetails } from "@/lib/store/atom/userDetails";
import {  useRecoilState } from "recoil";
export default function Home() {
  const router=useRouter()
  // const setUserDetails=useSetRecoilState(userDetails);
  const [userdetails,setUserDetails]=useRecoilState(userDetails);
  useEffect(()=>{
    async function is_cookie_alive(){
      try{
        const resp=await fetch("http://localhost:3001/user/me",{
          credentials:"include"
        });

        const {msg,data}=await resp.json();

        if(msg==="user identified" && window.localStorage.getItem("token") == "valid"){
          console.log("cookie still alive");

          setUserDetails({
            password:data.password,
            id:data.id,
            favorite:data.favorite,
            status:data.status,
            avatarurl:data.avatarurl,
            username:data.username,
            about:data.about
          })
          router.push("/home");
        }
        else{
          window.localStorage.clear();
        }
      }catch(err){
        console.log(err);
      }
    }
    is_cookie_alive();
  },[])

  return (
    <div>
      <Navbar/>
      <div className="grid justify-items-center m-48">
      <h1 className="italic scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-7xl">
        Chiller's Chat
      </h1>
      <h2 className="scroll-m-20 border-b pb-2 m-12 text-3xl font-semibold tracking-tight first:mt-0 hover:italic">
        Cause distance should never be a problem.
      </h2>
      <div className="flex px-4">
      <Button variant={"outline"} className="mx-4"
      onClick={()=>{
        router.push("/signup")
      }}
      >
        Get Started
        <ArrowRightCircleIcon className="hidden ml-2 hover:visible"/>
      </Button>
      <Button variant={"secondary"}>
        Learn more
      </Button>
      </div>
    </div>
    </div>
    
  );
}
