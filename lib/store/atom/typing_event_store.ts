import { atom, selector } from "recoil";
import { fetch_user_chats } from "../selector/fetch_chats";
import { fetch_dms } from "../selector/fetch_dms";

export type TypingStatusState = (
  | {
      type: "CHAT";
      room_id: string;
      typists: string[];
    }
  | {
      type: "DM";
      conc_id: string;
      typists: string[];
    }
)[];

const typing_event_selector = selector<TypingStatusState>({
  key: "typing_state_selector",
  get: ({ get }) => {
    const chats = get(fetch_user_chats);
    const dms = get(fetch_dms);

    const typing_status_chats: TypingStatusState = chats.map((chat) => {
      return {
        type: "CHAT" as const,
        room_id: chat.id,
        typists: [],
      };
    });

    const typing_status_dms: TypingStatusState = dms.map((dm) => {
      return {
        type: "DM" as const,
        conc_id: dm.connectionId,
        typists: [],
      };
    });
    const typing_state = [...typing_status_chats, ...typing_status_dms];

    return typing_state;
  },
});

export const typing_event_store = atom<TypingStatusState>({
  key: "typing_state",
  default: typing_event_selector,
});
