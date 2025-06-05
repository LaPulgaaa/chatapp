'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRecoilValueLoadable } from "recoil";

import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { fetch_search_results } from "@/lib/store/selector/fetch_search_results";
import type { ChatSearchResult, DirectMessageSearchResult, ProfileSearchResult } from "@/packages/valibot";
import { create_timestamp } from "@/util/date";

export default function Explorer({ params }: { params: { slug: string } }) {
  const query = params.slug;

  const resultState = useRecoilValueLoadable(fetch_search_results({ query }));

  return(
    resultState.state === "hasValue" ? 
    <>
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">{`Search results for "${query}"...`}</h4>
      <ProfileSearchResults profiles={resultState.getValue().profile}/>
      <DirectMessageSearchResults dms={resultState.getValue().dm}/>
      <ChatMessageSearchResults chats={resultState.getValue().chat}/>
    </> : 
    (
      resultState.state === "loading" ? 
      <div>Loading results...</div> : 
      <div>Something wrong happened</div>
    )
  )
}


function ProfileSearchResults({profiles}:{ profiles: ProfileSearchResult}){
  const router = useRouter();
  return (
    <div>
      {
        profiles.map((profile) => {
          return (
            <div 
            key={profile.id} 
            className="flex flex-row space-x-2 dark:bg-slate-900 bg-slate-200 hover:dark:bg-slate-800 hover:bg-slate-300 p-2 rounded-sm cursor-pointer m-2"
            onClick={() => {
                router.push(`/dm/${profile.username}`);
            }}
            >
                <Avatar className="mr-1">
                    <AvatarImage src={profile.avatarurl ?? ""} />
                    <AvatarFallback>{profile.username.substring(0,2)}</AvatarFallback>
                </Avatar>
                <div className="mx-1 px-1">
                    <div>{profile.name || profile.username}</div>
                    <div className="italic text-muted-foreground truncate w-[124px] text-[15px]">
                    {`@${profile.username}`}
                    </div>
                </div>
            </div>
          )
        })
      }
    </div>
  )
}

function DirectMessageSearchResults({dms}:{dms: DirectMessageSearchResult}){
  const router = useRouter();
  const session = useSession();

  return (
    <div>
      {
        session.status === "authenticated" && dms.map((dm) => {
          const timestamp = create_timestamp(dm.createdAt);
          const slug = dm.toId !== session.data.username ? dm.toId : dm.fromId;
          const is_send_by_me = dm.fromId === session.data.username;
          const rendered_content = is_send_by_me ? `You: ${dm.content}` : dm.content;
          return (
            <div 
            key={dm.id}
            className="flex flex-row space-x-2 dark:bg-slate-900 bg-slate-200 hover:dark:bg-slate-800 hover:bg-slate-300 p-2 rounded-sm cursor-pointer m-2"
            onClick={() => router.push(`/dm/${slug}/near/${dm.id}`)}
            >
              <div className="w-full flex flex-col space-y-2">
                <div className="flex justify-between">
                  <Link href={`/dm/${slug}`} className="text-muted-foreground text-sm hover:text-black hover:dark:text-white">{`${slug}`}</Link>
                  <p className="text-muted-foreground text-sm">{timestamp}</p>
                </div>
                <div>
                  <p className="leading-7 [&:not(:first-child)]:mt-6 w-7/8 italic text-wrap break-all">
                    {rendered_content}
                  </p>
                </div>
              </div>
            </div>
          )
        })
      }
    </div>
  )
}

function ChatMessageSearchResults({chats}:{chats: ChatSearchResult}){
  const session = useSession();
  const router = useRouter();
  return (
    <div>
      {
        session.status === "authenticated" && chats.map((chat) => {
          const timestamp = create_timestamp(chat.createdAt);
          const is_send_by_me = session.data.username === chat.sender;
          const rendered_content = is_send_by_me ? `You: ${chat.content}` : `${chat.sender}: ${chat.content}`;
          return(
            <div key={chat.id}
            onClick={() => router.push(`/chat/${chat.chatId}/near/${chat.id}`)}
            className="dark:bg-slate-900 bg-slate-200 hover:dark:bg-slate-800 hover:bg-slate-300 p-2 rounded-sm cursor-pointer m-2"
            >
              <div className="w-full flex flex-col space-y-2 ease-in-out transition duration-300">
                <div className="flex justify-between">
                  <Link href={`/chat/${chat.chatId}`} className="text-muted-foreground text-sm hover:text-black hover:dark:text-white">{`${chat.chatName}`}</Link>
                  <p className="text-muted-foreground text-sm">{timestamp}</p>
                </div>
                <div>
                  <p className="leading-7 [&:not(:first-child)]:mt-6 w-7/8 italic text-wrap break-all">
                    {rendered_content}
                  </p>
                </div>
              </div>
            </div>
          )
        })
      }
    </div>
  )
}