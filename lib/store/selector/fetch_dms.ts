import { selector } from "recoil";
import * as v from "valibot";

import type { PrivateChats } from "@/packages/valibot";
import { private_chats_schema } from "@/packages/valibot";

export const fetch_dms = selector<PrivateChats>({
  key: "fetch_dms",
  get: async () => {
    try {
      const resp = await fetch("/api/friend");
      const { raw_data } = await resp.json();
      const data = v.parse(private_chats_schema, raw_data);
      return data;
    } catch (err) {
      console.log(err);
      return [];
    }
  },
});
