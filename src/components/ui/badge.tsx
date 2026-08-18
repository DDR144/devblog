import * as React from "react";
import { cn } from "@/lib/utils";

function badgeVariants({ variant, className }: { variant?: "default" | "secondary" | "outline"; className?: string }) {
  const base = "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const variants: Record<string, string> = {
    default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "text-foreground",
  };
  return cn(base, variants[variant ?? "default"], className);
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline";
}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={badgeVariants({ variant, className })} {...props} />;
}

export { Badge };
