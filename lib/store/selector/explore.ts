import { selectorFamily } from "recoil";
import type { FriendSearchResult } from "@/packages/zod";
import { friend_search_result_schema } from "@/packages/zod";

export const get_friend_by_username = selectorFamily<FriendSearchResult | undefined,{ username: string }>({
    key: "get_friend_by_username",
    get: ({ username }:{ username: string}) => 
        async() => {
            try{
                const resp = await fetch(`/api/search/${username}`);
                const { raw_data } = await resp.json();
                const data = friend_search_result_schema.parse(raw_data);
                return data;
            }catch(err){
                console.log(err);
                return undefined;
            }
        }
})