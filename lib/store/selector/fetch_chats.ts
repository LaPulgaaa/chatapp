import { selector } from "recoil";
import * as v from "valibot";

import type { ChatReponse } from "@/packages/valibot";
import { user_chats_response_schema } from "@/packages/valibot";

export const fetch_user_chats = selector<ChatReponse>({
  key: "fetch_user_chats",
  get: async () => {
    try {
      const resp = await fetch(`/api/room`, {});

      const { raw_data } = await resp.json();
      const data = v.parse(user_chats_response_schema, raw_data);
      console.log(data);
      return data;
    } catch (err) {
      console.log(err);
      return [];
    }
  },
});
