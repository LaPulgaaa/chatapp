import { atom } from "recoil";


export interface userState{
    name?:string,
    roomId?:string
}

export const userState=atom<userState>({
    key:"userState",
    default:{
        name:undefined,
        roomId:undefined
    }
})