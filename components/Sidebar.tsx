import {
  HeartPulseIcon,
  MessageSquareDotIcon,
  PlusSquare,
  SettingsIcon,
 UserSearchIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import CreateRoom from "./CreateRoom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogTrigger } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

import JoinRoomDialog from "@/components/JoinRoom";
export default function Sidebar() {
  const router = useRouter();
  const session = useSession();

  function get_initials() {
    const names = session.data!.name?.split(" ");
    let initials = session.data?.username?.substring(0, 2);
    if (names !== undefined) {
      initials = names.map((name) => name.charAt(0)).join("");
    }

    return initials;
  }

  return (
    <ScrollArea className={`mr-2 p-2 sticky pt-4 mt-1 hidden lg:block`}>
      {session.status === "authenticated" && (
        <div className="flex ml-1 pb-2 text-center cursor-pointer justify-between">
          <Link href={"/home"} className="flex w-full">
            <Avatar className="">
              <AvatarImage
                src={`https://avatar.varuncodes.com/${session.data.username}`}
              />
              <AvatarFallback>{get_initials()}</AvatarFallback>
            </Avatar>
            <h6 className="pt-2 ml-2">{session.data.name ?? ""}</h6>
          </Link>
          <br />
        </div>
      )}
      <div className="text-center sm:text-left grid grid-cols-1 divide-y">
        <Link
          href={"/home/explore"}
          className="flex cursor-pointer my-[1/2] w-full hover:bg-gray-500 p-2 dark:hover:bg-gray-800 rounded-md ease-out duration-300 transition-all"
        >
          <UserSearchIcon />
          <p className="ml-2">Explore</p>
        </Link>
        <div className="flex cursor-pointer my-[1/2] w-full hover:bg-gray-500 p-2 dark:hover:bg-gray-800 rounded-md ease-out duration-300 transition-all">
          <HeartPulseIcon />
          <p className="ml-3">Set Status</p>
        </div>
        <Dialog>
          <DialogTrigger>
            <div className="flex cursor-pointer my-[1/2] w-full hover:bg-gray-500 p-2 dark:hover:bg-gray-800 rounded-md ease-out duration-300 transition-all">
              <PlusSquare /> <p className="ml-3">Add Room</p>
            </div>
          </DialogTrigger>
          <CreateRoom />
        </Dialog>
        <Dialog>
          <DialogTrigger>
            <div className="flex cursor-pointer my-[1/2] w-full hover:bg-gray-500 p-2 dark:hover:bg-gray-800 rounded-md ease-out duration-300 transition-all">
              <MessageSquareDotIcon /> <p className="ml-3">Join Room</p>
            </div>
          </DialogTrigger>
          <JoinRoomDialog />
        </Dialog>
        <div
          className="flex cursor-pointer my-[1/2] w-full hover:bg-gray-500 p-2 dark:hover:bg-gray-800 rounded-md ease-out duration-300 transition-all"
          onClick={() => router.push("/home/profile")}
        >
          <SettingsIcon />
          <p className="ml-2">Profile</p>
        </div>
      </div>
    </ScrollArea>
  );
}
