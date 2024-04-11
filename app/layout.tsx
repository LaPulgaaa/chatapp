import type { Metadata } from "next";

import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import RecoilContextProvider from "@/components/providers/RecoilContextProvider";
import { ThemeProvider } from "@/components/theme-provider";
// const inter = Inter({ subsets: ["latin"] });
import { cn } from "../lib/utils"
 
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})



export const metadata: Metadata = {
  title: "chat.city",
  description: "chat like there is no tommorow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <RecoilContextProvider>
        <body className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable
          )}>
            <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            >
           
            {children}
            </ThemeProvider>
            </body>
        </RecoilContextProvider>
      
    </html>
  );
}
