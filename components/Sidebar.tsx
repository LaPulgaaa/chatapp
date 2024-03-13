import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { SettingsIcon ,MessageCircleIcon, UserIcon} from "lucide-react";
import { userDetails } from "@/lib/store/atom/userDetails";
import { useRecoilValue } from "recoil";
export default function Sidebar(){
    const user_creds=useRecoilValue(userDetails);
    const names=user_creds.username?.split("") ?? ["John","Doe"];
    const initials=names[0].charAt(0)+names[1].charAt(0);
    return (
        <ScrollArea className="rounded-sm border-2 p-2 h-inherit sticky">
            <div className="flex py-1 pb-2 text-center">
                <Avatar>
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <h6 className="pt-2 ml-5">{user_creds.username}</h6>
            </div>
            <div className=" grid grid-cols-1 divide-y mr-1">
            <div className=" flex cursor-pointer my-[1/2] w-full hover:bg-gray-400 p-2 dark:hover:bg-gray-800 rounded-md ease-out duration-300 transition-all"><MessageCircleIcon/><p className="ml-2">Direct Messages</p></div>
            <div className="flex cursor-pointer my-[1/2] w-full hover:bg-gray-400 p-2 dark:hover:bg-gray-800 rounded-md ease-out duration-300 transition-all"><UserIcon/><p className="ml-3">Set Status</p></div>
            <div className="flex cursor-pointer my-[1/2] w-full hover:bg-gray-400 p-2 dark:hover:bg-gray-800 rounded-md ease-out duration-300 transition-all"><SettingsIcon/><p className="ml-2">Settings</p></div>
            </div>
            
        </ScrollArea>
    )
    
}