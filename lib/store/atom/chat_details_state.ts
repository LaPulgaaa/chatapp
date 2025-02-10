import { atomFamily } from "recoil";

import { fetch_chat_msgs } from "../selector/fetch_chat_msgs";

import type { ChatMessageData } from "@/packages/zod";

export const chat_details_state = atomFamily<
  ChatMessageData["messages"] | undefined,
  { chat_id: string }
>({
  key: "chat_details_state",
  default: ({ chat_id }: { chat_id: string }) => fetch_chat_msgs({ chat_id }),
});
