import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn("flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none transition-smooth placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50", className)}
      {...props}
    />
  )
);
Input.displayName = "Input";