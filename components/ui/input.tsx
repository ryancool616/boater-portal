import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400",
        className,
      )}
      {...props}
    />
  );
}
