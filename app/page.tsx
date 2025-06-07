"use client";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLayoutEffect } from "react";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

export default function Home() {
  const session = useSession();
  const router = useRouter();

  useLayoutEffect(() => {
    if (session.status === "authenticated") router.push("/home");
  }, [session.status, router]);
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-2">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-7xl">
          chat.varuncodes.com
        </h1>
        <p className="truncate flex justify-center pb-2 italic">
          Open Source Chat Application for better convos.
        </p>
        <div className="flex px-4">
          <Link href={"/signup"}>
            <Button variant={"outline"} className="mx-4">
              <ArrowUpRight className="mb-1" />
              <span className="ml-1">Get Started</span>
            </Button>
          </Link>
          <Link href={"https://github.com/LaPulgaaa/chatapp"}>
            <Button variant={"secondary"}>Checkout code</Button>
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
