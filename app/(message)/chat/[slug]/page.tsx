"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Edit,
  ListEndIcon,
} from "lucide-react";
import assert from "minimalistic-assert";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRecoilState, useRecoilStateLoadable, useRecoilValue } from "recoil";
import * as v from "valibot";

import { TypingEvent } from "../../dm/typing_event";
import { ComposeBox } from "../../dm/typing_status";
import EditRoomDetails from "../edit_room_details";

import { Signal } from "@/app/home/signal";
import { leave_room } from "@/app/home/util";
import { DarkLight } from "@/components/DarkLight";
import Inbox from "@/components/Inbox";
import Message from "@/components/Message";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chat_details_state } from "@/lib/store/atom/chat_details_state";
import { UserStateChats } from "@/lib/store/atom/chats";
import { isSidebarHidden } from "@/lib/store/atom/sidebar";
import { member_online_state } from "@/lib/store/atom/status";
import { subscribed_chats_state } from "@/lib/store/atom/subscribed_chats_state";
import type { ChatMessageData, RoomHeaderDetails } from "@/packages/valibot";
import {
  chat_messages_schema,
  room_member_details_schema,
} from "@/packages/valibot";

export type RecievedMessage = {
  type: string;
  payload: {
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

export default function Chat({ params }: { params: { slug: string } }) {
  const compose_ref = useRef<string | null>(null);
  const chat_ref = useRef<HTMLDivElement>(null);
  const [sweeped, setSweeped] = useState<ChatMessageData["messages"]>([]);
  const [realtimechat, setRealtimechat] = useState<React.JSX.Element[]>([]);
  const [compose, setCompose] = useState<string>("");
  const [chat, setChat] = useState<RecievedMessage[]>([]);
  const session = useSession();
  const [rooms, setRooms] = useRecoilState(UserStateChats);
  const [ishidden, setIshidden] = useRecoilState(isSidebarHidden);
  const router = useRouter();
  const [roomDetails, setRoomDetails] = useState<RoomHeaderDetails>();
  const room_id = params.slug;
  const user_id = session.data?.id;
  const [memberStatus, setMemberStatus] = useRecoilState(member_online_state);
  const [roomsStateData, setRoomsStateData] = useRecoilStateLoadable(
    subscribed_chats_state,
  );
  const [roomDetailState, setRoomDetailState] = useRecoilStateLoadable(
    chat_details_state({ chat_id: params.slug }),
  );

  const recipient = useMemo(() => {
    if (session.status !== "authenticated") return null;

    return {
      user_id: session.data.username,
      message_type: "CHAT" as const,
      notification_type: "typing" as const,
      room_id: params.slug,
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug, session]);

  useEffect(() => {
    if (roomsStateData.state === "hasValue" && roomsStateData.getValue()) {
      const all_rooms_data = roomsStateData.getValue();
      const narrowed_room = all_rooms_data.find(
        (room) => room.id === params.slug,
      );
      assert(narrowed_room !== undefined);

      setRoomDetails({
        name: narrowed_room.name,
        description: narrowed_room.description,
        createdAt: narrowed_room.createdAt,
      });
      setCompose(narrowed_room.draft ?? "");
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomsStateData]);

  function update_draft() {
    const draft = compose_ref.current;
    if (draft !== null && roomsStateData.state === "hasValue") {
      const rooms_with_draft_msg = roomsStateData.getValue().map((room) => {
        if (room.id !== params.slug) return room;

        return {
          ...room,
          draft,
        };
      });
      setRoomsStateData([...rooms_with_draft_msg]);
    }
  }

  function update_last_sent_message() {
    if (roomsStateData.state === "hasValue") {
      console.log("is this being updated");
      const all_rooms_data = roomsStateData.getValue();
      const narrowed_room = all_rooms_data.find(
        (room) => room.id === params.slug,
      );
      assert(narrowed_room !== undefined);
      const other_rooms = all_rooms_data.filter(
        (room) => room.id !== narrowed_room.id,
      );

      let new_last_msg;

      if (chat.length > 0) {
        const last_recent_msg = chat.slice(-1)[0];
        new_last_msg = {
          id: Math.random(),
          createdAt: last_recent_msg.payload.createdAt,
          content: last_recent_msg.payload.message.content,
          sender: {
            username: last_recent_msg.payload.message.user,
            name: last_recent_msg.payload.message.name,
          },
        };
      } else if (sweeped.length > 0) {
        const last_sweeped_msg = sweeped.slice(-1)[0];
        new_last_msg = {
          createdAt: last_sweeped_msg.createdAt,
          content: last_sweeped_msg.content,
          sender: {
            username: last_sweeped_msg.sender.username,
          },
        };
      }

      if (new_last_msg === undefined) return;

      const room_details_with_updated_last_msg = {
        ...narrowed_room,
        lastmsgAt: new_last_msg.createdAt,
        messages: [
          {
            id: Math.random(),
            content: new_last_msg.content,
            createdAt: new_last_msg.createdAt,
            sender: {
              username: new_last_msg.sender.username,
              name: new_last_msg.sender.name,
            },
          },
        ],
      };
      setRoomsStateData([...other_rooms, room_details_with_updated_last_msg]);
    }
  }

  async function sweep_latest_messages(last_msg_id: number | undefined) {
    try {
      const resp = await fetch(`/api/message/chat/sweep/${params.slug}`, {
        method: "POST",
        body: JSON.stringify({
          last_msg_id: last_msg_id ?? -1,
        }),
      });
      const { raw_data } = await resp.json();
      const data = v.parse(chat_messages_schema, raw_data);
      setSweeped(data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    async function sweep_recent_chat_msgs() {
      if (
        roomDetailState.state !== "hasValue" ||
        roomDetailState.getValue() === undefined
      )
        return;

      setSweeped([]);
      const last_msg = roomDetailState.getValue()!.slice(-1);
      sweep_latest_messages(last_msg[0]?.id);
    }
    sweep_recent_chat_msgs();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomDetailState.state]);

  useEffect(() => {
    if (sweeped.length > 0) {
      setRoomDetailState((prev_state) => [...(prev_state ?? []), ...sweeped]);
      setRealtimechat([]);
      update_last_sent_message();
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sweeped]);

  useEffect(() => {
    if (room_id === undefined || session.status !== "authenticated") return;

    Signal.get_instance(session.data.username).SUBSCRIBE(
      room_id,
      session.data.id,
      session.data.username,
    );
    Signal.get_instance().REGISTER_CALLBACK("MSG_CALLBACK", recieve_msg);
    Signal.get_instance().REGISTER_CALLBACK(
      "ONLINE_CALLBACK",
      update_member_online_status,
    );

    return () => {
      if (room_id === undefined || session.status !== "authenticated") return;

      Signal.get_instance().UNSUBSCRIBE(params.slug, session.data.username);
      Signal.get_instance().DEREGISTER("MSG_CALLBACK");
      Signal.get_instance().DEREGISTER("ONLINE_CALLBACK");
      update_draft();
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room_id, user_id, session.status]);
  function recieve_msg(raw_data: string) {
    const data: RecievedMessage = JSON.parse(`${raw_data}`);
    if (data.payload.roomId !== params.slug) return;

    setChat([...chat, data]);
    setRealtimechat((realtimechat) => [
      ...realtimechat,
      <Message
        key={(session.data?.user?.email?.substring(5) || "") + Date.now()}
        data={data}
      />,
    ]);
  }

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
    const chat_node = chat_ref.current;
    if (chat_node !== null) {
      const chat_history_comps = chat_node.querySelectorAll("#history");
      if (chat_history_comps.length < 1) return;

      const last_comp_idx = chat_history_comps.length - 1;
      chat_history_comps[last_comp_idx].scrollIntoView({
        behavior: "instant",
        inline: "center",
      });
    }
  }, [roomDetailState]);

  useEffect(() => {
    const chat_node = chat_ref.current;
    if (chat_node !== null) {
      const recent_msg_comps = chat_node.querySelectorAll("#recent");
      if (recent_msg_comps.length < 1) return;

      const last_recent_idx = recent_msg_comps.length - 1;
      recent_msg_comps[last_recent_idx].scrollIntoView({
        behavior: "smooth",
        inline: "center",
      });
    }
    if (realtimechat.length > 10) {
      setSweeped([]);
      const last_msg = roomDetailState.getValue()!.slice(-1);
      sweep_latest_messages(last_msg[0]?.id);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat]);

  function sendMessage() {
    const data = {
      type: "message",
      payload: {
        roomId: params.slug,
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

  async function may_be_leave_room() {
    const opcode_id = rooms.find((room) => room.id === params.slug)?.conn_id;
    if (opcode_id === undefined || session.status !== "authenticated") {
      alert("Could not leave the chat!");
      return;
    }

    const is_deleted = await leave_room({
      member_id: session.data?.id,
      chat_id: params.slug,
      conn_id: opcode_id,
    });

    if (is_deleted) {
      const left_rooms = rooms.filter((room) => room.id !== params.slug);
      setRooms(left_rooms);
      router.push("/home");
    }
  }

  return (
    <div className="h-svh w-full pb-24">
      <div className="flex justify-between mt-2 mx-1">
        {roomDetails && (
          <>
            <div className="w-full flex justify-between mx-2 mr-4 border-[1.5px] border-slate-800 rounded">
              <div className="w-full flex px-3 pt-1 mx-2 ">
                <h4 className="scroll-m-20 text-xl pb-1 font-semibold tracking-tight mr-3">
                  {roomDetails.name}
                </h4>
                <h5 className="truncate border-l-2 pl-4 italic my-1">
                  {roomDetails.description}
                </h5>
              </div>
              <div className="flex space-x-2">
                <Button
                  className="px-1"
                  onClick={() => setIshidden(!ishidden)}
                  size={"icon"}
                  variant={"ghost"}
                >
                  {ishidden ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </Button>
                <Button className="px-1" size={"icon"} variant={"ghost"}>
                  <Dialog>
                    <DialogTrigger>
                      <Edit />
                    </DialogTrigger>
                    <EditRoomDetails
                      room_details={{
                        name: roomDetails!.name,
                        description: roomDetails!.description,
                      }}
                      chat_id={params.slug}
                    />
                  </Dialog>
                </Button>
              </div>
            </div>
          </>
        )}
        <div className="flex mr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size={`icon`} variant={`outline`} className="mr-4">
                <ListEndIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={may_be_leave_room}
                className="cursor-pointer"
              >
                Leave Room
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DarkLight />
        </div>
      </div>

      <div className="mt-2 h-[100%] flex w-full">
        <ScrollArea
          id="chatbox"
          className="flex flex-col w-full h-full rounded-md border m-2"
        >
          <div className="mb-2" ref={chat_ref}>
            <div>
              {roomDetailState.state === "hasValue" &&
              roomDetailState.getValue() ? (
                roomDetailState.getValue()!.map((message) => {
                  return <Inbox key={message.id} data={message} />;
                })
              ) : (
                <div className="flex flex-col items-center justify-center mt-4">
                  Loading...
                </div>
              )}
            </div>
            <div>{realtimechat}</div>
          </div>
          {session.status === "authenticated" && (
            <TypingEvent
              typing_details={{
                type: "CHAT",
                room_id: params.slug,
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
          <Members room_id={params.slug} username={session.data.username} />
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
