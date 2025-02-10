import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import React from "react";

import "./globals.css";
import { cn } from "../lib/utils";

import { AuthProvider } from "@/components/Provider";
import RecoilContextProvider from "@/components/providers/RecoilContextProvider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "chat | Open source chat application",
  description: "A chat application powered by redis pub/sub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <RecoilContextProvider>
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable,
          )}
        >
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </body>
      </RecoilContextProvider>
    </html>
  );
}
