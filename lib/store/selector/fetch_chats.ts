import { user_chats_response_schema } from "@/packages/zod";
import { ChatReponse } from "@/packages/zod";
import { selector } from "recoil";

export const fetch_user_chats = selector<ChatReponse>({
    key: "fetch_user_chats",
    get: async() => {
        try{
            const resp=await fetch(`/api/room`,{
                next: {
                    revalidate: 60,
                    tags: ['rooms']
                },
                cache: "no-cache"
            });
    
            const {raw_data}=await resp.json();
            if(Array.isArray(raw_data) && raw_data.length>0)
            {
                const data = user_chats_response_schema.parse(raw_data);
                console.log(data);
                return data;
            }

            return [];
            
        }catch(err)
        {
            console.log(err);
            return [];
        }
    }
})