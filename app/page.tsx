"use client"

import { Button } from "@/components/ui/button";
import { ArrowRightCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
export default function Home() {
  const router=useRouter()
  
  return (
    <div className="grid justify-items-center m-48">
      <h1 className="italic scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Chiller's Chat
      </h1>
      <h2 className="scroll-m-20 border-b pb-2 m-12 text-3xl font-semibold tracking-tight first:mt-0">
        Cause distance should never be a problem.
      </h2>
      <div className="flex px-4">
      <Button variant={"outline"} className="mx-4"
      onClick={()=>{
        router.push("/signup")
      }}
      >
        Get Started
        <ArrowRightCircleIcon className="hidden ml-2 hover:visible"/>
      </Button>
      <Button variant={"secondary"}>
        Learn more
      </Button>
      </div>
    </div>
  );
}
