import { atom } from "recoil";
import { MemberProfile } from "@/packages/zod";
type UserDetails={
    id?:string,
} & Partial<MemberProfile>

export const userDetails=atom<UserDetails>({
    key:'userDetails',
    default:{
        username:undefined,
        password:undefined,
        id:undefined,
        name: undefined,
        favorite:[],
        status:undefined,
        about:undefined,
        avatarurl:undefined
    }
})