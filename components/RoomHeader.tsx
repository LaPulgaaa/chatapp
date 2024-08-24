import { useEffect, useState } from "react";
import { DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import type { RoomMemberDetails } from "@/packages/zod";
import { room_member_details_schema } from "@/packages/zod";

type RoomDetails = {
    name: string,
    discription: string,
    createdAt: string,
    room_id: string,
}

export default function RoomHeader({room_details}:{room_details: RoomDetails}){
    return (
        <div className="w-full mx-2">
            <DropdownMenu>
                <div className="mr-2">
                    <DropdownMenuTrigger className="w-full flex px-3 py-1 mx-2 border-[1.5px] border-slate-800 rounded">
                        <h4 className="scroll-m-20 text-xl pb-1 font-semibold tracking-tight mr-3">
                            {room_details.name}
                        </h4>
                        <h5 className="truncate border-l-2 pl-4 italic pt-1">
                            {room_details.discription}
                        </h5>
                    </DropdownMenuTrigger>
                </div>
                <DropdownMenuContent className="w-full">
                    <DropdownMenuLabel>Members</DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    <Members room_id={room_details.room_id}/>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

export function Members({room_id}:{room_id: string}){
    const [members,SetMembers] = useState<RoomMemberDetails>([]);

    useEffect(()=>{
        const fetch_members = async()=>{
            try{
                const resp = await fetch(`http://localhost:3001/chat/getMembers/${room_id}`,{
                    credentials: "include",
                });
                if(resp.status === 200){
                    const { raw_data } = await resp.json();
                    console.log(raw_data)
                    const parsed = room_member_details_schema.safeParse(raw_data);
                    if(parsed.success)
                    SetMembers(parsed.data);
                    else
                    console.log(parsed.error);

                }
            }catch(err){
                console.log(err);
            }
        }
        fetch_members();
    },[room_id]);
    return (
        <ScrollArea className="w-[724px]">
            <div className="">
                {
                    members.map((member)=>{
                        return (
                            <div key={member.username}>
                                <DropdownMenuItem className="flex w-full justify-between">
                                <div className="flex justify-start">
                                    <Avatar className="mt-1">
                                        <AvatarImage src={member.avatarurl ?? "https://github.com/shadcn.png"}/>
                                        <AvatarFallback>{member.username.substring(0,2)}</AvatarFallback>
                                    </Avatar>
                                    <div className="mx-3">
                                        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                                            {member.username}
                                        </h4>
                                        <blockquote className="mt-1 border-l-2 pl-2 italic">
                                            {member.status ?? ""}
                                        </blockquote>
                                    </div>
                                </div>
                                <div>
                                    <Badge
                                    className={`justify-end p-1 mx-4 ${member.active ? `bg-rose-500`:`bg-green-500`}`} 
                                    >
                                        {member.active ? "active" : "inactive"}
                                    </Badge>
                                </div>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator/>
                            </div>
                        )
                    })
                }
            </div>
        </ScrollArea>
    )
}