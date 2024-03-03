import { atom } from "recoil";

interface UserDetails{
    username?:string,
    password?:string,
    id?:string
}

export const userDetails=atom<UserDetails>({
    key:'userDetails',
    default:{
        username:undefined,
        password:undefined,
        id:undefined
    }
})