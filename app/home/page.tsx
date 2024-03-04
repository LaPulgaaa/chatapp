import { Button } from "@/components/ui/button";
import CreateRoom from "@/components/CreateRoom";
import { Dialog,DialogTrigger } from "@/components/ui/dialog";

export default function Home(){
    return <div className="mx-8 my-4">
        <div className="flex justify-between">
        <h4 className="scroll-m-20 p-2 text-2xl font-semibold tracking-tigh">
            Catch up on missed chats!
        </h4>
        <CreateRoom/>
        </div>
        
    </div>
}