"use client";

import React from "react";

import Connect from "./connect";
import { Search } from "./search";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import CandleSidebar from "@/components/candleSidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div>
        <Navbar />
        <div className="flex divide-x h-full ml-4 my-4 mr-12 pb-24">
          <div>
            <CandleSidebar />
            <Sidebar />
          </div>
          <div className="relative w-5/6 mr-4 pt-2 space-y-4">
            <Search/>
            <div className={`ml-4`}>{children}</div>
          </div>
        </div>
      </div>
      <Connect />
    </div>
  );
}
