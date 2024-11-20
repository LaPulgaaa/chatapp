import { user_chats_response_schema } from "@/packages/zod";
import { ChatReponse } from "@/packages/zod";
import { selector } from "recoil";

export const fetch_user_chats = selector<ChatReponse>({
    key: "fetch_user_chats",
    get: async() => {
        try{
            const resp=await fetch(`/api/room`,{
            });
    
            const {raw_data}=await resp.json();
            const data = user_chats_response_schema.parse(raw_data);
            console.log(data);
            return data;
            
        }catch(err)
        {
            console.log(err);
            return [];
        }
    }
})