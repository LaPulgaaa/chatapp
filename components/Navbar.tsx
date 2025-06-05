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
      <Link href="/">
        <h2>chat</h2>
      </Link>
      <div className="flex justify-between">
        {session.status === "authenticated" && (
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
        )}
        {session.status === "unauthenticated" && (
          <div>
            <Link href={"/login"}>
              <Button variant="ghost">LogIn</Button>
            </Link>
            <Link href={"/signup"}>
              <Button className="px-2 mx-6" variant={"ghost"}>
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
