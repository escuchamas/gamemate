"use client";

import { Link, usePathname } from "@/i18n/navigation";
import type { ComponentProps } from "react";

// Enlace de navegación que se marca cuando estás en esa sección
export function NavLink({
  href,
  exact = false,
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & { href: string; exact?: boolean }) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative px-2.5 py-1.5 text-sm rounded-lg transition-colors ${
        active
          ? "text-white bg-[var(--card)] shadow-[inset_0_-2px_0_var(--accent)]"
          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
      } ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
