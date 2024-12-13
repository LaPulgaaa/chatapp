import { Signal } from "@/app/home/signal";
import { DropdownMenuIcon } from "@radix-ui/react-icons";
import { ChevronDownSquare, MoreVertical, MoreVerticalIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

export type UnitDM = ({
    is_local_echo?: false | undefined,
} | {
    is_local_echo: true,
    hash: string
}) & {
    id: number;
    content: string;
    createdAt: string;
    sendBy: {
        username: string;
    },
};

type MessageDeleteDetails = {
    is_local_echo?: false | undefined,
    id: number 
} | {
    is_local_echo: true,
    hash: string,
}
export default function DmRender({dm, username,id }:{dm: UnitDM, username: string,id: string}){
    const [hover,setHover] = useState<boolean>(false);
    function create_timestamp(createdAt:string){
        const time =  (new Date(createdAt).toTimeString().split(" ")[0]).split(":").slice(0,-1);
        return `${time[0]}:${time[1]}`;
    }
    function delete_msg(msg_details:MessageDeleteDetails){
        let msg;
        if(msg_details.is_local_echo === true){
            msg = JSON.stringify({
                type: "delete",
                payload: {
                    type: 'DM',
                    is_local_echo: true,
                    hash: msg_details.hash,
                }
            })
        }
        else{
            msg = JSON.stringify({
                type: "delete",
                payload: {
                    type: 'DM',
                    is_local_echo: false,
                    id: msg_details.id,
                }
            })
        }
        Signal.get_instance().SEND(msg);
        
    }
    
    function maybe_set_hover(createdAt: string){
        const timestamp = new Date(createdAt).getTime();

        if(((Date.now() - timestamp)/60) <= 43200)
        setHover(true);
        else
        setHover(false);
    }

    return(
        <div key={dm.id} id={id}>
        {
            dm.sendBy.username !== username ? 
            <div className="flex m-2">
                <div className={`border-2 pb-1 mr-2 p-2 bg-slate-200 dark:bg-slate-900  max-w-prose rounded-md flex`}>
                    <p className="italic text-wrap">{dm.content}</p>
                    <p className="flex justify-end text-[10px] mt-3 ml-2">{create_timestamp(dm.createdAt)}</p>
                </div>
            </div> : 
            <div 
            className="flex m-2 justify-end mr-3">
                <div 
                onMouseEnter={() => maybe_set_hover(dm.createdAt)}
                onMouseLeave={() => setHover(false)}
                className={`border-2 mr-2 bg-slate-200 dark:bg-slate-900  max-w-prose rounded-md flex`}>
                    <p className="italic text-wrap pl-2 py-2 pr-1">{dm.content}</p>
                    <div className="relative px-1 space-y-1 mx-2 pr-1 pl-4">
                        <Trash2Icon 
                        onClick={() => {
                            if(dm.is_local_echo){
                                delete_msg({
                                    is_local_echo: true,
                                    hash: dm.hash
                                })
                            }
                            else{
                                delete_msg({
                                    id: dm.id
                                })
                            }
                        }}
                        className={`absolute top-0 right-0 w-[16px] h-[16px] pt-1 ${hover ? 'block' : 'hidden'}`}/>
                        <p className="absolute bottom-0 right-0 justify-end text-[10px]">
                        {create_timestamp(dm.createdAt)}
                    </p>
                    </div>
                    
                </div>
            </div>
        }
    </div>
    )
}