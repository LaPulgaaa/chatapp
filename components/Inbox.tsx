import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import type { UnitMessage } from "@/packages/zod";
import { useSession } from "next-auth/react";
export default function Inbox({ data }: { data: UnitMessage }) {
  const time = new Date(data.createdAt)
    .toTimeString()
    .split(" ")[0]
    .split(":")
    .slice(0, -1);
  const session = useSession();
  let initials = data.sender.username.substring(0, 2);
  const names = data.sender.name?.split(" ");
  if (names) {
    initials = names.map((name) => name.charAt(0)).join("");
  }

  //@ts-ignore
  const username = session.data?.username;

  return (
    <div
      id="history"
      className={`flex m-2 ${data.sender.username === username ? "justify-end" : data.sender.username === "" ? " justify-center" : ""}  `}
    >
      <Avatar
        className={`w-[35px] h-[35px] mr-2 mt-1  ${data.sender.username === username ? "hidden" : ""}`}
      >
        <AvatarImage
          src={`https://avatar.varuncodes.com/${data.sender.username}`}
        />
        <AvatarFallback className="p-4 bg-slate-200 dark:bg-slate-900">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div
        className={`border-2 pb-1 mr-2 p-2 bg-slate-200 dark:bg-slate-900  max-w-prose rounded-md flex`}
      >
        <p className="italic text-wrap">{data.content}</p>
        <p className="flex justify-end text-[10px] mt-3 ml-2">
          {time[0] + ":" + time[1]}
        </p>
      </div>
    </div>
  );
}
