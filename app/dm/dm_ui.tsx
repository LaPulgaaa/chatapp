
import { 
    Avatar,
    AvatarImage,
    AvatarFallback
} from "@/components/ui/avatar";

export type UnitDM = {
    id: number;
    content: string;
    createdAt: string;
    sendBy: {
        username: string;
    };
};

export default function DmRender({dm, username, friend_avatar}:{dm: UnitDM, username: string, friend_avatar: string | null}){
    function create_timestamp(createdAt:string){
        const time =  (new Date(createdAt).toTimeString().split(" ")[0]).split(":").slice(0,-1);
        return `${time[0]}:${time[1]}`;
    }
    return(
        <div key={dm.id}>
        {
            dm.sendBy.username !== username ? 
            <div className="flex m-2">
                <Avatar className={`border-2 border-slate-400 mr-2 mt-1`}>
                    <AvatarImage src={friend_avatar ?? ""}/>
                    <AvatarFallback className="bg-slate-200 dark:bg-slate-900">{dm.sendBy.username.substring(0,2)}</AvatarFallback>
                </Avatar>
                <div className={`border-2 pb-1 mr-2 p-2 bg-slate-200 dark:bg-slate-900  max-w-prose rounded-md flex`}>
                    <p className="italic text-wrap">{dm.content}</p>
                    <p className="flex justify-end text-[10px] mt-3 ml-2">{create_timestamp(dm.createdAt)}</p>
                </div>
            </div> : 
            <div className="flex m-2 justify-end">
                <div className={`border-2 pb-1 mr-2 p-2 bg-slate-200 dark:bg-slate-900  max-w-prose rounded-md flex`}>
                    <p className="italic text-wrap">{dm.content}</p>
                    <p className="flex justify-end text-[10px] mt-3 ml-2">
                        {create_timestamp(dm.createdAt)}
                    </p>
                </div>
            </div>
        }
    </div>
    )
}