import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BADGE_INFO } from "@/lib/constants";
import { Footer } from "@/components/layout/footer";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { PartiesCarouselSection } from "@/components/landing/parties-carousel-section";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === "es";
  return {
    title: isEs
      ? "GameMate – Encuentra compañeros para Minecraft, LoL y Project Zomboid"
      : "GameMate – Find teammates for Minecraft, LoL and Project Zomboid",
    description: isEs
      ? "Busca jugadores a tu nivel para Minecraft, League of Legends y Project Zomboid. Perfiles verificados, sistema de reputación y parties organizadas. Gratis para siempre."
      : "Find players at your skill level for Minecraft, League of Legends and Project Zomboid. Verified profiles, reputation system and organized parties. Free forever.",
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "GameMate",
  url: "https://gamemate.es",
  description:
    "Plataforma de matchmaking para gamers. Encuentra compañeros de juego a tu nivel para Minecraft, League of Legends y Project Zomboid.",
  applicationCategory: "GameApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
    description: "Gratis para el jugador",
  },
  inLanguage: ["es", "en"],
};

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (session) redirect(`/${locale}/parties`);

  const t = await getTranslations("landing");
  const tNav = await getTranslations("nav");

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="GameMate" className="h-8" />
        </Link>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <Link
            href="/login"
            className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors"
          >
            {tNav("login")}
          </Link>
          <Link
            href="/register"
            className="px-4 py-1.5 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-500 transition-colors font-medium"
          >
            {tNav("register")}
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-8 py-16">
        <img src="/logo.png" alt="GameMate" className="w-72 sm:w-96 drop-shadow-2xl" />

        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
            {t("tagline")}
            <br />
            <span className="text-orange-400">{t("taglineHighlight")}</span>
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] mb-8">
            {t("descriptionBefore")}
            <strong className="text-white">{t("descriptionStrong")}</strong>
            {t("descriptionAfter")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-500 transition-colors text-lg"
            >
              {t("cta")}
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 rounded-xl bg-[var(--card)] border border-[var(--card-border)] text-white font-semibold hover:bg-[var(--muted)] transition-colors text-lg"
            >
              {tNav("login")}
            </Link>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">{t("freeForever")}</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full mt-8">
          {(["level", "rules", "reputation"] as const).map((key) => (
            <div
              key={key}
              className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5 text-left"
            >
              <h3 className="font-semibold text-white mb-1">
                {t(`features.${key}.title`)}
              </h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                {t(`features.${key}.desc`)}
              </p>
            </div>
          ))}
        </div>

        {/* Badges preview */}
        <div className="max-w-2xl w-full">
          <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-3">
            Badges
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {Object.values(BADGE_INFO).map((badge) => (
              <span
                key={badge.label}
                className="px-3 py-1.5 rounded-full bg-[var(--card)] border border-[var(--card-border)] text-sm text-white"
              >
                {badge.label}
              </span>
            ))}
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-2">
            {t("badgesNote")}
          </p>
        </div>


      </main>

      <PartiesCarouselSection />
      <Footer />
    </div>
  );
}
