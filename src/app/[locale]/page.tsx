import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Chakra_Petch, Rubik } from "next/font/google";
import { Link } from "@/i18n/navigation";
import { BADGE_INFO } from "@/lib/constants";
import { Footer } from "@/components/layout/footer";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { PartiesCarouselSection } from "@/components/landing/parties-carousel-section";
import { LobbyHero } from "@/components/landing/lobby-hero";
import type { Metadata } from "next";
import { localeAlternates } from "@/lib/seo";

const display = Chakra_Petch({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-display", display: "swap" });
const body = Rubik({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === "es";
  return {
    title: isEs
      ? "GameMate: compañeros para Minecraft, LoL y Project Zomboid"
      : "GameMate: teammates for Minecraft, LoL and Project Zomboid",
    description: isEs
      ? "Busca jugadores de tu nivel para Minecraft, League of Legends y Project Zomboid: parties con normas, reputación y servidores en español. Gratis."
      : "Find players at your skill level for Minecraft, League of Legends and Project Zomboid. Verified profiles, reputation system and organized parties. Free forever.",
    alternates: localeAlternates(locale, ""),
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

const GAMES = [
  { key: "minecraft", href: "/minecraft", img: "/games/biome-minecraft.webp", title: "Minecraft" },
  { key: "lol", href: "/league-of-legends", img: "/games/lol.jpg", title: "League of Legends" },
  { key: "pz", href: "/project-zomboid", img: "/games/PZ.jpg", title: "Project Zomboid" },
] as const;

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (session) redirect(`/${locale}/parties`);

  const t = await getTranslations("home");
  const tNav = await getTranslations("nav");

  return (
    <div className={`home ${display.variable} ${body.variable} min-h-screen flex flex-col`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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

      <main className="flex-1">
        {/* Hero: titular + sala de espera */}
        <section className="home-hero">
          <div className="home-hero-copy">
            <h1 className="home-h1">{t("hero.title")}</h1>
            <p className="home-lead">{t("hero.lead")}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/register" className="home-btn">{t("signupFree")}</Link>
              <Link href="/servers" className="home-btn home-btn--ghost">{t("hero.servers")}</Link>
            </div>
            <p className="home-fine">{t("hero.fine")}</p>
          </div>
          <LobbyHero />
        </section>

        {/* Cómo funciona: es una secuencia real, por eso va numerada */}
        <section className="home-section">
          <h2 className="home-h2">{t("steps.title")}</h2>
          <ol className="home-steps">
            {(["profile", "party", "reputation"] as const).map((k, i) => (
              <li key={k} className="home-step">
                <span className="home-step-n" aria-hidden>{i + 1}</span>
                <h3 className="home-h3">{t(`steps.${k}.title`)}</h3>
                <p className="home-p">{t(`steps.${k}.desc`)}</p>
                {k === "reputation" && (
                  <p className="home-badges">
                    {Object.values(BADGE_INFO).slice(0, 6).map((b) => (
                      <span key={b.label} className="home-badge">{b.emoji} {b.label}</span>
                    ))}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>

        {/* Juegos: enlazan a las páginas SEO de cada juego */}
        <section className="home-section">
          <h2 className="home-h2">{t("games.title")}</h2>
          <div className="home-games">
            {GAMES.map((g) => (
              <Link key={g.key} href={g.href} className="home-game">
                <img src={g.img} alt={g.title} width={240} height={128} className="home-game-img" loading="lazy" />
                <div className="home-game-body">
                  <h3 className="home-h3">{g.title}</h3>
                  <p className="home-p">{t(`games.${g.key}`)}</p>
                  <span className="home-game-cta">{t("games.cta", { game: g.title })}</span>
                </div>
              </Link>
            ))}
          </div>
          <p className="home-servers-note">
            {t("serversNote")}{" "}
            <Link href="/publicar-servidor" className="home-inline-link">{t("serversNoteLink")}</Link>
          </p>
        </section>
      </main>

      <PartiesCarouselSection />
      <Footer />
    </div>
  );
}
