import {atom} from "recoil";

export const isSidebarHidden = atom<boolean>({
    key: "is_sidebar_hidden",
    default: true
})