"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { memo } from "react";
import { useRecoilValue, useRecoilValueLoadable } from "recoil";

import { direct_msg_state } from "@/lib/store/atom/dm";
import { subscribed_chats_state } from "@/lib/store/atom/subscribed_chats_state";
import { typing_event_store } from "@/lib/store/atom/typing_event_store";
import type { ChatReponse, PrivateChats } from "@/packages/valibot";

function get_last_msg_time(lastmsgAt: string | undefined): string {
  if (lastmsgAt === undefined) return "-";

  const last_msg_date = new Date(lastmsgAt);
  const now_date = new Date();

  if (
    last_msg_date.getFullYear() !== now_date.getFullYear() ||
    last_msg_date.getMonth() !== now_date.getMonth()
  )
    return last_msg_date.toDateString();
  else if (now_date.getDate() - last_msg_date.getDate() > 7) {
    const date_arr = last_msg_date.toDateString().split(" ");
    return (date_arr[1] + " " + date_arr[2]).toString();
  }
  if (now_date.getDate() - last_msg_date.getDate() > 1)
    return last_msg_date.toDateString().split(" ")[0];
  else if (now_date.getDate() - last_msg_date.getDate() === 1)
    return "Yesterday";

  const today_at = last_msg_date.toTimeString().split(" ")[0];
  const hour_min = today_at.split(":").slice(0, -1);
  return `${hour_min[0]}:${hour_min[1]}`;
}

export default function Home() {
  const session = useSession();
  const roomsStateData = useRecoilValueLoadable(subscribed_chats_state);
  const dmStateData = useRecoilValueLoadable(direct_msg_state);

  return (
    <div className="lg:col-span-4 mr-4 ml-2 pt-2">
      {session.status === "authenticated" ? (
        <div>
          
          {roomsStateData.state === "hasValue" &&
          dmStateData.state === "hasValue" ? (
            <RoomTabs
              rooms={roomsStateData.getValue()!}
              dms={dmStateData.getValue()!}
              username={session.data.username}
            />
          ) : (
            <div>Loading chats....</div>
          )}
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

//eslint-disable-next-line react/display-name
const RoomTabs = memo(function ({
  rooms,
  dms,
  username,
}: {
  rooms: ChatReponse;
  dms: PrivateChats;
  username: string;
}) {
  const router = useRouter();
  const typingState = useRecoilValue(typing_event_store);

  // `rooms` is a state variable so we can not mutate it
  // instead copy it over and sort accordingly
  const chats = rooms.map((room) => ({ type: "chat" as const, ...room }));
  const direct_msgs = dms.map((dm) => ({ type: "dm" as const, ...dm }));

  const sorted_acc_to_time = [...chats, ...direct_msgs];
  sorted_acc_to_time.sort(
    (a, b) => new Date(b.lastmsgAt).getTime() - new Date(a.lastmsgAt).getTime(),
  );

  return (
    <div>
      {sorted_acc_to_time?.map((convo) => {
        let maybe_typing = typingState.find(
          (state) => state.type === "CHAT" && state.room_id === convo.id,
        );
        if (convo.type === "chat") {
          const last_sent_msg = convo.messages.slice(-1)[0];
          return (
            <div
              key={convo.id}
              className="p-3 rounded-md m-1 cursor-pointer hover:bg-gray-300 hover:dark:bg-slate-800 border-2 ease-out duration-300 transition-all"
              onClick={() => {
                router.push(`/chat/${convo.id}`);
              }}
            >
              <div className="flex justify-between">
                <h5 className="border-l-2 text-xl font-semibold scroll-m-20 tracking-light pl-2">
                  {convo.name}
                </h5>
                <p className="hidden md:block">
                  {get_last_msg_time(convo.lastmsgAt)}
                </p>
              </div>

              <div className="flex justify-between border-l-2 pl-6 italic text-muted-foreground truncate">
                {maybe_typing !== undefined &&
                maybe_typing.typists.length > 0 ? (
                  <div>
                    {
                      <p className="font-semibold">
                        {maybe_typing.typists.join(", ")} are typing...
                      </p>
                    }
                  </div>
                ) : convo.draft ? (
                  <p>
                    <span className="text-red-500">Draft: </span>
                    {convo.draft}
                  </p>
                ) : last_sent_msg ? (
                  <div className="flex flex-row gap-1">
                    {last_sent_msg.sender.username !== username && (
                      <p>{last_sent_msg.sender.username}: </p>
                    )}
                    <p className="truncate">{last_sent_msg.content}</p>
                  </div>
                ) : (
                  <div>No messages yet.</div>
                )}
                {convo.unreads !== undefined && convo.unreads > 0 && (
                  <div className="dark:bg-white bg-slate-900 rounded-full md:w-[32px] md:block hidden">
                    <p className="w-full pl-2 dark:text-red-800 text-white">
                      {convo.unreads}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        }
        maybe_typing = typingState.find(
          (state) =>
            state.type === "DM" && state.conc_id === convo.connectionId,
        );
        return (
          <div
            key={convo.id}
            className="p-3 rounded-md m-1 cursor-pointer hover:bg-gray-300 hover:dark:bg-slate-800 border-2 ease-out duration-300 transition-all"
            onClick={() => {
              router.push(`/dm/${convo.to.username}`);
            }}
          >
            <div className="flex justify-between">
              <h5 className="border-l-2 text-xl font-semibold scroll-m-20 tracking-light pl-2">
                {convo.to.username}
              </h5>
              <p className="hidden md:block">
                {get_last_msg_time(convo.lastmsgAt)}
              </p>
            </div>

            <div className="flex justify-between border-l-2 pl-6 italic text-muted-foreground truncate">
              {maybe_typing !== undefined && maybe_typing.typists.length > 0 ? (
                <div>
                  {
                    <p className="font-semibold">
                      {maybe_typing.typists.join(", ")} is typing...
                    </p>
                  }
                </div>
              ) : convo.draft ? (
                <p>
                  <span className="text-red-500">Draft: </span>
                  {convo.draft}
                </p>
              ) : (
                <p className="truncate">
                  {convo.messages.slice(-1)[0]?.content}
                </p>
              )}
              {convo.unreads !== undefined && convo.unreads > 0 && (
                <div className="dark:bg-white bg-slate-900 rounded-full md:w-[32px] md:block hidden">
                  <p className="w-full pl-2 dark:text-red-800 text-white">
                    {convo.unreads}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});
