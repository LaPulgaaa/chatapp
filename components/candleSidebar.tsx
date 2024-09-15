import { ScrollArea } from "./ui/scroll-area";
import { Dialog,DialogTrigger } from "./ui/dialog";
import JoinRoomDialog from "@/components/JoinRoom";
import { ChevronRightIcon , HeartPulseIcon, MessageCircleIcon, UserIcon} from "lucide-react";
import { MessageSquareDotIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRecoilState } from "recoil";
import { mainSidebarState } from "@/lib/store/atom/mainSidebar";
import { Button } from "./ui/button";
export default function CandleSidebar(){
    const router=useRouter();
    const [hidden,setHidden] = useRecoilState(mainSidebarState);
    
    return (
        <ScrollArea className = {`mr-1 pr-4 sticky pt-4 mt-1`}>
            <div className="text-center sm:text-left grid grid-cols-1 mx-1 ">
                <div><Button
                className="mt-1 hidden md:block pl-2"
                onClick={()=>setHidden(!hidden)}
                variant={"ghost"}
                 size={"icon"}><ChevronRightIcon/></Button></div>
                <Button 
                className="mt-1"
                variant={"ghost"} size={"icon"}><MessageCircleIcon/></Button>
                <Button 
                className="mt-1"
                variant={"ghost"} size={"icon"}><HeartPulseIcon/></Button>
                <Dialog>
                    <DialogTrigger>
                        <Button 
                        className="mt-1"
                        variant={"ghost"} size={"icon"}><MessageSquareDotIcon/></Button>
                    </DialogTrigger>
                        <JoinRoomDialog/>
                </Dialog>
                <Button size={"icon"}
                className="mt-1"
                variant={"ghost"}
                onClick={()=>router.push("/home/profile")}
                >
                    <UserIcon/>
                </Button>
            </div>
            
        </ScrollArea>
    )
    
}