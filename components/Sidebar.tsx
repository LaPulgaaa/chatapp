import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

import CreateRoom from "./CreateRoom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Dialog, DialogTrigger } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

import JoinRoomDialog from "@/components/JoinRoom";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";

export default function Sidebar() {
  const router = useRouter();
  const session = useSession();

  const [openRoomDialog,setOpenRoomDialog] = useState<boolean>(false);
  const [joinRoomDialog,setJoinRoomDialog] = useState<boolean>(false);

  useKeyboardShortcut(["k","i","a","r","s"],(e: KeyboardEvent) => {
    const key = e.key;

    switch(key){
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
        router.push('/home/profile');
        break;
      }
    }
  })

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
        <TabButton tab_name="Explore" shortcut="k" tooltip_msg="Press 'k' to open explore/search section"></TabButton>
        <TabButton tab_name="Status" shortcut="i" tooltip_msg="Press 'i' to set your status"></TabButton>
        <Dialog open={openRoomDialog} onOpenChange={setOpenRoomDialog}>
          <DialogTrigger>
            <TabButton tab_name="Create" shortcut="a" tooltip_msg="Press 'a' to open create room dialog"></TabButton>
          </DialogTrigger>
          <CreateRoom />
        </Dialog>
        <Dialog open={joinRoomDialog} onOpenChange={setJoinRoomDialog}>
          <DialogTrigger>
            <TabButton tab_name="Join" shortcut="r" tooltip_msg="Press 'r' to open join room dialog"></TabButton>
          </DialogTrigger>
          <JoinRoomDialog />
        </Dialog>
        <TabButton
        tab_name="Settings" 
        shortcut="s" 
        tooltip_msg="Press 's' to open settings"
        onClick={()=>{
          router.push(`/home/profile`)
        }}
        ></TabButton>
      </div>
    </ScrollArea>
  );
}


function TabButton(
  {tab_name,shortcut,tooltip_msg,onClick}
  :
  {tab_name: string,shortcut: string,tooltip_msg: string;onClick?: () => void}){
  return (
    <Button variant={"ghost"} onClick={onClick} className="w-full flex justify-between space-x-2">
      <span>{tab_name}</span>
       <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span className="bg-slate-600 px-2 py-1 font-semibold rounded-sm">{shortcut}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip_msg}</p>
          </TooltipContent>
        </Tooltip>
       </TooltipProvider>
    </Button>
  )
}