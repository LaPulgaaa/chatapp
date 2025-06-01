"use client";

import {
  HeartPulseIcon,
  MessageSquareDotIcon,
  PlusSquare,
  SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import CreateRoom from "./CreateRoom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Dialog, DialogTrigger } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

import JoinRoomDialog from "@/components/JoinRoom";
export default function CandleSidebar() {
  const router = useRouter();
  const session = useSession();

  function get_initials() {
    const names = session.data!.user?.name?.split(" ");
    const initials = session.data?.username?.substring(0, 2);

    if (names === undefined) return initials;

    return names.map((name) => name.charAt(0)).join("");
  }

  return (
    <ScrollArea className={`mr-1 pr-4 sticky pt-4 mt-1 block lg:hidden`}>
      <div className="flex flex-col items-center">
        {session.status === "authenticated" && (
          <Link href={"/home"}>
            <Avatar>
              <AvatarImage src={session.data.avatar_url ?? undefined} />
              <AvatarFallback>{get_initials()}</AvatarFallback>
            </Avatar>
          </Link>
        )}
        <Button className="mt-1 p-1" variant={"ghost"} size={"icon"}>
          <HeartPulseIcon />
        </Button>
        <Dialog>
          <DialogTrigger>
            <div className="mt-1 p-2 hover:bg-gray-800 rounded-md ease-out duration-300 transition-all">
              <PlusSquare />
            </div>
          </DialogTrigger>
          <CreateRoom />
        </Dialog>
        <Dialog>
          <DialogTrigger>
            <div className="mt-1 p-2 hover:bg-gray-800 rounded-md ease-out duration-300 transition-all">
              <MessageSquareDotIcon />
            </div>
          </DialogTrigger>
          <JoinRoomDialog />
        </Dialog>
        <Button
          size={"icon"}
          className="mt-1 p-1"
          variant={"ghost"}
          onClick={() => router.push("/home/profile")}
        >
          <SettingsIcon />
        </Button>
      </div>
    </ScrollArea>
  );
}
