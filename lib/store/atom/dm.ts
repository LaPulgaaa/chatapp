import { atom } from "recoil";
import type { PrivateChats } from "@/packages/zod";
import { fetch_dms } from "../selector/fetch_dms";

export const direct_msg_state = atom<PrivateChats>({
  key: "dm_state",
  default: fetch_dms,
});
