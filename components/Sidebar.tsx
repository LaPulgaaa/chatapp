import { ScrollArea } from "./ui/scroll-area";
import { Dialog,DialogTrigger } from "./ui/dialog";
import JoinRoomDialog from "@/components/JoinRoom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { HeartPulseIcon, MessageCircleIcon, UserIcon} from "lucide-react";
import { MessageSquareDotIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
export default function Sidebar(){
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
        <ScrollArea className = {`mr-2 p-2 sticky pt-4 mt-1 hidden lg:block`}>
           {session.status === "authenticated" && <div className="flex ml-1 pb-2 text-center cursor-pointer justify-between">
                    <div className="flex  w-full">
                        <Avatar className = "">
                            {/* @ts-ignore */}
                            <AvatarImage src={session.data.avatar_url}/>
                            <AvatarFallback>{get_initials()}</AvatarFallback>
                        </Avatar>
                        {/* @ts-ignore */}
                        <h6 className="pt-2 ml-2">{session.data.name ?? ""}</h6>
                    </div>
                <br/>
            </div>}
            <div className="text-center sm:text-left grid grid-cols-1 divide-y">
                <div className="flex cursor-pointer my-[1/2] w-full hover:bg-gray-500 p-2 dark:hover:bg-gray-800 rounded-md ease-out duration-300 transition-all"><MessageCircleIcon/><p className="ml-2">Direct Messages</p></div>
                <div className="flex cursor-pointer my-[1/2] w-full hover:bg-gray-500 p-2 dark:hover:bg-gray-800 rounded-md ease-out duration-300 transition-all"><HeartPulseIcon/><p className="ml-3">Set Status</p></div>
                <Dialog>
                    <DialogTrigger>
                        <div className="flex cursor-pointer my-[1/2] w-full hover:bg-gray-500 p-2 dark:hover:bg-gray-800 rounded-md ease-out duration-300 transition-all"><MessageSquareDotIcon/> <p className="ml-3">Join Room</p></div>
                    </DialogTrigger>
                        <JoinRoomDialog/>
                </Dialog>
                <div className="flex cursor-pointer my-[1/2] w-full hover:bg-gray-500 p-2 dark:hover:bg-gray-800 rounded-md ease-out duration-300 transition-all"
                onClick={()=>router.push("/home/profile")}
                >
                    <UserIcon/><p className="ml-2">Profile</p>
                </div>
            </div>
            
        </ScrollArea>
    )
    
}