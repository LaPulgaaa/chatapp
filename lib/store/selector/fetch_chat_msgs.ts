import { selectorFamily } from "recoil";
import type { ChatMessageData } from "@/packages/zod";
import { fetch_user_chats } from "./fetch_chats";
import assert from "minimalistic-assert";

export const fetch_chat_msgs = selectorFamily<
  ChatMessageData["messages"] | undefined,
  { chat_id: string }
>({
  key: "fetch_chat_msgs",
  get:
    ({ chat_id }: { chat_id: string }) =>
    async ({ get }) => {
      try {
        const all_chats = get(fetch_user_chats);
        const search_chat = all_chats.find((chat) => chat.id === chat_id);

        assert(search_chat !== undefined);

        return search_chat.messages;
      } catch (err) {
        console.log(err);

        return undefined;
      }
    },
});
