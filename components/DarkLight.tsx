"use client";

import type { LucideProps } from "lucide-react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type {
  ForwardRefExoticComponent,
  RefAttributes} from "react";
import React, {
  useMemo,
} from "react";

import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

type NextThemeAndIcon = {
  theme: "light" | "dark" | "system";
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
};

export function ToggleMode() {
  const { setTheme, theme } = useTheme();

  const nextThemeIcon: NextThemeAndIcon = useMemo(() => {
    switch (theme) {
      case "light":
        return {
          theme: "dark" as const,
          icon: Moon,
        };
      case "dark":
        return {
          theme: "system" as const,
          icon: Laptop,
        };
      default:
        return {
          theme: "light" as const,
          icon: Sun,
        };
    }
  }, [theme]);

  return (
    <TooltipProvider>
      <Tooltip>
      <TooltipTrigger className="p-2" asChild>
        <Button
          variant={"outline"}
          size={"icon"}
          onClick={() => setTheme(nextThemeIcon.theme)}
        >
          <nextThemeIcon.icon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{nextThemeIcon.theme}</TooltipContent>
      </Tooltip>
      
    </TooltipProvider>
  );
}
