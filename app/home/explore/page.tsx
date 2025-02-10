"use client";

import { MessageCircleIcon, SearchIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

import { search_by_username } from "./actions";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";


type ProfileSearch = {
  username: string;
  avatarurl: string | null;
  about: string | null;
  name: string | null;
};

export default function Search() {
  const [search, setSearch] = useState<ProfileSearch[]>([]);
  const [cred, setCred] = useState<string>("");
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (cred.length > 3 && session.status === "authenticated") {
      const search_user = async () => {
        const results = await search_by_username(
          cred,
          session.data.username,
          session.data.user?.name,
        );
        setSearch(results);
      };

      search_user();
    } else {
      setSearch([]);
    }
  }, [cred, session.data, session.status]);
  return (
    <div className="flex flex-col my-6 mx-24">
      <div className="flex w-full rounded-md border-2">
        <SearchIcon className="mt-2 mx-2" />
        <Input
          className="w-full"
          placeholder="Search by username or name"
          type="text"
          onChange={(e) => {
            setCred(e.target.value);
          }}
        />
      </div>
      <ScrollArea className="h-[720px] mt-2">
        {search.map((member) => {
          let initials = member.username.substring(0, 2);
          const names = member.name?.split(" ");
          if (names) {
            initials = names.map((name) => name.charAt(0)).join("");
          }
          return (
            <div
              key={member.username}
              className={`flex justify-between rounded-md p-1 w-full h-[72px] my-1 bg-slate-800`}
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
                  variant={"secondary"}
                >
                  <MessageCircleIcon />
                </Button>
                <Button
                  onClick={() =>
                    router.push(`/home/explore/${member.username}`)
                  }
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
    </div>
  );
}
