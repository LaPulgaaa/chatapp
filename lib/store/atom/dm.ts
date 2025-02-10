import { atom } from "recoil";

import { fetch_dms } from "../selector/fetch_dms";

import type { PrivateChats } from "@/packages/zod";

export const direct_msg_state = atom<PrivateChats>({
  key: "dm_state",
  default: fetch_dms,
});
