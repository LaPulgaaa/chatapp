import { DrawingPinFilledIcon, StarFilledIcon } from "@radix-ui/react-icons";
import { DmContextMenu } from "./dm_context";
import { useMemo } from "react";

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
    pinned: boolean,
    starred: string[],
};

export default function DmRender({dm, username,id }:{dm: UnitDM, username: string,id: string}){
    function create_timestamp(createdAt:string){
        const time =  (new Date(createdAt).toTimeString().split(" ")[0]).split(":").slice(0,-1);
        return `${time[0]}:${time[1]}`;
    }
    
    const dm_created_at = useMemo(() => {
        return create_timestamp(dm.createdAt)
    },[dm.createdAt])

    return(
        <div key={dm.id} id={id}>
        {
            dm.sendBy.username !== username ? 
            <div 
            id={dm.is_local_echo ? `dm-${dm.hash}` : `dm-${dm.id.toString()}`}
            className="flex m-2">
                <DmContextMenu dm={dm} username={username}>
                    <div className={`w-full border-2 pb-1 mr-2 bg-slate-200 dark:bg-slate-900  max-w-prose rounded-md flex`}>
                        <p className="w-7/8 italic text-wrap mx-2 my-2">{dm.content}</p>
                        <div className="flex flex-col gap-2 mt-1 mr-1">
                            <div className="justify-end flex-1 ml-4">{dm.starred.includes(username) && <StarFilledIcon/>}</div>
                            <div className="w-full flex flex-row gap-1 justify-end text-[10px] ml-2 mr-1">
                                <div>{dm.pinned && <DrawingPinFilledIcon/>}</div>
                                <p>{dm_created_at}</p>
                            </div>
                        </div>
                    </div>
                </DmContextMenu>
            </div> : 
            <div
            id={dm.is_local_echo ? `dm-${dm.hash.substring(0,4)}` : `dm-${dm.id.toString()}`}
            className="flex m-2 justify-end mr-3">
                <DmContextMenu dm={dm} username={username}>
                    <div
                    className={`w-full border-2 pb-1 mr-2 bg-slate-200 dark:bg-slate-900  max-w-prose rounded-md flex`}>
                        <p className="w-7/8 italic text-wrap mx-2 my-2">{dm.content}</p>
                        <div className="flex flex-col gap-2 mt-1 mr-1">
                            <div className="w-full flex-1 flex justify-end ml-4 ">{dm.starred.includes(username) && <StarFilledIcon className="justify-end mr-2"/>}</div>
                            <div className="w-full flex flex-row gap-1 justify-end text-[10px] ml-2">
                                <div>{dm.pinned && <DrawingPinFilledIcon/>}</div>
                                <p>{dm_created_at}</p>
                            </div>
                        </div>
                    </div>
                </DmContextMenu>
            </div>
        }
        </div>
    )
}