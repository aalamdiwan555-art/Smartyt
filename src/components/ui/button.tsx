import * as React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
      variant === "default" && "bg-primary text-primary-foreground shadow-sm hover:-translate-y-0.5 hover:shadow-md",
      variant === "outline" && "border border-border bg-card text-foreground hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/5",
      variant === "ghost" && "text-muted-foreground hover:bg-muted hover:text-foreground",
      variant === "secondary" && "bg-secondary text-secondary-foreground hover:-translate-y-0.5",
      variant === "destructive" && "bg-destructive text-destructive-foreground hover:opacity-90",
      size === "default" && "h-10 px-4 py-2",
      size === "sm" && "h-8 px-3 text-xs",
      size === "lg" && "h-12 px-6",
      size === "icon" && "h-10 w-10",
      className
    );
    if (asChild) return <Slot ref={ref} className={classes} {...props}>{children}</Slot>;
    return <button
      ref={ref}
      className={classes}
      {...props}
    >{children}</button>;
  }
);
Button.displayName = "Button";