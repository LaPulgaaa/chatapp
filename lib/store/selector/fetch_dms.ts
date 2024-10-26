import { private_chats_schema } from "@/packages/zod";
import { PrivateChats } from "@/packages/zod";
import { selector } from "recoil";


export const fetch_dms = selector<PrivateChats>({
    key: "fetch_dms",
    get: async() => {
        try{
            const resp = await fetch('/api/friend');
            const { raw_data } = await resp.json();
            const data = private_chats_schema.parse(raw_data);
            return data;
        }catch(err){
            console.log(err);
            return [];
        }
    }
})
