import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

import CreateRoom from "./CreateRoom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogTrigger } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

import JoinRoomDialog from "@/components/JoinRoom";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";

export default function Sidebar() {
  const router = useRouter();
  const session = useSession();

  const [openRoomDialog, setOpenRoomDialog] = useState<boolean>(false);
  const [joinRoomDialog, setJoinRoomDialog] = useState<boolean>(false);

  useKeyboardShortcut(["k", "i", "a", "r", "s"], (e: KeyboardEvent) => {
    const key = e.key;

    switch (key) {
      case "k": {
        router.push(`/home/explore`);
        break;
      }
      case "a": {
        setOpenRoomDialog(true);
        break;
      }
      case "r": {
        setJoinRoomDialog(true);
        break;
      }
      case "s": {
        router.push("/home/profile");
        break;
      }
    }
  });

  function get_initials() {
    const names = session.data!.name?.split(" ");
    const initials = session.data?.username?.substring(0, 2);

    if (names === undefined) return initials;

    return names.map((name) => name.charAt(0)).join("");
  }

  return (
    <ScrollArea className={`p-2 sticky pt-4 mt-1 hidden lg:block`}>
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
        <TabButton
          tab_name="Status"
          shortcut="i"
          tooltip_msg="Press 'i' to set your status"
        />
        <Dialog open={openRoomDialog} onOpenChange={setOpenRoomDialog}>
          <DialogTrigger>
            <TabButton
              tab_name="Create"
              shortcut="a"
              tooltip_msg="Press 'a' to open create room dialog"
            />
          </DialogTrigger>
          <CreateRoom onOpenChange={setOpenRoomDialog} />
        </Dialog>
        <Dialog open={joinRoomDialog} onOpenChange={setJoinRoomDialog}>
          <DialogTrigger>
            <TabButton
              tab_name="Join"
              shortcut="r"
              tooltip_msg="Press 'r' to open join room dialog"
            />
          </DialogTrigger>
          <JoinRoomDialog onOpenChange={setJoinRoomDialog} />
        </Dialog>
        <TabButton
          tab_name="Settings"
          shortcut="s"
          tooltip_msg="Press 's' to open settings"
          onClick={() => {
            router.push(`/home/profile`);
          }}
        />
      </div>
    </ScrollArea>
  );
}

function TabButton({
  tab_name,
  shortcut,
  tooltip_msg,
  onClick,
}: {
  tab_name: string;
  shortcut: string;
  tooltip_msg: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="w-full flex justify-between space-x-2 py-2 px-4 cursor-pointer rounded-sm hover:bg-slate-800 transition duration-300 ease-in-out"
    >
      <span>{tab_name}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span className="dark:bg-slate-600 bg-slate-200 px-2 py-1 font-semibold rounded-sm">
              {shortcut}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <span>{tooltip_msg}</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
