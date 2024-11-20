import { selectorFamily } from "recoil";
import type { ChatMessageData } from "@/packages/zod";
import { room_details_response_schema } from "@/packages/zod";

export const fetch_chat_msgs = selectorFamily<ChatMessageData["messages"] | undefined, { chat_id: string }>({
    key: "fetch_chat_msgs",
    get: ({chat_id}:{chat_id: string}) => 
        async() => {
            try{
                const resp=await fetch(`/api/message/chat/${chat_id}`,{
                    credentials:"include",
                    next:{
                        revalidate: 30
                    }
                });
                const { raw_data }=await resp.json();

                const data = room_details_response_schema.parse(raw_data);
                return data.messages;
            }catch(err)
            {
                alert(err);
                console.log(err);

                return undefined;
            }
        }
})