"use client";

import assert from "minimalistic-assert";
import { useSession } from "next-auth/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRecoilRefresher_UNSTABLE, useRecoilStateLoadable } from "recoil";
import * as v from "valibot";

import type {
  PinMsgCallbackData,
  StarMsgCallbackData,
} from "../../msg_connect";
import { get_new_local_id } from "../../util";
import type { UnitDM } from "../dm_ui";
import DmRender from "../dm_ui";
import DirectMessageHistory from "../history";
import { PinnedMessages } from "../pinned_msg_ui";
import ProfileDialog from "../profile_dialog";
import { TypingEvent } from "../typing_event";
import type { Recipient } from "../typing_status";
import { ComposeBox } from "../typing_status";

import type { RecievedMessage } from "@/app/(message)/chat/[slug]/page";
import { Signal } from "@/app/home/signal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { direct_msg_state } from "@/lib/store/atom/dm";
import { dm_details_state } from "@/lib/store/atom/dm_details_state";
import { fetch_dms } from "@/lib/store/selector/fetch_dms";
import type { FriendSearchResult, MessageDeletePayload } from "@/packages/valibot";
import { friend_search_result_schema } from "@/packages/valibot";

type DeleteMsgCallbackData = {
  type: string;
  payload: MessageDeletePayload;
};

export default function Direct({ params }: { params: { slug: string } }) {
  const dm_ref = useRef<HTMLDivElement>(null);
  // const compose_ref = useRef<string>("");
  const [compose, setCompose] = useState<string>("");
  const session = useSession();
  const [dmStateDetails, setDmStateDetails] = useState<
    FriendSearchResult | undefined
  >();
  const [dms, setDms] = useRecoilStateLoadable(direct_msg_state);
  const refresh_dm_state = useRecoilRefresher_UNSTABLE(
    dm_details_state({ username: params.slug }),
  );
  const refresh_dms = useRecoilRefresher_UNSTABLE(fetch_dms);
  const [inbox, setInbox] = useState<UnitDM[]>([]);
  const [history, setHistory] = useState<UnitDM[]>([]);
  const [sweeped, setSweeped] = useState<UnitDM[]>([]);
  const [active, setActive] = useState<boolean>(false);

  const recipient: Recipient | null = useMemo(() => {
    if (
      dmStateDetails === undefined ||
      dmStateDetails.is_friend !== true ||
      session.status !== "authenticated"
    )
      return null;

    const username = session.data.username;
    return {
      message_type: "DM",
      notification_type: "typing",
      conc_id: dmStateDetails.friendship_data.connectionId,
      user_id: username,
    };
  }, [dmStateDetails, session]);

  const pinned_msg = useMemo(() => {
    if (dmStateDetails === undefined || dmStateDetails.is_friend !== true)
      return undefined;

    const pinned_history_msgs = dmStateDetails.friendship_data.messages.filter(
      (msg) => {
        if (msg.pinned === true) return msg;
      },
    );
    const pinned_live_msg = inbox.filter((msg) => {
      if (msg.pinned === true) return msg;
    });
    return [...pinned_history_msgs, ...pinned_live_msg];
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dms, dmStateDetails, inbox]);

  useEffect(() => {
    if (dms.state === "hasValue" && dms.getValue()) {
      const friend = dms.getValue().find((dm) => {
        if (dm.to.username === params.slug) return dm;
      });

      if (friend === undefined) {
        fetch_user_details();
        return;
      }

      const { to, ...cond_details } = friend;
      const data = {
        is_friend: true as const,
        friendship_data: {
          ...cond_details,
          is_active: false,
        },
        profile_info: {
          avatarurl: to.avatarurl,
          about: to.about,
          name: to.name,
          favorite: to.favorite,
          status: to.status,
        },
      };
      setDmStateDetails(data);
      setCompose(friend.draft ?? "");
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dms]);

  // function update_draft(){
  //     const draft = compose_ref.current;
  //     if(draft.length > 0 && dms.state === "hasValue" && dms.getValue() !== undefined){
  //         const dms_with_draft:PrivateChats = dms.getValue().map((dm) => {
  //             if(dm.to.username !== params.slug)
  //                 return dm;
  //             else {
  //                 const updated_dm = {
  //                     ...dm,
  //                     draft
  //                 }
  //                 return updated_dm
  //             }
  //         })
  //         setDms([...dms_with_draft])
  //     }
  // }

  // function maybe_clear_draft_cache(){
  //     let has_draft_cache = false;
  //     dms.getValue().forEach((dm) => {
  //         if(dm.to.username === params.slug && dm.draft !== undefined && dm.draft.length > 0){
  //             has_draft_cache = true;
  //         }
  //     })
  //     //@ts-ignore
  //     if(has_draft_cache === true){
  //         const dms_with_draft:PrivateChats = dms.getValue().map((dm) => {
  //             if(dm.to.username !== params.slug)
  //                 return dm;
  //             else {
  //                 const updated_dm = {
  //                     ...dm,
  //                     draft: undefined
  //                 }
  //                 return updated_dm
  //             }
  //         })
  //         setDms([...dms_with_draft])
  //     }
  // }

  async function fetch_user_details() {
    try {
      const resp = await fetch(`/api/dm/${params.slug}`);
      const { raw_data } = await resp.json();
      const data = v.parse(friend_search_result_schema, raw_data);
      assert(data.is_friend === false);
      setDmStateDetails(data);
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }

  useEffect(() => {
    const chat_node = dm_ref.current;
    if (chat_node !== null) {
      const chat_history_comps = chat_node.querySelectorAll("#history");
      if (chat_history_comps.length < 1) return;
      const last_comp_idx = chat_history_comps.length - 1;
      chat_history_comps[last_comp_idx].scrollIntoView({
        behavior: "instant",
        inline: "center",
      });
    }
  }, [history]);

  useEffect(() => {
    const chat_node = dm_ref.current;
    if (chat_node !== null) {
      const recent_msg_comps = chat_node.querySelectorAll("#recent");
      if (recent_msg_comps.length < 1) return;
      const last_recent_idx = recent_msg_comps.length - 1;
      recent_msg_comps[last_recent_idx].scrollIntoView({
        behavior: "smooth",
        inline: "center",
      });
    }
    if (inbox.length >= 5) {
      if (dmStateDetails?.friendship_data === undefined) return;
      const friendship_data = dmStateDetails!.friendship_data;
      const conc_id = friendship_data.connectionId;
      const last_msg = friendship_data.messages.slice(-1);

      setSweeped([]);
      sweep_lastest_messages(conc_id, last_msg[0]?.id);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inbox]);

  async function sweep_lastest_messages(
    conc_id: string,
    last_msg_id: number | undefined,
  ) {
    try {
      const resp = await fetch(`/api/message/dm/sweep/${conc_id}`, {
        method: "POST",
        body: JSON.stringify({
          last_msg_id: last_msg_id ?? -1,
        }),
      });
      const { data }: { data: UnitDM[] } = await resp.json();
      setSweeped(data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    async function sweep_lastest_dms() {
      if (
        dmStateDetails === undefined ||
        dmStateDetails.friendship_data === undefined
      )
        return;

      const friendship_data = dmStateDetails.friendship_data;
      const conc_id = friendship_data.connectionId;
      const last_msg = friendship_data.messages.slice(-1);

      setSweeped([]);
      sweep_lastest_messages(conc_id, last_msg[0]?.id);
    }

    sweep_lastest_dms();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dmStateDetails]);

  useEffect(() => {
    if (sweeped.length > 0) {
      setDms((dms) => {
        const updated_dms = dms.map((dm) => {
          if (dm.to.username === params.slug) {
            const prev_state = dm;
            return {
              ...prev_state,
              messages: [...prev_state.messages, ...sweeped],
              lastmsgAt:
                sweeped.slice(-1)[0]?.createdAt ?? prev_state.lastmsgAt,
            };
          }
          return dm;
        });

        return updated_dms;
      });
      setInbox([]);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sweeped]);

  useEffect(() => {
    Signal.get_instance().REGISTER_CALLBACK(
      "MSG_CALLBACK",
      pm_recieve_callback,
    );
    Signal.get_instance().REGISTER_CALLBACK(
      "ONLINE_CALLBACK",
      update_member_online_status,
    );
    Signal.get_instance().REGISTER_CALLBACK("DELETE_ECHO", delete_msg_callback);
    Signal.get_instance().REGISTER_CALLBACK(
      "PIN_MSG_CALLBACK_ECHO",
      pin_echo_msg_callback,
    );
    Signal.get_instance().REGISTER_CALLBACK(
      "STARRED_ECHO_CALLBACK",
      star_echo_msg_callback,
    );

    if (session.status !== "authenticated" || dmStateDetails === undefined)
      return;

    if (dmStateDetails.is_friend === true) {
      const username = session.data.username;
      const user_id = session.data.id;
      const conc_id = dmStateDetails.friendship_data!.connectionId;
      setActive(dmStateDetails.friendship_data!.is_active);
      setHistory(dmStateDetails.friendship_data!.messages);
      Signal.get_instance(username).SUBSCRIBE(conc_id, user_id, username);
    } else {
      const username = session.data.username;
      Signal.get_instance(username).REGISTER_CALLBACK(
        "DM_INVITE_SUCCESS",
        invite_success_callback,
      );
    }

    return () => {
      Signal.get_instance().DEREGISTER("MSG_CALLBACK");
      Signal.get_instance().DEREGISTER("ONLINE_CALLBACK");
      Signal.get_instance().DEREGISTER("PIN_MSG_CALLBACK_ECHO");
      Signal.get_instance().DEREGISTER("STARRED_ECHO_CALLBACK");
      Signal.get_instance().DEREGISTER("DELETE_ECHO");

      if (
        session.status !== "authenticated" ||
        dmStateDetails === undefined ||
        dmStateDetails.is_friend === false
      )
        return;

      const username = session.data.username;
      Signal.get_instance(username).UNSUBSCRIBE(
        dmStateDetails.friendship_data!.connectionId,
        username,
      );

      // update_draft();
      // maybe_clear_draft_cache();
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.status, dmStateDetails]);

  function pm_recieve_callback(raw_data: string) {
    const data: RecievedMessage = JSON.parse(raw_data);
    if (dmStateDetails === undefined || dmStateDetails.is_friend === false)
      return;
    if (data.payload.roomId !== dmStateDetails.friendship_data.connectionId)
      return;

    const last_msg = dmStateDetails.friendship_data.messages.slice(-1)[0];

    setInbox((inbox) => {
      const last_local_msg = inbox.slice(-1);
      const local_id = get_new_local_id(last_msg?.id, last_local_msg[0]?.id);
      console.log(local_id);
      const new_dm = {
        id: local_id,
        content: data.payload.message.content,
        createdAt: data.payload.createdAt,
        sendBy: {
          username: data.payload.message.user,
        },
        is_local_echo: true,
        hash: data.payload.hash,
        pinned: false,
        starred: [],
      };
      return [...inbox, new_dm];
    });
  }

  function star_echo_msg_callback(raw_data: string) {
    const data: StarMsgCallbackData = JSON.parse(`${raw_data}`);

    const payload = data.payload;

    setInbox((inbox) => {
      return inbox.map((dm) => {
        assert(dm.is_local_echo === true);
        if (dm.hash === payload.hash)
          return {
            ...dm,
            starred: payload.starred,
          };
        return dm;
      });
    });
  }

  function pin_echo_msg_callback(raw_data: string) {
    const data: PinMsgCallbackData = JSON.parse(`${raw_data}`);

    const payload = data.payload;

    setInbox((inbox) => {
      return inbox.map((dm) => {
        assert(dm.is_local_echo === true);
        if (dm.hash === payload.hash)
          return {
            ...dm,
            pinned: payload.pinned,
          };
        return dm;
      });
    });
  }

  function delete_msg_callback(raw_data: string) {
    const data: DeleteMsgCallbackData = JSON.parse(`${raw_data}`);
    const payload = data.payload;
    if (dmStateDetails === undefined) return;
    else if (payload.conc_id === dmStateDetails.friendship_data?.connectionId) {
      setInbox((inbox) => {
        return inbox.filter((dm) => {
          assert(dm.is_local_echo === true);
          if (dm.hash !== payload.hash) return dm;
        });
      });
    }
  }

  function invite_success_callback(_raw_data: string) {
    refresh_dm_state();
    refresh_dms();
  }

  function update_member_online_status(raw_data: string) {
    const data = JSON.parse(raw_data);
    const type: "MemberJoins" | "MemberLeaves" = data.type;
    const username = data.payload.username;
    if (username === params.slug) {
      setActive(type === "MemberJoins");
    }
  }

  if (dmStateDetails === undefined || session.status !== "authenticated")
    return <div>Loading...</div>;

  const username = session.data.username;

  function sendMessage() {
    const data = dmStateDetails;
    assert(data !== undefined);

    if (data.is_friend === false) {
      Signal.get_instance().INVITE(username, params.slug, compose);
    } else {
      const broadcast_data = {
        type: "message",
        payload: {
          roomId: data.friendship_data.connectionId,
          msg_type: "dm",
          message: {
            content: compose,
            user: username,
            name: session.data?.user?.name,
            id: session.data?.id,
          },
          friendshipId: data.friendship_data.id,
        },
      };
      Signal.get_instance().SEND(JSON.stringify(broadcast_data));
    }
    setCompose("");
  }

  return (
    <div className="w-full h-svh">
      {dmStateDetails !== undefined && session.status === "authenticated" ? (
        <div className="flex flex-col w-full h-svh">
          <div className={`flex rounded-md h-[72px] mx-2 mt-2 mb-1 border-2`}>
            <Dialog>
              <DialogTrigger asChild>
                <div className="flex item-center p-2 ml-2">
                  <Avatar className="mr-1 mt-1">
                    <AvatarImage
                      src={`https://avatar.varuncodes.com/${params.slug}`}
                    />
                    <AvatarFallback>
                      {params.slug.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="mx-1 px-1">
                    <h3 className="scroll-m-20 text-xl font-semibold">
                      {params.slug}
                    </h3>
                    <p
                      className={`italic text-muted-foreground truncate w-[124px] text-[15px] ${active ? "text-rose-800" : "text-green-400"}`}
                    >
                      {active ? "Active" : "Offline"}
                    </p>
                  </div>
                </div>
              </DialogTrigger>
              <ProfileDialog
                profile_info={{
                  ...dmStateDetails.profile_info,
                  username: params.slug,
                }}
              />
            </Dialog>
          </div>
          <ScrollArea
            id="chatbox"
            className="flex flex-col h-full rounded-md border m-2"
          >
            {pinned_msg && pinned_msg.length > 0 && (
              <PinnedMessages dm_ref={dm_ref} msgs={pinned_msg ?? []} />
            )}
            <div className="my-16" ref={dm_ref}>
              {dmStateDetails.is_friend && (
                <DirectMessageHistory
                  dms={dmStateDetails.friendship_data.messages}
                  username={username}
                />
              )}
              {inbox.map((live_dm) => {
                return (
                  <DmRender
                    id="recent"
                    key={live_dm.id}
                    dm={live_dm}
                    username={username}
                  />
                );
              })}
            </div>
            {dmStateDetails.is_friend && (
              <TypingEvent
                typing_details={{
                  type: "DM",
                  conc_id: dmStateDetails.friendship_data.connectionId,
                }}
              />
            )}
            <ComposeBox
              recipient={recipient}
              sendMessage={sendMessage}
              compose={compose}
              setCompose={setCompose}
            />
          </ScrollArea>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
