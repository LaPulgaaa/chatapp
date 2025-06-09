"use client";

import { ArrowLeft, Edit, Sidebar } from "lucide-react";
import assert from "minimalistic-assert";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRecoilState, useRecoilStateLoadable, useRecoilValue } from "recoil";
import * as v from "valibot";

import { TypingEvent } from "../../dm/typing_event";
import { ComposeBox } from "../../dm/typing_status";
import ChatMessageHistory from "../../history";
import { PinnedMessages } from "../../pinned_msg_ui";
import EditRoomDetails from "../edit_room_details";
import HeaderDropdown from "../header_dropdown";

import { Signal } from "@/app/home/signal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { isSidebarHidden } from "@/lib/store/atom/sidebar";
import { member_online_state } from "@/lib/store/atom/status";
import { subscribed_chats_state } from "@/lib/store/atom/subscribed_chats_state";
import { room_member_details_schema } from "@/packages/valibot";
import type { RenderedMessage, RoomHeaderDetails } from "@/packages/valibot";

export type RecievedMessage = {
  type: string;
  payload: {
    id: number;
    msg_type: "dm" | "chat";
    roomId: string;
    message: {
      content: string;
      user: string;
      name?: string;
    };
    createdAt: string;
    hash: string;
  };
};

export default function Chat({ params }: { params: { slug: string[] } }) {
  const segments = params.slug;

  const router = useRouter();

  const { theme } = useTheme();
  const compose_ref = useRef<string | null>(null);
  const chat_ref = useRef<HTMLDivElement | null>(null);
  const [compose, setCompose] = useState<string>("");
  const session = useSession();
  const [ishidden, setIshidden] = useRecoilState(isSidebarHidden);
  const [roomDetails, setRoomDetails] = useState<RoomHeaderDetails>();
  const room_id = params.slug[0];
  const user_id = session.data?.id;
  const [memberStatus, setMemberStatus] = useRecoilState(member_online_state);
  const [roomsStateData, setRoomsStateData] = useRecoilStateLoadable(
    subscribed_chats_state,
  );
  const [chatMessages, setchatMessages] = useState<RenderedMessage[]>([]);

  const recipient = useMemo(() => {
    if (session.status !== "authenticated") return null;

    return {
      user_id: session.data.username,
      message_type: "CHAT" as const,
      notification_type: "typing" as const,
      room_id: params.slug[0],
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug[0], session]);

  const pinned_messages = useMemo(() => {
    if (chatMessages.length > 0) {
      return chatMessages.filter((msg) => msg.pinned === true);
    }

    return [];
  }, [chatMessages]);

  //TODO: Can this be converted to useMemo
  useEffect(() => {
    if (roomsStateData.state === "hasValue" && roomsStateData.getValue()) {
      const all_rooms_data = roomsStateData.getValue();
      const narrowed_room = all_rooms_data.find(
        (room) => room.id === params.slug[0],
      );
      assert(narrowed_room !== undefined);

      setRoomDetails({
        name: narrowed_room.name,
        description: narrowed_room.description,
        createdAt: narrowed_room.createdAt,
      });
      setCompose(narrowed_room.draft ?? "");
      const chatMessages = narrowed_room.messages.map((msg) => {
        const { sender, ...rest_msg } = msg;
        return {
          ...rest_msg,
          type: "CHAT" as const,
          sendBy: msg.sender,
        };
      });
      setchatMessages(chatMessages);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomsStateData]);

  function update_draft() {
    const draft = compose_ref.current;
    if (
      roomsStateData.state === "hasValue" &&
      roomsStateData.getValue() !== undefined
    ) {
      setRoomsStateData((rooms) => {
        return rooms.map((room) => {
          if (room.id !== params.slug[0]) return room;
          console.log("updating unreads");
          return {
            ...room,
            draft: draft ?? "",
            unreads: 0,
          };
        });
      });
    }
  }

  useEffect(() => {
    if (room_id === undefined || session.status !== "authenticated") return;

    Signal.get_instance(session.data.username).SUBSCRIBE(
      room_id,
      session.data.id,
      session.data.username,
    );
    Signal.get_instance().REGISTER_CALLBACK(
      "ONLINE_CALLBACK",
      update_member_online_status,
    );

    return () => {
      if (room_id === undefined || session.status !== "authenticated") return;

      Signal.get_instance().UNSUBSCRIBE(params.slug[0], session.data.username);
      Signal.get_instance().DEREGISTER("ONLINE_CALLBACK");
      update_draft();
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room_id, user_id, session.status]);

  function update_member_online_status(raw_data: string) {
    const data = JSON.parse(`${raw_data}`);
    const type: "MemberJoins" | "MemberLeaves" = data.type;
    const member = memberStatus.find(
      (m) => m.username === data.payload.username,
    );

    if (member === undefined) return;

    const other_members = memberStatus.filter(
      (m) => m.username !== data.payload.username,
    );
    // TODO: Recheck this
    setMemberStatus((_memberStatus) => [
      { ...member, active: type === "MemberJoins" },
      ...other_members,
    ]);
  }

  useEffect(() => {
    if (segments[1] !== "near") return;

    const msg_id = Number.parseInt(segments[2], 10);
    const chat_node = chat_ref.current;

    if (chat_node === null) return;

    const chat_comp = chat_node.querySelector(`#CHAT-${msg_id}`);

    if (chat_comp === null) return;

    chat_comp.scrollIntoView({
      behavior: "instant",
      inline: "center",
    });

    chat_comp.style.transition = "all 0.5s ease";
    if (theme === "dark")
      chat_comp.style.backgroundColor =
        "rgb(30 41 59 / var(--tw-bg-opacity, 1))";
    else
      chat_comp.style.backgroundColor =
        "rgb(203 213 225 / var(--tw-bg-opacity, 1))";

    // Reset styles after 3 seconds
    setTimeout(() => {
      chat_comp.style.backgroundColor = "";
    }, 3000);
  }, [chatMessages, segments, theme]);

  useEffect(() => {
    const chat_node = chat_ref.current;

    if (chat_node === null || segments.length > 1) return;

    const chat_history_comps = chat_node.querySelectorAll("#history");
    if (chat_history_comps.length < 1) return;

    const last_comp_idx = chat_history_comps.length - 1;
    chat_history_comps[last_comp_idx].scrollIntoView({
      behavior: "smooth",
      inline: "center",
    });
  }, [chatMessages, segments]);

  function sendMessage() {
    const data = {
      type: "message",
      payload: {
        roomId: params.slug[0],
        msg_type: "chat",
        message: {
          content: compose,
          user: session.data!.username,
          name: session.data!.user?.name,
          id: session.data!.id,
        },
      },
    };
    setCompose("");
    compose_ref.current = "";
    Signal.get_instance().SEND(JSON.stringify(data));
  }

  return (
    <div className="h-svh w-full pb-24">
      <div className="flex justify-between mt-2 mx-1">
        {roomDetails && session.status === "authenticated" && (
          <>
            <div className="w-full flex justify-between mx-2 border-[1.5px] border-slate-800 rounded">
              <div className="w-full flex px-3 pt-1">
                <Button 
                className="sm:hidden pb-2 hover:bg-transparent"
                onClick={() => router.back()}
                variant={"ghost"} size={"icon"}><ArrowLeft/></Button>
                <h4 className="truncate scroll-m-20 text-xl pb-1 font-semibold tracking-tight mr-3">
                  {roomDetails.name}
                </h4>
                <p className="truncate mt-1 italic px-1">
                  {` >> `}{roomDetails.description}
                </p>
              </div>
              <div className="space-x-2 hidden md:flex">
              <Dialog >
                    <DialogTrigger><Edit/></DialogTrigger>
                    <EditRoomDetails
                      room_details={{
                        name: roomDetails!.name,
                        description: roomDetails!.description,
                      }}
                      chat_id={params.slug[0]}
                    />
                  </Dialog>
                <HeaderDropdown room_details={{
                  id: params.slug[0],
                  name: roomDetails.name,
                  description: roomDetails.description
                }} />
              </div>
            </div>
          </>
        )}
        <Button
                  className="hidden md:block"
                  onClick={() => setIshidden(!ishidden)}
                  size={"icon"}
                  variant={"ghost"}
                >
                  <Sidebar/>
                </Button>
      </div>

      <div className="mt-2 h-[100%] flex w-full">
        <ScrollArea
          id="chatbox"
          className="flex flex-col w-full h-full rounded-md border m-2"
        >
          <PinnedMessages
            msg_ref={chat_ref}
            msgs={pinned_messages}
            type="CHAT"
          />
          <div className={`${pinned_messages.length > 0 ? "my-16" : "mb-2"}`}>
            <div ref={chat_ref}>
              {session.status === "authenticated" && (
                <ChatMessageHistory
                  msgs={chatMessages}
                  username={session.data.username}
                />
              )}
            </div>
          </div>
          {session.status === "authenticated" && (
            <TypingEvent
              typing_details={{
                type: "CHAT",
                room_id: params.slug[0],
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
        {session.status === "authenticated" && (
          <Members room_id={params.slug[0]} username={session.data.username} />
        )}
      </div>
    </div>
  );
}

function Members({ room_id, username }: { room_id: string; username: string }) {
  const ishidden = useRecoilValue(isSidebarHidden);
  const [memberStatus, setMemberStatus] = useRecoilState(member_online_state);
  useEffect(() => {
    const fetch_members = async () => {
      try {
        const resp = await fetch(
          `http://localhost:3001/chat/getMembers/${room_id}`,
          {
            credentials: "include",
          },
        );
        if (resp.status !== 200) return;

        const { raw_data } = await resp.json();
        const parsed = v.safeParser(room_member_details_schema)(raw_data);
        if (parsed.success) {
          setMemberStatus(parsed.output);
        } else console.log(parsed.issues);
      } catch (err) {
        console.log(err);
      }
    };
    fetch_members();
  }, [room_id, setMemberStatus]);
  return (
    <ScrollArea
      className={`hidden ${ishidden === true ? "lg:hidden" : "lg:block"} w-[400px]`}
    >
      <div>
        {memberStatus.map((member) => {
          let initials = member.username.substring(0, 2);
          const names = member.name?.split(" ");
          let is_active = member.active;
          if (names) {
            initials = names.map((name) => name.charAt(0)).join("");
          }
          if (member.username === username) is_active = true;
          return (
            <div
              key={member.username}
              className={`flex justify-between rounded-md p-1 w-full h-[72px] m-1`}
            >
              <div className="flex item-center p-2">
                <Avatar className="mr-1">
                  <AvatarImage src={member.avatarurl ?? ""} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="px-1 mx-1">
                  <div>{member.username}</div>
                  <div className="italic text-muted-foreground truncate w-[124px] text-[15px]">
                    {member.status ?? "NA"}
                  </div>
                </div>
              </div>
              <Badge
                className={`
                                    h-6 mt-4 mr-1
                                    ${is_active ? "bg-rose-600" : "bg-green-400"}
                                    `}
              >
                {is_active ? "Active" : "Offline"}
              </Badge>
              <br />
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
