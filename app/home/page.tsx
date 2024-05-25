"use client"
import { Button } from "@/components/ui/button";
import CreateRoom from "@/components/CreateRoom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { userDetails } from "@/lib/store/atom/userDetails";
import { useEffect, useState } from "react";
import { UserChatResponseSchema } from "@/packages/zod";
import type { ChatReponse } from "@/packages/zod";
import { UserStateChats } from "@/lib/store/atom/chats";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
export default function Home(){
    const router=useRouter();
    const profile_info=useRecoilValue(userDetails);
    const [rooms,setRooms]=useRecoilState(UserStateChats)
    const [loader,setLoader]=useState(true);
    const id=profile_info.id;
    useEffect(()=>{
        async function get_user_chats(){
            try{
                const resp=await fetch(`http://localhost:3001/chat/subscribedChats/${id}`,{
                    credentials:"include"
                });
                //TODO:add zod here before using the returned data
                const {raw_data}=await resp.json();
                if(Array.isArray(raw_data) && raw_data.length>0)
                {
                    const data=UserChatResponseSchema.parse(raw_data);
                    console.log(data);
                    setLoader(false);
                    setRooms(data);
                }
                
            }catch(err)
            {
                console.log(err);
            }
        }
        get_user_chats()
    },[id])

   

    const RoomsComponents=rooms?.map((room)=>{
        return <div key={room.id} 
        className="p-3 dark:bg-white rounded-md dark:text-black m-1 cursor-pointer hover:bg-stone-300 border-2 ease-out duration-300 transition-all"
        onClick={()=>{
            router.push(`/home/chat/${room.id}`)
        }}
        >
            <div className="flex justify-between">
            <h5 className="border-l-2 text-xl font-semibold scroll-m-20 tracking-light pl-2">{room.name}</h5>
            <p className="hidden md:block">{room.createdAt.substring(0,room.createdAt.indexOf("T"))}</p>
            </div>
            
            <p className="border-l-2 pl-6 italic">{room.discription}</p>
        </div>
    })
    if(loader===true){
        <div className="flex text-center ">Loading...</div>
    }
    return <div>
        <Navbar/>
        <div className="ml-8 my-4 grid md:grid-cols-5  h-full pb-24 m-2">
                <Sidebar/>
                <div className="md:col-span-4 mr-4 ml-2 pt-2">
                    <div className="grid grid-cols md:flex w-inherit justify-between">
                    <h4 className="scroll-m-20 p-2 text-2xl font-semibold tracking-tigh">
                        Catch up on missed chats!
                    </h4>
                    <CreateRoom/>
                    </div>
                    {RoomsComponents}
                </div>
            </div>
    </div>
}