import { atom } from "recoil";
import type { PrivateChats } from "@/packages/zod";

export const DirectMessageState = atom<PrivateChats>({
    key: "dm_state",
    default: [],
})