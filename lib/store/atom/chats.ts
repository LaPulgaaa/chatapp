import { atom } from "recoil";

import type { ChatReponse } from "@/packages/valibot";

export const UserStateChats = atom<ChatReponse>({
  key: "ChatDetails",
  default: [],
});
