import { HamburgerMenuIcon } from "@radix-ui/react-icons";


import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

type DropdownMenuRoomDetails = {
    id: string,
    name: string,
    description: string,
}

export default function HeaderDropdown({room_details}:{room_details: DropdownMenuRoomDetails}){

    function copy_room_code_to_clipboard(){
        navigator.clipboard.writeText(room_details.id).then(() => {
            toast({
                title: "Room code copied to clipboard!",
                duration: 2000,
            })
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Button variant={"ghost"} size={"icon"}><HamburgerMenuIcon/></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>
                    <p className="cursor-pointer" onClick={copy_room_code_to_clipboard}>Copy room code</p>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}