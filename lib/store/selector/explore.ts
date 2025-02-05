import { selectorFamily } from "recoil";
import type { FriendSearchResult } from "@/packages/zod";
import { friend_search_result_schema } from "@/packages/zod";
import { fetch_dms } from "./fetch_dms";

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

      if (friend !== undefined) {
        const { to, ...cond_details } = friend;
        const data = {
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

        return data;
      }
      try {
        const resp = await fetch(`/api/dm/${username}`);
        const { raw_data } = await resp.json();
        const data = friend_search_result_schema.parse(raw_data);
        return data;
      } catch (err) {
        console.log(err);
        return undefined;
      }
    },
});
