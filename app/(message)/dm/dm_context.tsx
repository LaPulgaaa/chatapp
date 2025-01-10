import { 
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger
} from "@/components/ui/context-menu";
import { Copy, PinIcon, StarIcon, Trash, Trash2Icon} from "lucide-react";
import { UnitDM } from "./dm_ui";
import { Signal } from "@/app/home/signal";
import { useMemo } from "react";

export function DmContextMenu({children, dm, username}:{children: React.ReactNode, dm:UnitDM,username: string}){

    const delete_for_me_disabled = useMemo(() => {
        if(dm.sendBy.username !== username)
            return true;
        else 
            return false;
        //eslint-disable-next-line react-hooks/exhaustive-deps
    },[dm])

    const delete_for_ev_disabled = useMemo(() => {
        const timestamp = new Date(dm.createdAt).getTime();
        if(((Date.now() - timestamp)/60) <= 43200 && dm.sendBy.username === username)
        return false;
        else
        return true;
    //eslint-disable-next-line react-hooks/exhaustive-deps
    },[dm])

    function delete_msg(delete_for_me?: undefined | boolean){
        let msg;
        if(dm.is_local_echo === true){
            msg = JSON.stringify({
                type: "delete",
                payload: {
                    type: 'DM',
                    is_local_echo: true,
                    hash: dm.hash,
                    delete_for_me,
                    sender_id: username
                }
            })
        }
        else{
            msg = JSON.stringify({
                type: "delete",
                payload: {
                    type: 'DM',
                    is_local_echo: false,
                    id: dm.id,
                    delete_for_me,
                    sender_id: username
                }
            })
        }
        Signal.get_instance().SEND(msg);
        
    }

    return(
        <ContextMenu>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent className="w-64">
                <ContextMenuItem 
                disabled={delete_for_ev_disabled}
                inset onSelect={() => {
                    delete_msg();
                    console.log("Delete this shit")
                }}>
                    <Trash2Icon/><span className="ml-2">Delete for everyone</span>
                </ContextMenuItem>
                <ContextMenuItem 
                onSelect={() => {
                    delete_msg(true)
                }}
                disabled={delete_for_me_disabled}
                inset>
                    <Trash/><span className="ml-2">Delete for me</span>
                </ContextMenuItem>
                <ContextMenuSeparator/>
                <ContextMenuItem inset>
                    <PinIcon/><span className="ml-2">Pin</span>
                </ContextMenuItem>
                <ContextMenuItem inset>
                    <StarIcon/><span className="ml-2">Star</span>
                </ContextMenuItem>
                <ContextMenuSeparator/>
                <ContextMenuItem inset>
                    <Copy/><span className="ml-2">Copy</span>
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    )
}

