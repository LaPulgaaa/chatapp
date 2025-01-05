import { SidebarProvider } from "@/components/ui/sidebar"
import ChatPanel from "./chat_panel";
import Connect from "./msg_connect";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
    <ChatPanel/>
      <main className="flex w-full">
        <div className="w-full">{children}</div>
      </main>
      <Connect/>
    </SidebarProvider>
  )
}
