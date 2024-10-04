import { z } from "zod";

import { atom, selector } from "recoil";
import { user_details_edit_form_schema } from "@/packages/zod";

const fetch_user_details = z.object({
    username: z.string(),
    name: z.string().nullish(),
    status: z.string().nullish(),
    favorite: z.array(z.string()),
    avatarurl: z.string().nullish(),
    about: z.string().nullish(),
})

type UserDetails = z.output<typeof fetch_user_details>

export const UserDetails = atom<UserDetails | null>({
    key: "user_details",
    default: selector({
        key: "get_user_details",
        get: async () => {
            try{
                const resp = await fetch('/api/member',{
                    next: {
                        tags: ["profile"]
                    }
                });
                const {raw_data} = await resp.json();
                const data = fetch_user_details.parse(raw_data);
                return data;
            }catch(err){
                console.log(err);
                return null;
            }
        }
    })
})