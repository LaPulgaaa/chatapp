import { atom } from "recoil";
import { ChatReponse } from "@/packages/zod";
import { fetch_user_chats } from "../selector/fetch_chats";

export const subscribed_chats_state = atom<ChatReponse>({
  key: "subscribed_chats_state",
  default: fetch_user_chats,
});
