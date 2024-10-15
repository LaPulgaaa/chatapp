"use client"

import { memo } from "react";

import { Signal } from "./signal";

import CreateRoom from "@/components/CreateRoom";
import { useRecoilState} from "recoil";
import { useEffect } from "react";
import { direct_messages_schema, user_chat_response_schema } from "@/packages/zod";
import { UserStateChats } from "@/lib/store/atom/chats";
import { useRouter } from "next/navigation";
import type { ChatReponse, DirectMessages } from "@/packages/zod";
import { useSession } from "next-auth/react";
import { DirectMessageState } from "@/lib/store/atom/dm";

export function get_last_msg_time(lastmsgAt: string): string {

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

export let user_chat_uuid = new Map<string,string>();

export default function Home(){
    const session = useSession();
    const [rooms,setRooms]=useRecoilState(UserStateChats);
    const [dms, setDms] = useRecoilState(DirectMessageState);
    //@ts-ignore
    const id: string | undefined = session.data?.id;
    useEffect(()=>{
        if(id !== undefined)
        Signal.get_instance(id)

    },[id]);

    useEffect(()=>{
        if(!id){
            return;
        }
        async function get_user_chats(){
            try{
                const resp=await fetch(`/api/room`,{
                    next: {
                        revalidate: 60,
                        tags: ['rooms']
                    },
                    cache: "no-cache"
                });
                //TODO:add zod here before using the returned data
                const {raw_data}=await resp.json();
                if(Array.isArray(raw_data) && raw_data.length>0)
                {
                    const data = user_chat_response_schema.parse(raw_data);
                    console.log(data);
                    setRooms(data);
                }
                
            }catch(err)
            {
                console.log(err);
            }
        }
        get_user_chats();

        async function get_dms(){
            try{
                const resp = await fetch('/api/friend');
                const { raw_data } = await resp.json();
                const data = direct_messages_schema.parse(raw_data);
                setDms(data);
            }catch(err){
                console.log(err);
            }
        }

        get_dms();
    },[id])

    return(
        <div className="lg:col-span-4 mr-4 ml-2 pt-2">
            {session.status === "authenticated" ? <div className="">
                    <h4 className="scroll-m-20 p-2 text-2xl font-semibold tracking-tigh">
                        Catch up on missed chats!
                    </h4>
                    <RoomTabs rooms={rooms} dms={dms}/>
                </div> : <div>Loading</div>
            }
        </div>
    )
}

const RoomTabs = memo(
    function({rooms, dms}:{rooms:ChatReponse, dms:DirectMessages}){
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
                        user_chat_uuid.set(convo.id, convo.conn_id);

                        return <div key={convo.id} 
                        className="p-3 rounded-md m-1 cursor-pointer hover:bg-gray-400 border-2 ease-out duration-300 transition-all"
                        onClick={()=>{
                            router.push(`/chat/${convo.id}`)
                        }}
                        >
                            <div className="flex justify-between">
                            <h5 className="border-l-2 text-xl font-semibold scroll-m-20 tracking-light pl-2">{convo.name}</h5>
                            <p className="hidden md:block">{get_last_msg_time(convo.lastmsgAt)}</p>
                            </div>

                            <p className="border-l-2 pl-6 italic">{convo.discription}</p>
                        </div>
                    }
                    else {
                        return (
                            <div key={convo.id} 
                            className="p-3 rounded-md m-1 cursor-pointer hover:bg-gray-400 border-2 ease-out duration-300 transition-all"
                            onClick={()=>{
                                router.push(`/direct/${convo.to.username}`)
                            }}
                            >
                                <div className="flex justify-between">
                                <h5 className="border-l-2 text-xl font-semibold scroll-m-20 tracking-light pl-2">{convo.to.username}</h5>
                                <p className="hidden md:block">{get_last_msg_time(convo.lastmsgAt)}</p>
                                </div>

                                <p className="border-l-2 pl-6 italic">{convo.messages[0].content}</p>
                            </div>
                        )
                    }
                })
            }
        </div>
    )
}
)