"use client";

import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-semibold rounded-[10px] transition-all [font-family:var(--font-display),var(--font-body),sans-serif] tracking-[0.01em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

    const variants = {
      primary:
        "bg-[var(--primary)] text-white shadow-[0_3px_0_var(--primary-edge)] hover:bg-[var(--primary-hover)] active:translate-y-[3px] active:shadow-none",
      secondary:
        "bg-transparent text-[var(--foreground)] shadow-[inset_0_0_0_1.5px_var(--card-border)] hover:bg-[var(--card)]",
      ghost:
        "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]",
      danger: "bg-red-600 text-white shadow-[0_3px_0_#991b1b] hover:bg-red-500 active:translate-y-[3px] active:shadow-none",
      outline:
        "text-[var(--primary)] shadow-[inset_0_0_0_1.5px_var(--primary)] hover:bg-[var(--primary)]/10",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-[1.0625rem]",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
