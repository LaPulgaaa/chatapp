'use server'

import getSubscribedRooms from "./actions/actions";
import Link from "next/link";

export let user_chat_uuid = new Map<string,string>();

export async function RoomTabs({user_id}:{user_id: string}){
    const rooms = await getSubscribedRooms(user_id);
    
    function get_last_msg_time(lastmsgAt: string): string{

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

    rooms?.sort((a,b)=>new Date(b.lastmsgAt).getTime() - new Date(a.lastmsgAt).getTime());

    return(
        <div>
            {
                rooms && rooms.map((room)=>{
                    user_chat_uuid.set(room.id, room.conn_id);

                    return <Link href={`/home/chat/${room.id}`}>
                        <div key={room.id} 
                    className="p-3 rounded-md m-1 cursor-pointer hover:bg-gray-400 border-2 ease-out duration-300 transition-all">
                        <div className="flex justify-between">
                        <h5 className="border-l-2 text-xl font-semibold scroll-m-20 tracking-light pl-2">{room.name}</h5>
                        <div className="hidden md:block">{get_last_msg_time(room.lastmsgAt)}</div>
                        </div>

                        <div className="border-l-2 pl-6 italic">{room.discription}</div>
                    </div>
                    </Link>
                })
            }
        </div>
    )
}
