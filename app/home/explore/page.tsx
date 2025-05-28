"use client";

import {
  MessageCircleIcon,
  SearchIcon,
  SearchXIcon,
  UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { search_by_username } from "./actions";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

type ProfileSearch = {
  username: string;
  avatarurl: string | null;
  about: string | null;
  name: string | null;
};

export default function Search() {
  const [search, setSearch] = useState<ProfileSearch[] | undefined>(undefined);
  const [query, setQuery] = useState<string>("");
  const session = useSession();
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (query.length < 3 || session.status !== "authenticated") {
      setSearch(undefined);
      return;
    }

    (async () => {
      const results = await search_by_username(
        query,
        session.data.username,
        session.data.user?.name,
      );
      setSearch(results);
    })();

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, session]);

  const isSearching = useMemo(() => {
    if (session.status === "authenticated" && query.length >= 3) return true;

    return false;
  }, [query, session]);

  function handleIconClick() {
    const search_box = searchRef.current;
    if (search_box !== null) {
      search_box.focus();
    }
  }

  return (
    <div className="flex flex-col my-6 mx-24">
      <div className="flex w-full rounded-md border-2">
        <SearchIcon
          onClick={handleIconClick}
          className="mt-2 mx-2 cursor-pointer"
        />
        <Input
          ref={searchRef}
          id="explore-search-box"
          className="w-full bg-slate-800"
          placeholder="Search by username or name"
          type="text"
          onChange={(e) => {
            setQuery(e.target.value);
          }}
        />
      </div>
      <div>
        {isSearching ? (
          search !== undefined ? (
            search.length > 0 ? (
              <SearchResults search_results={search} />
            ) : (
              <div className="w-full flex space-x-2 m-4">
                <SearchXIcon />
                <span>{`No search results for "${query}"`}</span>
              </div>
            )
          ) : (
            <ProfileSkelatons />
          )
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

function SearchResults({
  search_results,
}: {
  search_results: ProfileSearch[];
}) {
  const router = useRouter();
  return (
    <ScrollArea className="h-[720px] mt-2">
      {search_results.map((member) => {
        let initials = member.username.substring(0, 2);
        const names = member.name?.split(" ");
        if (names) {
          initials = names.map((name) => name.charAt(0)).join("");
        }
        return (
          <div
            key={member.username}
            className={`flex justify-between rounded-md p-1 w-full h-[74px] my-1 bg-slate-900`}
          >
            <div className="flex item-center p-2 w-4/5">
              <Avatar className="mr-1">
                <AvatarImage src={member.avatarurl ?? ""} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="mx-1 px-1">
                <div>{member.username}</div>
                <div className="italic text-muted-foreground truncate w-[124px] text-[15px]">
                  {member.about}
                </div>
              </div>
            </div>
            <div className="flex justify-end w-1/5 mt-2 space-x-2 mx-2">
              <Button
                onClick={() => {
                  router.push(`/dm/${member.username}`);
                }}
                size={"icon"}
                variant={"ghost"}
              >
                <MessageCircleIcon />
              </Button>
              <Button
                onClick={() => router.push(`/home/explore/${member.username}`)}
                size={"icon"}
                variant={"ghost"}
              >
                <UserIcon />
              </Button>
            </div>
            <br />
          </div>
        );
      })}
    </ScrollArea>
  );
}

function ProfileSkelatons() {
  return [0, 1].map((i) => {
    return (
      <div
        key={i}
        className="flex items-center space-x-4 py-2 px-4 border-2 border-slate-800 my-1 w-full"
      >
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[300px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
      </div>
    );
  });
}
