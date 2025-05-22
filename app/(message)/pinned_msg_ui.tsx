import { PinIcon } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useState } from "react";

import type { UnitMsg } from "./dm_ui";

export function PinnedMessages({
  dm_ref,
  msgs,
}: {
  dm_ref: React.RefObject<HTMLDivElement>;
  msgs: UnitMsg[];
}) {
  const [active, setActive] = useState<number>(0);
  const { theme } = useTheme();

  function scroll_into_view(id: string) {
    const pinned_node = dm_ref.current;
    if (pinned_node === null) return;

    const focused_msg_node = pinned_node.querySelector(`#dm-${id}`);

    if (focused_msg_node === null) return;

    focused_msg_node.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "center",
    });
    focused_msg_node.style.transition = "all 0.5s ease";
    if (theme === "dark")
      focused_msg_node.style.backgroundColor =
        "rgb(30 41 59 / var(--tw-bg-opacity, 1))";
    else
      focused_msg_node.style.backgroundColor =
        "rgb(203 213 225 / var(--tw-bg-opacity, 1))";

    // Reset styles after 3 seconds
    setTimeout(() => {
      focused_msg_node.style.backgroundColor = "";
    }, 3000);

    setActive((active) => {
      if (active === msgs.length - 1) return 0;
      return active + 1;
    });
  }
  return (
    <div className="absolute w-full mx-1">
      {msgs.map((msg, i) => {
        return (
          <div
            onClick={() =>
              scroll_into_view(
                msg.id.toString(),
              )
            }
            key={msg.id}
            className={` ${active !== i && "hidden"} flex flex-row gap-2 rounded-sm cursor-pointer bg-slate-100 dark:bg-slate-900 p-2 my-1 mr-4`}
          >
            <PinIcon className="mt-1" />
            <p className="text-muted-foreground ">{msg.content}</p>
          </div>
        );
      })}
    </div>
  );
}
