import {atom} from "recoil";

import { RoomMemberDetails } from "@/packages/zod";

export const member_online_state = atom<RoomMemberDetails>({
    key: "member_online_state",
    default: [],
})