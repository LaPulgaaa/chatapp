"use client";
import React from "react";
import { RecoilRoot } from "recoil";

export default function RecoilContextProvider({
  children,
}: Readonly<{ children: React.JSX.Element }>) {
  return <RecoilRoot>{children}</RecoilRoot>;
}
