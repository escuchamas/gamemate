"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const otherLocale = routing.locales.find((l) => l !== locale)!;

  const toggle = () => {
    router.replace(pathname, { locale: otherLocale });
  };

  return (
    <button
      onClick={toggle}
      className="px-2 py-1 text-xs rounded-lg border border-[var(--card-border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-indigo-500/50 transition-colors font-mono uppercase"
      title={`Switch to ${otherLocale === "en" ? "English" : "Español"}`}
    >
      {locale}
    </button>
  );
}
