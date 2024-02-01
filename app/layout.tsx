// import type { Metadata } from "next";
"use client"
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import {RecoilRoot} from 'recoil'
// const inter = Inter({ subsets: ["latin"] });
import { cn } from "../lib/utils"
 
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})



// export const metadata: Metadata = {
//   title: "xulip",
//   description: "chat like there is no tommorow.",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <RecoilRoot>
        <body className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable
          )}>
            <Navbar/>
            {children}
        </body>
      </RecoilRoot>
      
    </html>
  );
}
