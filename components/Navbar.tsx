"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import * as React from "react";

import { ToggleMode } from "./DarkLight";
import { Button } from "./ui/button";

export default function Navbar() {
  const session = useSession();
  return (
    <div className="p-4 font-bold flex justify-between cursor-pointer mx-4 mt-1">
      <Link className="" href="/">
        <Button className="font-bold hover:bg-transparent" variant={"ghost"}>chat</Button>
      </Link>
      <div className="flex flex-row justify-between space-x-2">
        {session.status === "authenticated" ? (
          <Link href={"/"}>
            <Button
              onClick={async () => {
                await signOut({ callbackUrl: "/" });
              }}
              className="mx-2"
              variant={"ghost"}
            >
              Logout
            </Button>
          </Link>
        ) : (
          <div className="flex flex-row">
            <Link href={"/login"}>
              <Button variant="ghost">LogIn</Button>
            </Link>
            <Link href={"/signup"}>
              <Button className="" variant={"ghost"}>
                Signup
              </Button>
            </Link>
          </div>
        )}
        <ToggleMode />
      </div>
    </div>
  );
}
