import { StarFilledIcon } from "@radix-ui/react-icons";
import {
  Copy,
  PinIcon,
  PinOff,
  StarIcon,
  Trash,
  Trash2Icon,
} from "lucide-react";
import React, { useMemo } from "react";

import { Signal } from "@/app/home/signal";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "@/hooks/use-toast";
import type { RenderedMessage } from "@/packages/valibot";

export function DmContextMenu({
  children,
  msg,
  username,
}: {
  children: React.ReactNode;
  msg: RenderedMessage;
  username: string;
}) {
  const delete_for_ev_disabled = useMemo(() => {
    const timestamp = new Date(msg.createdAt).getTime();
    if (
      (Date.now() - timestamp) / 60 <= 43200 &&
      msg.sendBy.username === username
    )
      return false;
    return true;
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msg]);

  function copy_to_clipboard() {
    navigator.clipboard.writeText(msg.content).then(
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

  function star_msg({ starred }: { starred: boolean }) {
    const payload = JSON.stringify({
      type: "star_msg",
      payload: {
        type: msg.type,
        id: msg.id,
        sender_id: username,
        starred,
      },
    });
    Signal.get_instance().SEND(payload);
  }

  function pin_msg({ pinned }: { pinned: boolean }) {
    const payload = JSON.stringify({
      type: "pin_msg",
      payload: {
        type: msg.type,
        id: msg.id,
        sender_id: username,
        pinned,
      },
    });
    Signal.get_instance().SEND(payload);
  }

  function delete_msg(delete_for_me?: undefined | boolean) {
    const payload = JSON.stringify({
      type: "delete",
      payload: {
        type: msg.type,
        id: msg.id,
        delete_for_me,
        sender_id: username,
      },
    });
    Signal.get_instance().SEND(payload);
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
        {msg.pinned ? (
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
        {msg.starred === true ? (
          <ContextMenuItem
            onSelect={() => {
              star_msg({ starred: false });
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
              star_msg({ starred: true });
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
