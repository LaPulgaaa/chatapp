'use client'
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowRightCircleIcon } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Navbar/>
      <div className="grid justify-items-center m-48">
        <h1 className="italic scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-7xl">
          Chiller's Chat
        </h1>
        <h2 className="scroll-m-20 border-b pb-2 m-12 text-3xl font-semibold tracking-tight first:mt-0 hover:italic">
          Cause distance should never be a problem.
        </h2>
        <div className="flex px-4">
        <Link href={"/signup"}>
          <Button variant={"outline"} className="mx-4">
            Get Started
            <ArrowRightCircleIcon className="hidden ml-2 hover:visible"/>
          </Button>
        </Link>
        <Button variant={"secondary"}>
          Learn more
        </Button>
        </div>
      </div>
    </div>
    
  );
}
