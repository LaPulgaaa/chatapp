'use client'

import { useSession } from "next-auth/react"
import React, { useEffect, useState } from "react"
import { search_by_username } from "./actions";

import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchIcon } from "lucide-react";

type ProfileSearch = {
    username: string,
    avatarurl: string | null,
    name: string | null,
};

export default function Search(){
    const [search, setSearch] = useState<ProfileSearch[]>([]);
    const [cred, setCred] = useState<string>("");
    const session = useSession();

    useEffect(()=>{
        if(cred.length > 3 && session.status === "authenticated"){
            const search_user = async () => {
                //@ts-ignore
                const results = await search_by_username(cred,session.data.username, session.data.user?.name);
                setSearch(results);
            }

            search_user();
        }
        else {
            setSearch([]);
        }
    },[cred])
    return(
        <div className="flex flex-col my-24 mx-24">
            <div className="flex w-full rounded-md border-2">
                <SearchIcon className="mt-2 mx-2"/>
                <Input 
                className="w-full"
                placeholder="Search by username or name"
                type="text"
                onChange={(e) => {
                    setCred(e.target.value);
                }}
                />
            </div>
            <div>
                {
                    search.map((member) => {
                        let initials = member.username.substring(0,2);
                        const names = member.name?.split(" ");
                        if(names){
                            initials = names.map((name)=> name.charAt(0)).join("");
                        }
                        return(
                            <div className="bg-slate-800 rounded-md">
                                <div key={member.username} 
                                className={`flex justify-between rounded-md p-1 w-full h-[72px] m-1`}>
                                <div className="flex item-center p-2">
                                    <Avatar className="mr-1">
                                        <AvatarImage src={member.avatarurl ?? ""}/>
                                        <AvatarFallback>{initials}</AvatarFallback>
                                    </Avatar>
                                    <div className="mx-1 px-1 mx-1">
                                        <div>{member.username}</div>
                                        <div className="italic text-muted-foreground truncate w-[124px] text-[15px]">{member.name ?? "User does not have a name"}</div>
                                    </div>
                                </div>
                                <br/>
                            </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}