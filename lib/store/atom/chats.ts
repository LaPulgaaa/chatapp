import { atom } from "recoil";

import type { ChatReponse } from "@/packages/zod";

export const UserStateChats = atom<ChatReponse>({
  key: "ChatDetails",
  default: [],
});
