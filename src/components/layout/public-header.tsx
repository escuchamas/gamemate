import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";

// Cabecera de las páginas públicas (portada, juegos, servidores, Qué es GameMate).
// No lee la sesión para que esas páginas puedan servirse ya generadas.
export async function PublicHeader() {
  const tNav = await getTranslations("nav");
  const t = await getTranslations("home");
  return (
    <header className="home-header">
      <Link href="/" className="shrink-0">
        <img src="/logo.png" alt="GameMate" className="h-6 sm:h-8" />
      </Link>
      <nav className="flex items-center gap-2.5 sm:gap-4">
        <LocaleSwitcher />
        <Link href="/login" className="home-link">{tNav("login")}</Link>
        <Link href="/register" className="home-btn home-btn--small">{t("signup")}</Link>
      </nav>
    </header>
  );
}
