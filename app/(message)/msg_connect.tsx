"use client";

import assert from "minimalistic-assert";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import {
  useRecoilRefresher_UNSTABLE,
  useRecoilStateLoadable,
  useSetRecoilState,
} from "recoil";

import { inbound_typing_event } from "../home/connect";
import { Signal } from "../home/signal";

import { useToast } from "@/hooks/use-toast";
import { direct_msg_state } from "@/lib/store/atom/dm";
import { subscribed_chats_state } from "@/lib/store/atom/subscribed_chats_state";
import { typing_event_store } from "@/lib/store/atom/typing_event_store";
import { fetch_dms } from "@/lib/store/selector/fetch_dms";
import type {
  MessageDeletePayload,
  MessagePinPayload,
  MessageStarPayload,
} from "@/packages/zod";

type DeleteMsgCallbackData = {
  type: string;
  payload: MessageDeletePayload;
};

export type PinMsgCallbackData = {
  type: "pin";
  payload: MessagePinPayload;
};

export type StarMsgCallbackData = {
  type: "star";
  payload: MessageStarPayload;
};

export type UpdateDetailsData = {
  type: "chat_details_update";
  payload: {
    chat_id: string;
    updated_details: {
      name: string;
      description: string;
    };
  };
};

export default function Connect() {
  const session = useSession();
  const { toast } = useToast();
  const [dms, setDms] = useRecoilStateLoadable(direct_msg_state);
  const [roomsStateData, setRoomsStateData] = useRecoilStateLoadable(
    subscribed_chats_state,
  );
  const refresh_dms = useRecoilRefresher_UNSTABLE(fetch_dms);
  const setTypingState = useSetRecoilState(typing_event_store);

  function recieve_invite_callback(raw_data: string) {
    const data = JSON.parse(raw_data);
    toast({
      title: data.payload.requestBy,
      description: data.payload.content,
    });
    refresh_dms();
  }

  function delete_msg_callback(raw_string: string) {
    const data: DeleteMsgCallbackData = JSON.parse(`${raw_string}`);
    const payload = data.payload;

    if (payload.type === "DM" && dms.state === "hasValue") {
      setDms((dms) => {
        const updated_dms = dms.map((dm) => {
          if (dm.connectionId !== payload.conc_id) {
            return dm;
          } 
            const updated_msgs = dm.messages.filter((msg) => {
              if (msg.id !== payload.id) return msg;
            });

            return {
              ...dm,
              messages: updated_msgs,
            };
          
        });
        return updated_dms;
      });
    }
  }

  function star_msg_callback(raw_string: string) {
    const data: StarMsgCallbackData = JSON.parse(`${raw_string}`);
    const payload = data.payload;

    if (payload.type === "DM" && dms.state === "hasValue") {
      setDms((dms) => {
        const new_dms = dms.map((dm) => {
          if (dm.connectionId !== payload.conc_id) return dm;
          
            const updated_msgs = dm.messages.map((msg) => {
              if (msg.id === payload.id) {
                return {
                  ...msg,
                  starred: payload.starred,
                };
              } return msg;
            });
            return {
              ...dm,
              messages: updated_msgs,
            };
          
        });

        return new_dms;
      });
    }
  }

  function pin_msg_callback(raw_string: string) {
    const data: PinMsgCallbackData = JSON.parse(`${raw_string}`);
    const payload = data.payload;

    if (payload.type === "DM" && dms.state === "hasValue") {
      setDms((dms) => {
        const new_dms = dms.map((dm) => {
          if (dm.connectionId !== payload.conc_id) return dm;
          
            const updated_msgs = dm.messages.map((msg) => {
              if (msg.id === payload.id) {
                return {
                  ...msg,
                  pinned: payload.pinned,
                };
              } return msg;
            });
            return {
              ...dm,
              messages: updated_msgs,
            };
          
        });

        return new_dms;
      });
    }
  }

  function details_update_callback(raw_string: string) {
    const data: UpdateDetailsData = JSON.parse(`${raw_string}`);
    if (data.type === "chat_details_update") {
      const all_rooms_data = roomsStateData.getValue();
      const narrowed_room = all_rooms_data.find(
        (room) => room.id === data.payload.chat_id,
      );
      assert(narrowed_room !== undefined);
      const other_rooms = all_rooms_data.filter(
        (room) => room.id !== narrowed_room.id,
      );
      const updated_narrowed_room = {
        ...narrowed_room,
        name: data.payload.updated_details.name,
        description: data.payload.updated_details.description,
      };
      setRoomsStateData([...other_rooms, updated_narrowed_room]);
    }
  }

  function handle_inbound_typing_event(raw_data: string) {
    const username = session.data?.username;
    const data = inbound_typing_event.parse(JSON.parse(raw_data));
    const payload = data.payload;
    setTypingState((curr_state) => {
      return curr_state.map((s) => {
        if (payload.user_id === username) return s;

        if (
          payload.type === "CHAT" &&
          s.type === "CHAT" &&
          payload.room_id === s.room_id
        ) {
          let already_typists = s.typists;

          if (
            payload.op === "start" &&
            !already_typists.includes(payload.user_id)
          ) {
            already_typists = [...already_typists, payload.user_id];
          } else if (
            payload.op === "stop" &&
            already_typists.includes(payload.user_id)
          ) {
            already_typists = already_typists.filter(
              (typist) => typist !== payload.user_id,
            );
          }

          return {
            type: "CHAT",
            room_id: s.room_id,
            typists: already_typists,
          };
        } else if (
          payload.type === "DM" &&
          s.type === "DM" &&
          payload.conc_id === s.conc_id
        ) {
          let already_typists = s.typists;

          if (
            payload.op === "start" &&
            !already_typists.includes(payload.user_id)
          ) {
            already_typists = [...already_typists, payload.user_id];
          } else if (
            payload.op === "stop" &&
            already_typists.includes(payload.user_id)
          ) {
            already_typists = already_typists.filter(
              (typist) => typist !== payload.user_id,
            );
          }

          return {
            type: "DM",
            conc_id: s.conc_id,
            typists: already_typists,
          };
        }

        return s;
      });
    });
  }

  useEffect(() => {
    if (session.status === "authenticated") {
      Signal.get_instance(session.data.username).REGISTER_CALLBACK(
        "INVITE",
        recieve_invite_callback,
      );
      Signal.get_instance().REGISTER_CALLBACK(
        "DELETE_NON_ECHO",
        delete_msg_callback,
      );
      Signal.get_instance().REGISTER_CALLBACK(
        "PIN_MSG_CALLBACK_NON_ECHO",
        pin_msg_callback,
      );
      Signal.get_instance().REGISTER_CALLBACK(
        "STARRED_NON_ECHO_CALLBACK",
        star_msg_callback,
      );
      Signal.get_instance().REGISTER_CALLBACK(
        "UPDATE_DETAILS_CALLBACK",
        details_update_callback,
      );
      Signal.get_instance().REGISTER_CALLBACK(
        "TYPING_CALLBACK",
        handle_inbound_typing_event,
      );
    }

    return () => {
      if (session.status === "authenticated") {
        Signal.get_instance(session.data.username).DEREGISTER("INVITE");
        Signal.get_instance().DEREGISTER("DELETE_NON_ECHO");
        Signal.get_instance().DEREGISTER("PIN_MSG_CALLBACK_NON_ECHO");
        Signal.get_instance().DEREGISTER("STARRED_NON_ECHO_CALLBACK");
        Signal.get_instance().DEREGISTER("UPDATE_DETAILS_CALLBACK");
        Signal.get_instance().DEREGISTER("TYPING_CALLBACK");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.status, session.data]);

  return <></>;
}
