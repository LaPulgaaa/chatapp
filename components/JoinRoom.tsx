import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useRecoilState, useRecoilValue } from "recoil";
import { UserStateChats } from "@/lib/store/atom/chats";
import { UserChatResponseSchema } from "@/packages/zod";
import { useRouter } from "next/navigation";
import { userDetails } from "@/lib/store/atom/userDetails";

export default function JoinRoomDialog(){
    const [roomid,setRoomId]=useState<string>("");
    const [room,setRoom]=useRecoilState(UserStateChats);
    const profile_info=useRecoilValue(userDetails)
    const router=useRouter();
    async function searchRoom(){
        try{
            const resp=await fetch(`http://localhost:3000/chat/joinChat`,{
                method:"POST",
                body:JSON.stringify({
                    memberId:profile_info.id,
                    roomId:roomid
                }),
                headers:{
                    'Content-Type':"application/json"
                }
            });
            const raw_resp=await resp.json();
            if(resp.status===201)
            {
                console.log("room found");
                const room_info=raw_resp.raw_data;
                console.log(raw_resp.raw_opcode);
                setRoom([room_info,...room]);
                router.push(`/home/chat/${room_info.id}`)
            }
            else
            console.log("not found");
        }catch(err){
            console.log(err);
            alert(err);
        }
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    Join your friends !! Yayy
                </DialogTitle>
                <DialogDescription>Enter the room-id and press the button</DialogDescription>
            </DialogHeader>
            <div>
                <div className="flex flex-col space-y-1.5">
                <Label htmlFor="roomid">Room Id</Label>
                <Input 
                type="text" placeholder="Enter a valid room id"
                value={roomid}
                onChange={(e)=>setRoomId(e.target.value)}
                />
                </div>
                
            </div>
            <DialogFooter>
                <Button
                className={`w-full`}
                onClick={searchRoom}
                >
                    Join Room
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}