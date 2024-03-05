"use client"
import { Button } from "@/components/ui/button";
import CreateRoom from "@/components/CreateRoom";
import { Dialog,DialogTrigger } from "@/components/ui/dialog";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { userDetails } from "@/lib/store/atom/userDetails";
import { useEffect, useState } from "react";
import { UserChatResponseSchema } from "@/packages/zod";
import type { ChatReponse } from "@/packages/zod";
import { UserStateChats } from "@/lib/store/atom/chats";
export default function Home(){
    const profile_info=useRecoilValue(userDetails);
    const [rooms,setRooms]=useRecoilState(UserStateChats)
    const [loader,setLoader]=useState(true);
    useEffect(()=>{
        async function get_user_chats(){
            try{
                const resp=await fetch(`http://localhost:3000/chat/subscribedChats/${profile_info.id}`);
                //TODO:add zod here before using the returned data
                const {raw_data}=await resp.json();
                const data=UserChatResponseSchema.parse(raw_data);
                console.log(data);
                setLoader(false);
                setRooms(data);
            }catch(err)
            {
                console.log(err);
            }
        }
        get_user_chats()
    },[])

    const RoomsComponents=rooms?.map((room)=>{
        return <div key={room.id} className="p-3 bg-white rounded-md text-black m-1 cursor-pointer hover:bg-stone-200 border-2">
            <div className="flex justify-between">
            <h5 className="border-l-2 text-xl font-semibold scroll-m-20 tracking-light pl-2">{room.name}</h5>
            <p>{room.createdAt.substring(0,room.createdAt.indexOf("T"))}</p>
            </div>
            
            <p className="border-l-2 pl-6 italic">{room.discription}</p>
        </div>
    })
    if(loader===true){
        <div className="flex text-center ">Loading...</div>
    }
    return <div className="mx-8 my-4">
        <div className="flex justify-between">
        <h4 className="scroll-m-20 p-2 text-2xl font-semibold tracking-tigh">
            Catch up on missed chats!
        </h4>
        <CreateRoom/>
        </div>
        {RoomsComponents}
    </div>
}