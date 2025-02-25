import { selectorFamily } from "recoil";

import { fetch_dms } from "./fetch_dms";

import type { FriendSearchResult } from "@/packages/zod";
import { friend_search_result_schema } from "@/packages/zod";

export const get_friend_by_username = selectorFamily<
  FriendSearchResult | undefined,
  { username: string }
>({
  key: "get_friend_by_username",
  get:
    ({ username }: { username: string }) =>
    async ({ get }) => {
      const dms = get(fetch_dms);
      const friend = dms.find((dm) => {
        if (dm.to.username === username) return dm;
      });

      if (friend === undefined) {
        try {
          const resp = await fetch(`/api/dm/${username}`);
          const { raw_data } = await resp.json();
          const data = friend_search_result_schema.parse(raw_data);
          return data;
        } catch (err) {
          console.log(err);
          return undefined;
        }
      }

      const { to, ...cond_details } = friend;

      return {
        is_friend: true as const,
        friendship_data: {
          ...cond_details,
          is_active: false,
        },
        profile_info: {
          avatarurl: to.avatarurl,
          about: to.about,
          name: to.name,
          favorite: to.favorite,
          status: to.status,
        },
      };
    },
});
