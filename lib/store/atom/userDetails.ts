import { atom } from "recoil";

interface UserDetails{
    username?:string,
    password?:string,
    uuid?:string
}

export const userDetails=atom<UserDetails>({
    key:'userDetails',
    default:{
        username:undefined,
        password:undefined,
        uuid:undefined
    }
})