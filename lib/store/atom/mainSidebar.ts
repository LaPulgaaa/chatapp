import { atom } from "recoil";

export const mainSidebarState = atom<boolean>({
    key: "mainSidebar",
    default: false,
})