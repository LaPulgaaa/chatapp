import { FriendSearchResult } from "@/packages/zod";
import { atomFamily } from "recoil";
import { get_friend_by_username } from "../selector/explore";

export const dm_details_state = atomFamily<FriendSearchResult | undefined,{username: string}>({
    key: "dm_details_state",
    default: ({username}:{username: string}) => get_friend_by_username({username})
})