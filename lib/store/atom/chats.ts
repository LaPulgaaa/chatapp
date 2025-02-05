import { atom } from "recoil";
import { ChatReponse } from "@/packages/zod";

export const UserStateChats = atom<ChatReponse>({
  key: "ChatDetails",
  default: [],
});
