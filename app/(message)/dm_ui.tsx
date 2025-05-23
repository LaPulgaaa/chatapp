import { DrawingPinFilledIcon, StarFilledIcon } from "@radix-ui/react-icons";
import { useMemo } from "react";

import { DmContextMenu } from "./dm_context";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { RenderedMessage } from "@/packages/valibot";

export type UnitMsg = {
  type: "CHAT" | "DM";
  id: number;
  content: string;
  createdAt: string;
  sendBy: {
    username: string;
  };
  pinned: boolean;
  starred: boolean;
};

export default function DmRender({
  msg,
  username,
  id,
}: {
  msg: RenderedMessage;
  username: string;
  id: string;
}) {
  function create_timestamp(createdAt: string) {
    const time = new Date(createdAt)
      .toTimeString()
      .split(" ")[0]
      .split(":")
      .slice(0, -1);
    return `${time[0]}:${time[1]}`;
  }

  const msg_created_at = useMemo(() => {
    return create_timestamp(msg.createdAt);
  }, [msg.createdAt]);

  let initials = msg.sendBy.username.substring(0, 2);
  const names = msg.sendBy.name?.split(" ");
  if (names) {
    initials = names.map((name) => name.charAt(0)).join("");
  }

  return (
    <div key={msg.id} id={id}>
      {msg.sendBy.username !== username ? (
        <div id={`msg-${msg.id.toString()}`} className="flex m-2">
          {msg.type === "CHAT" && <Avatar
            className={`w-[35px] h-[35px] mr-2 mt-2 ${
              msg.sendBy.username === username ? "hidden" : ""
            }`}
          >
            <AvatarImage
              src={`https://avatar.varuncodes.com/${msg.sendBy.username}`}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>}
          <DmContextMenu msg={msg} username={username}>
            <div
              className={`w-full border-2 pb-1 mr-2 bg-slate-200 dark:bg-slate-900  max-w-prose rounded-md flex`}
            >
              <p className="w-7/8 italic text-wrap break-all mx-2 my-2">
                {msg.content}
              </p>
              <div className="flex flex-col gap-2 mt-1 mr-1">
                <div className="justify-end flex-1 ml-4">
                  {msg.starred === true && <StarFilledIcon />}
                </div>
                <div className="w-full flex flex-row gap-1 justify-end text-[10px] ml-2 mr-1">
                  <div>{msg.pinned && <DrawingPinFilledIcon />}</div>
                  <p className="mx-2">{msg_created_at}</p>
                </div>
              </div>
            </div>
          </DmContextMenu>
        </div>
      ) : (
        <div
          id={`msg-${msg.id.toString()}`}
          className="flex m-2 justify-end mr-3"
        >
          <DmContextMenu msg={msg} username={username}>
            <div
              className={`w-full border-2 pb-1 mr-2 bg-slate-200 dark:bg-slate-900  max-w-prose rounded-md flex`}
            >
              <p className="w-7/8 italic text-wrap break-all mx-2 my-2">
                {msg.content}
              </p>
              <div className="flex flex-col gap-2 mt-1 mr-1">
                <div className="w-full flex-1 flex justify-end ml-4 ">
                  {msg.starred === true && (
                    <StarFilledIcon className="justify-end mr-2" />
                  )}
                </div>
                <div className="w-full flex flex-row gap-1 justify-end text-[10px] ml-2">
                  <div>{msg.pinned && <DrawingPinFilledIcon />}</div>
                  <p className="mx-2">{msg_created_at}</p>
                </div>
              </div>
            </div>
          </DmContextMenu>
        </div>
      )}
    </div>
  );
}
