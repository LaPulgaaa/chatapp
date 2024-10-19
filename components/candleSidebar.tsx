'use client'

import { ScrollArea } from "./ui/scroll-area";
import { Dialog,DialogTrigger } from "./ui/dialog";
import JoinRoomDialog from "@/components/JoinRoom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { HeartPulseIcon, MessageCircleIcon, PlusSquare, UserIcon, UserSearchIcon} from "lucide-react";
import { MessageSquareDotIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useSession } from "next-auth/react";
import CreateRoom from "./CreateRoom";
import Link from "next/link";
export default function CandleSidebar(){
    const router=useRouter();
    const session = useSession();

    function get_initials(){
        //@ts-ignore
        const names:string[]=session.data!.name?.split(" ");
        //@ts-ignore
        let initials = session.data.username?.substring(0,2);
        if(names){
            initials = names.map((name)=> name.charAt(0)).join("");
        }

        return initials;
    }
    
    return (
        <ScrollArea className = {`mr-1 pr-4 sticky pt-4 mt-1 block lg:hidden`}>
            <div className="flex flex-col items-center">
                {session.status === "authenticated" && 
                    <Link href={"/home"}>
                    <Avatar>
                        {/* @ts-ignore */}
                        <AvatarImage src={session.data.avatar_url}/>
                        <AvatarFallback>{get_initials()}</AvatarFallback>
                    </Avatar>
                    </Link>
                }
                <Button
                onClick={() => router.push("/home/explore")} 
                className="mt-1 p-1"
                variant={"ghost"} size={"icon"}><UserSearchIcon/></Button>
                <Button 
                className="mt-1 p-1"
                variant={"ghost"} size={"icon"}><HeartPulseIcon/></Button>
                <Dialog>
                    <DialogTrigger>
                        <div 
                        className="mt-1 p-2 hover:bg-gray-800 rounded-md ease-out duration-300 transition-all"
                        ><PlusSquare/></div>
                    </DialogTrigger>
                        <CreateRoom/>
                </Dialog>
                <Dialog>
                    <DialogTrigger>
                        <div 
                        className="mt-1 p-2 hover:bg-gray-800 rounded-md ease-out duration-300 transition-all"
                        ><MessageSquareDotIcon/></div>
                    </DialogTrigger>
                        <JoinRoomDialog/>
                </Dialog>
                <Button size={"icon"}
                className="mt-1 p-1"
                variant={"ghost"}
                onClick={()=>router.push("/home/profile")}
                >
                    <UserIcon/>
                </Button>
            </div>
            
        </ScrollArea>
    )
    
}