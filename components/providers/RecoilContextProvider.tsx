"use client";
import { RecoilRoot } from "recoil";

export default function RecoilContextProvider({
  children,
}: Readonly<{ children: JSX.Element }>) {
  return <RecoilRoot>{children}</RecoilRoot>;
}
