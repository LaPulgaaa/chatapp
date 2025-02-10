"use client";

import { HomeIcon } from "lucide-react";
import Link from "next/link";
import { useRecoilValueLoadable } from "recoil";

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { fetch_user_chats } from "@/lib/store/selector/fetch_chats";
import { fetch_dms } from "@/lib/store/selector/fetch_dms";

export default function ChatPanel() {
  const dms = useRecoilValueLoadable(fetch_dms);
  const chats = useRecoilValueLoadable(fetch_user_chats);

  return (
    <div>
      <AppSidebar>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href={`/home`}>
                  <HomeIcon />
                  <span className="pt-1">Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
          <SidebarGroupContent>
            {dms.state === "hasValue" ? (
              <SidebarMenu>
                {dms.getValue().map((dm) => {
                  return (
                    <SidebarMenuItem key={dm.id}>
                      <SidebarMenuButton asChild>
                        <Link href={`/dm/${dm.to.username}`}>
                          <span>{dm.to.username}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            ) : (
              <SidebarMenuSkeleton />
            )}
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            {chats.state === "hasValue" ? (
              <SidebarMenu>
                {chats.getValue().map((chat) => {
                  return (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton asChild>
                        <Link href={`/chat/${chat.id}`}>
                          <span>{chat.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            ) : (
              <SidebarMenuSkeleton />
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </AppSidebar>
    </div>
  );
}
