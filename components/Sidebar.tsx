import { ScrollArea } from "./ui/scroll-area";
import { Dialog,DialogTrigger } from "./ui/dialog";
import JoinRoomDialog from "@/components/JoinRoom";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { SettingsIcon ,MessageCircleIcon, UserIcon} from "lucide-react";
import { userDetails } from "@/lib/store/atom/userDetails";
import { MessageSquareDotIcon } from "lucide-react";
import { useRecoilValue } from "recoil";
import { useRouter } from "next/navigation";
export default function Sidebar(){
    const router=useRouter();
    const user_creds=useRecoilValue(userDetails);
    const names=user_creds.username?.split("") ?? ["John","Doe"];
    const initials=names[0].charAt(0)+names[1].charAt(0);
    return (
        <ScrollArea className="mx-2 rounded-sm border-2 p-2 sticky pt-4 ">
            <div className="flex ml-1 pb-2 text-center cursor-pointer">
                <Avatar className="">
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <h6 className="pt-2 ml-2">{user_creds.username}</h6>
                <br/>
            </div>
            <div className="text-center sm:text-left grid grid-cols-1 divide-y mr-1">
                <div className="flex cursor-pointer my-[1/2] w-full hover:bg-gray-500 p-2 dark:hover:bg-gray-800 rounded-md ease-out duration-300 transition-all"><MessageCircleIcon/><p className="ml-2">Direct Messages</p></div>
                <div className="flex cursor-pointer my-[1/2] w-full hover:bg-gray-500 p-2 dark:hover:bg-gray-800 rounded-md ease-out duration-300 transition-all"><UserIcon/><p className="ml-3">Set Status</p></div>
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