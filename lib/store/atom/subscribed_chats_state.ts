import { atom } from "recoil";

import { fetch_user_chats } from "../selector/fetch_chats";

import type { ChatReponse } from "@/packages/zod";

export const subscribed_chats_state = atom<ChatReponse>({
  key: "subscribed_chats_state",
  default: fetch_user_chats,
});
