"use client"

import { memo } from "react";

import { useRecoilValueLoadable} from "recoil";
import { useRouter } from "next/navigation";
import type { ChatReponse, PrivateChats } from "@/packages/zod";
import { useSession } from "next-auth/react";
import { fetch_dms } from "@/lib/store/selector/fetch_dms";
import { subscribed_chats_state } from "@/lib/store/atom/subscribed_chats_state";
import { direct_msg_state } from "@/lib/store/atom/dm";

function get_last_msg_time(lastmsgAt: string | undefined): string {

    if(lastmsgAt === undefined)
        return "-";

    let last_msg_date = new Date(lastmsgAt);
    let now_date = new Date();

    if(
        last_msg_date.getFullYear() != now_date.getFullYear() ||
        last_msg_date.getMonth() != now_date.getMonth()
    )
        return last_msg_date.toDateString();

    else if(now_date.getDate() - last_msg_date.getDate() > 7)
    {
        let date_arr = last_msg_date.toDateString().split(" ");
        return (date_arr[1]+" "+date_arr[2]).toString()
    }

    else
    {
        if(now_date.getDate() - last_msg_date.getDate() > 1)
            return last_msg_date.toDateString().split(" ")[0];

        else if(now_date.getDate() - last_msg_date.getDate() == 1)
            return "Yesterday";

        else 
        {
            let today_at = last_msg_date.toTimeString().split(" ")[0];
            let hour_min = today_at.split(":").slice(0, -1);
            return `${hour_min[0]}:${hour_min[1]}`
        }
    }

}

export default function Home(){
    const session = useSession();
    const roomsStateData = useRecoilValueLoadable(subscribed_chats_state);
    const dmStateData = useRecoilValueLoadable(direct_msg_state);
    //@ts-ignore
    const id: string | undefined = session.data?.id;

    return(
        <div className="lg:col-span-4 mr-4 ml-2 pt-2">
            {session.status === "authenticated" ? <div className="">
                    <h4 className="scroll-m-20 p-2 text-2xl font-semibold tracking-tigh">
                        Catch up on missed chats!
                    </h4>
                    
                    {
                        (
                            roomsStateData.state === "hasValue" &&
                            dmStateData.state === "hasValue"
                        ) ?
                        //@ts-ignore
                        <RoomTabs rooms={roomsStateData.getValue()!} dms={dmStateData.getValue()!} username={session.data.username}/> :
                        <div>Loading chats....</div>
                    }
                </div> : <div>Loading...</div>
            }
        </div>
    )
}

//eslint-disable-next-line react/display-name
const RoomTabs = memo(
    function({rooms, dms, username}:{rooms:ChatReponse, dms:PrivateChats, username: string}){
    const router = useRouter();

    // `rooms` is a state variable so we can not mutate it
    // instead copy it over and sort accordingly
    let chats = rooms.map((room) => ({type: "chat" as const, ...room}));
    let direct_msgs = dms.map((dm) => ({type: "dm" as const, ...dm}));

    let sorted_acc_to_time = [...chats,...direct_msgs];
    sorted_acc_to_time.sort((a,b)=>new Date(b.lastmsgAt).getTime() - new Date(a.lastmsgAt).getTime());

    return(
        <div>
            {
                sorted_acc_to_time?.map((convo)=>{
                    if(convo.type === "chat"){
                        const last_sent_msg = convo.messages.slice(-1)[0];
                        return <div key={convo.id} 
                        className="p-3 rounded-md m-1 cursor-pointer hover:bg-gray-300 hover:dark:bg-slate-800 border-2 ease-out duration-300 transition-all"
                        onClick={()=>{
                            router.push(`/chat/${convo.id}`)
                        }}
                        >
                            <div className="flex justify-between">
                            <h5 className="border-l-2 text-xl font-semibold scroll-m-20 tracking-light pl-2">{convo.name}</h5>
                            <p className="hidden md:block">{get_last_msg_time(convo.lastmsgAt)}</p>
                            </div>

                            {
                                last_sent_msg ? <div className="border-l-2 pl-6 italic text-muted-foreground flex truncate">
                                {
                                    last_sent_msg.sender.username !== username && <p>{last_sent_msg.sender.username}: </p>
                                }
                                <p>{last_sent_msg.content}</p>
                                </div> : <div className="pl-6 border-l-2">No messages yet.</div>
                            }
                        </div>
                    }
                    else {
                        return (
                            <div key={convo.id} 
                            className="p-3 rounded-md m-1 cursor-pointer hover:bg-gray-300 hover:dark:bg-slate-800 border-2 ease-out duration-300 transition-all"
                            onClick={()=>{
                                router.push(`/dm/${convo.to.username}`)
                            }}
                            >
                                <div className="flex justify-between">
                                <h5 className="border-l-2 text-xl font-semibold scroll-m-20 tracking-light pl-2">{convo.to.username}</h5>
                                <p className="hidden md:block">{get_last_msg_time(convo.lastmsgAt)}</p>
                                </div>

                                <p className="border-l-2 pl-6 italic text-muted-foreground truncate">{convo.messages.slice(-1)[0]?.content}</p>
                            </div>
                        )
                    }
                })
            }
        </div>
    )
}
)