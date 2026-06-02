import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--card-border)] bg-[var(--background)] mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <img src="/icon.png" alt="GameMate" className="h-7 w-7 rounded-full" />
              <span className="font-semibold text-white">GameMate</span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">{t("tagline")}</p>
          </div>

          {/* Links principales */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider mb-1">
              {t("platform")}
            </p>
            <Link href="/contact" className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors">
              {t("contact")}
            </Link>
            <Link href="/sponsorship" className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors">
              {t("sponsorship")}
            </Link>
            <Link href="/donations" className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors">
              {t("donations")}
            </Link>
            <Link href="/suggestions" className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors">
              {t("suggestions")}
            </Link>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider mb-1">
              {t("legal")}
            </p>
            <Link href="/terms" className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors">
              {t("terms")}
            </Link>
            <Link href="/privacy" className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors">
              {t("privacy")}
            </Link>
            <Link href="/cookies" className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors">
              {t("cookies")}
            </Link>
            <Link href="/legal" className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors">
              {t("legalNotice")}
            </Link>
          </div>
        </div>

        <div className="border-t border-[var(--card-border)] mt-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[var(--muted-foreground)]">{t("rights", { year })}</p>
          <p className="text-xs text-[var(--muted-foreground)]">{t("madeWith")}</p>
        </div>
      </div>
    </footer>
  );
}
