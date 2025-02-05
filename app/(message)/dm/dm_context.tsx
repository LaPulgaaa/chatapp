import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { StarFilledIcon } from "@radix-ui/react-icons";
import {
  Copy,
  PinIcon,
  PinOff,
  StarIcon,
  Trash,
  Trash2Icon,
} from "lucide-react";
import { UnitDM } from "./dm_ui";
import { Signal } from "@/app/home/signal";
import { useMemo } from "react";
import { toast } from "@/hooks/use-toast";

export function DmContextMenu({
  children,
  dm,
  username,
}: {
  children: React.ReactNode;
  dm: UnitDM;
  username: string;
}) {
  const delete_for_ev_disabled = useMemo(() => {
    const timestamp = new Date(dm.createdAt).getTime();
    if (
      (Date.now() - timestamp) / 60 <= 43200 &&
      dm.sendBy.username === username
    )
      return false;
    else return true;
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dm]);

  function copy_to_clipboard() {
    navigator.clipboard.writeText(dm.content).then(
      () => {
        toast({
          title: "Copied message to clipboard",
          duration: 3000,
        });
      },
      () => {
        toast({
          title: "Error copying text to clipboard",
          variant: "destructive",
          duration: 4000,
        });
      },
    );
  }

  function star_msg({ starred }: { starred: string[] }) {
    let msg;
    if (dm.is_local_echo === true) {
      msg = JSON.stringify({
        type: "star_msg",
        payload: {
          type: "DM",
          is_local_echo: true,
          hash: dm.hash,
          sender_id: username,
          starred,
        },
      });
    } else {
      msg = JSON.stringify({
        type: "star_msg",
        payload: {
          type: "DM",
          is_local_echo: false,
          id: dm.id,
          starred,
        },
      });
    }
    Signal.get_instance().SEND(msg);
  }

  function pin_msg({ pinned }: { pinned: boolean }) {
    let msg;
    if (dm.is_local_echo === true) {
      msg = JSON.stringify({
        type: "pin_msg",
        payload: {
          type: "DM",
          is_local_echo: true,
          hash: dm.hash,
          sender_id: username,
          pinned,
        },
      });
    } else {
      msg = JSON.stringify({
        type: "pin_msg",
        payload: {
          type: "DM",
          is_local_echo: false,
          id: dm.id,
          pinned,
        },
      });
    }
    Signal.get_instance().SEND(msg);
  }

  function delete_msg(delete_for_me?: undefined | boolean) {
    let msg;
    if (dm.is_local_echo === true) {
      msg = JSON.stringify({
        type: "delete",
        payload: {
          type: "DM",
          is_local_echo: true,
          hash: dm.hash,
          delete_for_me,
          sender_id: username,
        },
      });
    } else {
      msg = JSON.stringify({
        type: "delete",
        payload: {
          type: "DM",
          is_local_echo: false,
          id: dm.id,
          delete_for_me,
          sender_id: username,
        },
      });
    }
    Signal.get_instance().SEND(msg);
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem
          disabled={delete_for_ev_disabled}
          inset
          onSelect={() => {
            delete_msg();
          }}
        >
          <Trash2Icon />
          <span className="ml-2">Delete for everyone</span>
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => {
            delete_msg(true);
          }}
          inset
        >
          <Trash />
          <span className="ml-2">Delete for me</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        {dm.pinned ? (
          <ContextMenuItem
            onSelect={() => {
              pin_msg({
                pinned: false,
              });
            }}
            inset
          >
            <PinOff />
            <span className="ml-2">Unpin</span>
          </ContextMenuItem>
        ) : (
          <ContextMenuItem
            onSelect={() => {
              pin_msg({
                pinned: true,
              });
            }}
            inset
          >
            <PinIcon />
            <span className="ml-2">Pin</span>
          </ContextMenuItem>
        )}
        {dm.starred.includes(username) ? (
          <ContextMenuItem
            onSelect={() => {
              const left_starred = dm.starred.filter(
                (member) => member !== username,
              );
              star_msg({ starred: left_starred });
            }}
            className="ml-1"
            inset
          >
            <StarIcon />
            <span className="ml-2">Unstar</span>
          </ContextMenuItem>
        ) : (
          <ContextMenuItem
            onSelect={() => {
              star_msg({ starred: [...dm.starred, username] });
            }}
            className="ml-1"
            inset
          >
            <StarFilledIcon />
            <span className="ml-2">Star</span>
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={copy_to_clipboard} inset>
          <Copy />
          <span className="ml-2">Copy</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
