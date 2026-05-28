import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "accent";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-[var(--muted)] text-[var(--muted-foreground)]",
  primary: "bg-orange-600/20 text-orange-400 border border-orange-600/30",
  success: "bg-green-600/20 text-green-400 border border-green-600/30",
  warning: "bg-amber-600/20 text-amber-400 border border-amber-600/30",
  danger: "bg-red-600/20 text-red-400 border border-red-600/30",
  accent: "bg-cyan-600/20 text-cyan-400 border border-cyan-600/30",
};

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
