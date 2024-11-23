'use client'
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowRightCircleIcon, ArrowUpRight } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const session = useSession();
  const router = useRouter();

  useEffect(()=>{
    if(session.status === "authenticated")
      router.push("/home");
  },[session.status,router])
  return (
    <div>
      <Navbar/>
      <div className="grid justify-items-center m-48">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-7xl">
          chat.varuncodes.com
        </h1>
        <h2 className="scroll-m-20 border-b pb-2 m-12 text-3xl font-semibold tracking-tight first:mt-0 italic">
          Open Source Chat Application for better convos.
        </h2>
        <div className="flex px-4">
        <Link href={"/signup"}>
          <Button variant={"outline"} className="mx-4">
            <ArrowUpRight className="mb-1"/>
            <span className="ml-1">Get Started</span>
          </Button>
        </Link>
        <Link href={"https://github.com/LaPulgaaa/chatapp"}>
          <Button variant={"secondary"}>
            Checkout code
          </Button>
        </Link>
        </div>
      </div>
    </div>
    
  );
}
