import { atom, atomFamily, selector, selectorFamily } from "recoil";
import { useSession } from "next-auth/react";

import { MemberProfile } from "@/packages/zod";

type UserDetails = {
    about: string,
    status: string,
    favorite: string[]
}

export const UserDetails = atomFamily<UserDetails | null, {user_id: string}>({
    key: "user_details",
    default: selectorFamily({
        key: "getUserDetails",
        get: 
        ({user_id}:{user_id: string}) =>
            async ({get})=>{
                if(user_id === undefined)
                    return null;

                try{
                    const resp = await fetch(`http://localhost:3000/user/getCreds/${user_id}`);
                    const { data }:{data: UserDetails} = await resp.json();

                    return data;
                }catch(err){
                    console.log(err);
                    return null;
                }
            }
    })
})