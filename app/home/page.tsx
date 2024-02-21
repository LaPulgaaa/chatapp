import { Button } from "@/components/ui/button";
import CreateRoom from "@/components/CreateRoom";
import { Dialog,DialogTrigger } from "@/components/ui/dialog";

export default function Home(){
    return <div className="mx-8 my-4">
        <div className="flex justify-between">
        <h3 className="scroll-m-20 p-2 text-2xl font-semibold tracking-tigh">
            Catch up on chats you missed...
        </h3>
        <CreateRoom/>
        <Dialog>
            
        </Dialog>
        </div>
        
    </div>
}