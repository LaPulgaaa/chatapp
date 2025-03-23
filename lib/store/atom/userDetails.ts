import { atom, selector } from "recoil";
import * as v from "valibot";

const fetch_user_details = v.object({
  username: v.string(),
  name: v.nullish(v.string()),
  status: v.nullish(v.string()),
  favorite: v.array(v.string()),
  avatarurl: v.nullish(v.string()),
  about: v.nullish(v.string()),
});

type UserDetails = v.InferOutput<typeof fetch_user_details>;

export const UserDetails = atom<UserDetails | null>({
  key: "user_details",
  default: selector({
    key: "get_user_details",
    get: async () => {
      try {
        const resp = await fetch("/api/member", {
          next: {
            tags: ["profile"],
          },
        });
        const { raw_data } = await resp.json();
        const data = v.parse(fetch_user_details, raw_data);
        return data;
      } catch (err) {
        console.log(err);
        return null;
      }
    },
  }),
});
