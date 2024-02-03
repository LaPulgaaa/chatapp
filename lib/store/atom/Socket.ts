import { atom } from "recoil";

export const wsState=atom<WebSocket>({
    key:"wsState",
    default:undefined
})