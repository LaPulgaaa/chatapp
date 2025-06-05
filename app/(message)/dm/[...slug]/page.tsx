"use client";

import assert from "minimalistic-assert";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRecoilRefresher_UNSTABLE, useRecoilStateLoadable } from "recoil";
import * as v from "valibot";

import type { UnitMsg } from "../../dm_ui";
import DirectMessageHistory from "../../history";
import { PinnedMessages } from "../../pinned_msg_ui";
import ProfileDialog from "../profile_dialog";
import { TypingEvent } from "../typing_event";
import type { Recipient } from "../typing_status";
import { ComposeBox } from "../typing_status";

import { Signal } from "@/app/home/signal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { direct_msg_state } from "@/lib/store/atom/dm";
import { dm_details_state } from "@/lib/store/atom/dm_details_state";
import { fetch_dms } from "@/lib/store/selector/fetch_dms";
import type { FriendSearchResult } from "@/packages/valibot";
import { friend_search_result_schema } from "@/packages/valibot";

export default function Direct({ params }: { params: { slug: string[] } }) {
  const segments = params.slug;

  const session = useSession();
  const { theme } = useTheme();

  const [history, setHistory] = useState<Omit<UnitMsg, "type">[]>([]);
  const [active, setActive] = useState<boolean>(false);
  const compose_ref = useRef<string | null>(null);
  const [compose, setCompose] = useState<string>("");

  const dm_ref = useRef<HTMLDivElement>(null);

  const [dmStateDetails, setDmStateDetails] = useState<
    FriendSearchResult | undefined
  >();
  const [dms, setDms] = useRecoilStateLoadable(direct_msg_state);
  const refresh_dm_state = useRecoilRefresher_UNSTABLE(
    dm_details_state({ username: params.slug[0] }),
  );
  const refresh_dms = useRecoilRefresher_UNSTABLE(fetch_dms);

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
      return [];

    const pinned_history_msgs: UnitMsg[] = [];

    dmStateDetails.friendship_data.messages.forEach((msg) => {
      if (msg.pinned === true)
        pinned_history_msgs.push({
          ...msg,
          type: "DM" as const,
        });
    });

    return [...pinned_history_msgs];
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dms, dmStateDetails]);

  useEffect(() => {
    if (dms.state === "hasValue" && dms.getValue()) {
      const friend = dms.getValue().find((dm) => {
        if (dm.to.username === params.slug[0]) return dm;
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

  function update_draft() {
    const draft = compose_ref.current;
    if (dms.state === "hasValue" && dms.getValue() !== undefined) {
      setDms((dms) => {
        return dms.map((dm) => {
          if (dm.to.username !== params.slug[0]) return dm;

          return {
            ...dm,
            draft: draft ?? "",
            unreads: 0,
          };
        });
      });
    }
  }

  async function fetch_user_details() {
    try {
      const resp = await fetch(`/api/dm/${params.slug[0]}`);
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
    if (segments[1] !== "near") return;

    const msg_id = Number.parseInt(segments[2], 10);
    const chat_node = dm_ref.current;
    if (chat_node === null) return;

    const dm_comp = chat_node.querySelector(`#DM-${msg_id}`);
    if (dm_comp === null) return;

    dm_comp.scrollIntoView({
      behavior: "smooth",
      inline: "center",
    });

    dm_comp.style.transition = "all 0.5s ease";
    if (theme === "dark")
      dm_comp.style.backgroundColor = "rgb(30 41 59 / var(--tw-bg-opacity, 1))";
    else
      dm_comp.style.backgroundColor =
        "rgb(203 213 225 / var(--tw-bg-opacity, 1))";

    // Reset styles after 3 seconds
    setTimeout(() => {
      dm_comp.style.backgroundColor = "";
    }, 3000);

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, segments]);

  useEffect(() => {
    const chat_node = dm_ref.current;
    if (chat_node !== null) {
      const chat_history_comps = chat_node.querySelectorAll("#history");
      if (chat_history_comps.length < 1 || segments.length > 1) return;
      const last_comp_idx = chat_history_comps.length - 1;
      chat_history_comps[last_comp_idx].scrollIntoView({
        behavior: "smooth",
        inline: "center",
      });
    }
  }, [history, segments]);

  useEffect(() => {
    Signal.get_instance().REGISTER_CALLBACK(
      "ONLINE_CALLBACK",
      update_member_online_status,
    );
    return () => {
      Signal.get_instance().DEREGISTER("ONLINE_CALLBACK");
      update_draft();
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.status]);

  useEffect(() => {
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
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, dmStateDetails]);

  function invite_success_callback(_raw_data: string) {
    refresh_dm_state();
    refresh_dms();
  }

  function update_member_online_status(raw_data: string) {
    const data = JSON.parse(raw_data);
    const type: "MemberJoins" | "MemberLeaves" = data.type;
    const username = data.payload.username;
    if (username === params.slug[0]) {
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
      Signal.get_instance().INVITE(username, params.slug[0], compose);
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
                      src={`https://avatar.varuncodes.com/${params.slug[0]}`}
                    />
                    <AvatarFallback>
                      {params.slug[0].substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="mx-1 px-1">
                    <h3 className="scroll-m-20 text-xl font-semibold">
                      {params.slug[0]}
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
                  username: params.slug[0],
                }}
              />
            </Dialog>
          </div>
          <ScrollArea
            id="chatbox"
            className="flex flex-col h-full rounded-md border m-2"
          >
            {pinned_msg && pinned_msg.length > 0 && (
              <PinnedMessages
                msg_ref={dm_ref}
                msgs={pinned_msg ?? []}
                type="DM"
              />
            )}
            <div
              className={`${pinned_msg.length > 0 ? "my-16" : "mb-2"}`}
              ref={dm_ref}
            >
              {dmStateDetails.is_friend && (
                <DirectMessageHistory
                  msgs={dmStateDetails.friendship_data.messages.map((msg) => {
                    return {
                      ...msg,
                      type: "DM" as const,
                    };
                  })}
                  username={username}
                />
              )}
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
