"use client";

import { Link, usePathname } from "@/i18n/navigation";

const TABS = [
  { href: "/admin", label: "Mensajes", exact: true },
  { href: "/admin/suggestions", label: "Peticiones" },
  { href: "/admin/users", label: "Usuarios" },
  { href: "/admin/parties", label: "Parties" },
  { href: "/admin/reports", label: "Reportes" },
];

export function AdminNav({ unreadMessages, openReports }: { unreadMessages: number; openReports: number }) {
  const pathname = usePathname();
  const counts: Record<string, number> = { "/admin": unreadMessages, "/admin/reports": openReports };

  return (
    <nav className="flex gap-1 overflow-x-auto -mb-px" aria-label="Secciones del panel">
      {TABS.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        const n = counts[href] ?? 0;
        return (
          <Link
            key={href}
            href={href as "/admin"}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2 whitespace-nowrap px-3 py-2.5 text-sm border-b-2 transition-colors ${
              active
                ? "border-[var(--accent)] text-white font-medium"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {label}
            {n > 0 && (
              <span className="min-w-5 h-5 px-1.5 rounded-full bg-[var(--primary)] text-white text-[11px] font-semibold grid place-items-center">
                {n}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
