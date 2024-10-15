import { atom } from "recoil";
import type { DirectMessages } from "@/packages/zod";

export const DirectMessageState = atom<DirectMessages>({
    key: "dm_state",
    default: [],
})