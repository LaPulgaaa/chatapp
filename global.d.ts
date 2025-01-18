import type { ElementType } from "react";

declare global{
    interface Element {
        style: Record<string,string>
    }
}