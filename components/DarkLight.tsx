"use client";

import { Moon, Sun, Laptop, LucideProps } from "lucide-react";
import { useTheme } from "next-themes";
import React, {
  ForwardRefExoticComponent,
  RefAttributes,
  useMemo,
} from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Button } from "./ui/button";

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
      <TooltipTrigger asChild>
        <Button
          variant={"secondary"}
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
