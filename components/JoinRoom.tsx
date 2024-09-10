import { useState } from "react";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useRecoilState, useRecoilValue } from "recoil";
import { UserStateChats } from "@/lib/store/atom/chats";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";


export default function JoinRoomDialog(){
    const [roomid,setRoomId]=useState<string>("");
    const [rooms,setRooms]=useRecoilState(UserStateChats);
    const session = useSession();
    const router=useRouter();
    async function searchRoom(){

        if(session.status === "loading" || session.status === "unauthenticated")
            return;

        const room_already_joined = rooms.find((r)=>r.id == roomid);
        if(room_already_joined !== undefined)
        {
            router.push(`/home/chat/${roomid}`);
            return;
        }

        try{
            const resp=await fetch(`http://localhost:3001/chat/joinChat`,{
                method:"POST",
                body:JSON.stringify({
                    //@ts-ignore
                    memberId:session.data?.user?.id,
                    roomId:roomid
                }),
                headers:{
                    'Content-Type':"application/json"
                },
                credentials:"include"
            });

            const raw_resp=await resp.json();

            if(resp.status===201)
            {
                console.log("room found");
                const room_info=raw_resp.raw_data;
                setRooms([...rooms, room_info]);
                router.push(`/home/chat/${room_info.id}`)
            }
            else
            {
                alert("Room not found. Make sure the id is correct!!");
            }

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