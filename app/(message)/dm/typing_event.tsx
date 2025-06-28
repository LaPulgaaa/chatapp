import { useEffect, useMemo, useRef, useState } from "react";
import { useRecoilValue } from "recoil";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { typing_event_store } from "@/lib/store/atom/typing_event_store";

type TypingDetails =
  | {
      type: "CHAT";
      room_id: string;
    }
  | {
      type: "DM";
      conc_id: string;
    };

export function TypingEvent({
  typing_details,
}: {
  typing_details: TypingDetails;
}) {
  const typingState = useRecoilValue(typing_event_store);
  const compose_ref = useRef<HTMLDivElement | null>(null);
  const [composeVisibility, setComposeVisibility] = useState<boolean>(false);

  const typing_data = useMemo(() => {
    return typingState.find((room_or_dm) => {
      if (
        room_or_dm.type === "CHAT" &&
        typing_details.type === "CHAT" &&
        room_or_dm.room_id === typing_details.room_id
      )
        return room_or_dm;
      else if (
        room_or_dm.type === "DM" &&
        typing_details.type === "DM" &&
        room_or_dm.conc_id === typing_details.conc_id
      )
        return room_or_dm;
    });
  }, [typingState, typing_details]);

  useEffect(() => {
    const compose_node = compose_ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setComposeVisibility(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    if (compose_node) {
      observer.observe(compose_node);
    }

    return () => {
      if (compose_node) observer.unobserve(compose_node);
    };
  }, []);

  useEffect(() => {
    if (
      typing_data &&
      typing_data.typists.length > 0 &&
      composeVisibility === true
    ) {
      const compose_node = compose_ref.current;
      if (compose_node) {
        compose_node.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "center",
        });
      }
    }
  }, [typing_data, composeVisibility]);

  return (
    <div className="mb-14">
      {typing_data && typing_data.typists.length > 0 && (
        <div ref={compose_ref} className="flex m-3 space-x-1 mb-6">
          {typing_data.typists.map((member) => {
            return (
              <Avatar
                id="typing"
                key={member}
                className="w-[35px] h-[35px] mt- 2"
              >
                <AvatarImage src={`/uploads/avatar/${member}`} />
                <AvatarFallback>{member.substring(0, 2)}</AvatarFallback>
              </Avatar>
            );
          })}
          <div className="bg-slate-200 dark:bg-slate-900 rounded-md p-1 px-2 text-center">
            ...
          </div>
        </div>
      )}
    </div>
  );
}
