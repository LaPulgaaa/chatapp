import { RoomHeaderDetails, room_header_details } from "@/packages/zod";

export async function get_room_details(room_id: string):Promise<RoomHeaderDetails | undefined>{
    try{
        const resp = await fetch(`/api/member/room/${room_id}`,{
            credentials: "include",
            headers:{
                'Content':"application/json"
            },
            cache: "force-cache"
        });

        if(resp.status === 200){
            const {raw_data} = await resp.json();
            const data = room_header_details.parse(raw_data);
            return data;
        }
        else
        return undefined;
    }catch(err){
        console.log(err);
        return undefined;
    }
}
