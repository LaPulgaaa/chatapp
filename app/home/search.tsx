import Fuse from "fuse.js";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";
import { useMemo, useRef, useState } from "react";
import { useRecoilValueLoadable } from "recoil";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { direct_msg_state } from "@/lib/store/atom/dm";
import { subscribed_chats_state } from "@/lib/store/atom/subscribed_chats_state";

function SearchBox({
  isMouseOverResults,
  search,
  setSearch,
  setFocus,
}: {
  isMouseOverResults: boolean;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  setFocus: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();

  const search_ref = useRef<HTMLInputElement | null>(null);

  useKeyboardShortcut("ctrl+k", () => {
    const search_elem = search_ref.current;

    if (search_elem !== null) {
      search_elem.focus();
    }

    setFocus(true);
  });

  function handle_click() {
    setFocus(false);
    router.push(`/home/search/${search}`);
  }

  return (
    <div className="w-full flex justify-end">
      <div className="w-full flex space-x-2 justify-end pr-2 border-2 rounded-2xl">
        <Input
          ref={search_ref}
          className="border-none w-full outline-none mx-1"
          placeholder="Search.."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => {
            if (isMouseOverResults === true) return;

            setFocus(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handle_click();
          }}
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className="dark:bg-slate-800 bg-slate-300 px-2 py-1 rounded-sm">{`ctrl+k`}</span>
            </TooltipTrigger>
            <TooltipContent>
              <span>{`Press ctrl+k to launch search box`}</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

function DirectMessageSearchResults({ query }: { query: string }) {
  const router = useRouter();

  const dmState = useRecoilValueLoadable(direct_msg_state);

  const matched_results = useMemo(() => {
    if (dmState.state !== "hasValue" || query.length <= 2) return [];

    const dms = dmState.getValue();
    const fuse = new Fuse(dms, {
      isCaseSensitive: false,
      includeScore: true,
      keys: ["to.username", "to.name", "to.about"],
    });

    return fuse.search(query).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }, [query, dmState]);

  return (
    <div className="px-2">
      {matched_results.map(({ item }) => {
        return (
          <div
            key={item.id}
            className="w-full flex space-x-4 m-2 bg-slate-950 cursor-pointer"
            onClick={() => {
              router.push(`/dm/${item.to.username}`);
            }}
          >
            <Avatar className="mr-1">
              <AvatarImage src={item.to.avatarurl ?? ""} />
              <AvatarFallback>
                {item.to.username.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="mx-1 px-1">
              <div>{item.to.name || item.to.username}</div>
              <div className="italic text-muted-foreground truncate w-[124px] text-[15px]">
                {`@${item.to.username}`}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GroupChatSearchResults({ query }: { query: string }) {
  const router = useRouter();
  const roomState = useRecoilValueLoadable(subscribed_chats_state);

  const matched_results = useMemo(() => {
    if (roomState.state !== "hasValue" || query.length <= 2) return [];

    const rooms = roomState.getValue();

    const fuse = new Fuse(rooms, {
      isCaseSensitive: false,
      includeScore: true,
      keys: [
        { name: "name", getFn: (room) => room.name },
        { name: "description", getFn: (room) => room.description },
      ],
    });

    return fuse.search(query).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }, [query, roomState]);

  return (
    <div className="px-2">
      {matched_results.map(({ item }) => {
        return (
          <div
            onClick={() => {
              router.push(`/chat/${item.id}`);
            }}
            key={item.id}
            className="w-full flex space-x-4 m-2 bg-slate-950 cursor-pointer"
          >
            <Avatar className="mr-1">
              <AvatarImage src={""} />
              <AvatarFallback>{item.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="mx-1 px-1">
              <div>{item.name}</div>
              <div className="italic text-muted-foreground truncate w-[124px] text-[15px]">
                {item.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Search() {
  const router = useRouter();

  const [search, setSearch] = useState<string>("");
  const [focus, setFocus] = useState<boolean>(false);
  const [overResults, setOverResults] = useState<boolean>(false);

  function handle_click() {
    setFocus(false);
    router.push(`/home/search/${search}`);
  }

  return (
    <div className="flex justify-end items-center shadow z-10">
      <div className="relative w-full md:w-1/2 space-y-2 mx-4">
        <SearchBox
          search={search}
          setSearch={setSearch}
          setFocus={setFocus}
          isMouseOverResults={overResults}
        />
        {focus && search.length > 2 && (
          <div
            onMouseEnter={() => setOverResults(true)}
            onMouseLeave={() => setOverResults(false)}
            className="bg-slate-950 absolute z-50 shadow w-full rounded-md border-2"
          >
            <div
              onClick={handle_click}
              className="flex space-x-2 py-4 px-2 mx-2 cursor-pointer"
            >
              <SearchIcon />
              <span>{`Search for ${search}`}</span>
            </div>
            <DirectMessageSearchResults query={search} />
            <GroupChatSearchResults query={search} />
          </div>
        )}
      </div>
    </div>
  );
}
