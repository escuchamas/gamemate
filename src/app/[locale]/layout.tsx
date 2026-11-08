import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { CookieBanner } from "@/components/cookie-banner";
import { JsonLd } from "@/components/json-ld";
import { Chakra_Petch, Rubik } from "next/font/google";

// Fuentes de la marca para toda la web: Chakra Petch (titulares) y Rubik (texto)
const display = Chakra_Petch({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-display", display: "swap" });
const body = Rubik({ subsets: ["latin"], variable: "--font-body", display: "swap" });

const BASE = "https://gamemate.es";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === "es";

  const title = isEs
    ? "GameMate – Encuentra tu equipo de juego | Minecraft, LoL, Project Zomboid"
    : "GameMate – Find your gaming crew | Minecraft, LoL, Project Zomboid";

  const description = isEs
    ? "Encuentra compañeros de juego a tu nivel en Minecraft, League of Legends y Project Zomboid. Sin tóxicos, sin hackers, sin gente que se va a las dos semanas. Gratis."
    : "Find gaming partners at your skill level for Minecraft, League of Legends and Project Zomboid. No toxicity, no hackers. Free forever.";

  return {
    title: {
      default: title,
      template: `%s | GameMate`,
    },
    description,
    metadataBase: new URL(BASE),
    // canonical/hreflang se definen en cada página (localeAlternates): si se pusieran
    // aquí, todas las páginas heredarían el canonical de la home.
    openGraph: {
      type: "website",
      locale: isEs ? "es_ES" : "en_US",
      alternateLocale: isEs ? "en_US" : "es_ES",
      url: `${BASE}/${locale}`,
      siteName: "GameMate",
      title,
      description,
      images: [
        {
          url: `${BASE}/logo%20redondo.png`,
          width: 512,
          height: 512,
          alt: "GameMate – Encuentra tu equipo de juego",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BASE}/logo%20redondo.png`],
    },
    icons: {
      icon: [
        { url: "/apple-icon.png", type: "image/png" },
        { url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
      ],
      apple: [
        { url: "/apple-icon.png" },
        { url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
      ],
      shortcut: "/apple-icon.png",
    },
    manifest: "/manifest.json",
    other: {
      "msapplication-TileColor": "#0f0f13",
      "msapplication-TileImage": "/ms-icon-144x144.png",
      "theme-color": "#0f0f13",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GameMate",
    url: BASE,
    description: locale === "es"
      ? "Encuentra compañeros de juego a tu nivel en Minecraft, League of Legends y Project Zomboid. Sin tóxicos, gratis."
      : "Find gaming partners at your skill level for Minecraft, League of Legends and Project Zomboid. Free forever.",
    inLanguage: ["es", "en"],
    publisher: {
      "@type": "Organization",
      name: "GameMate",
      logo: { "@type": "ImageObject", url: `${BASE}/logo%20redondo.png` },
      url: BASE,
    },
  };

  // Los datos estructurados van en <body>: un <script> escrito a mano en <head>
  // provocaba un aviso de hidratación en React.
  return (
    <html lang={locale} className={`h-full ${display.variable} ${body.variable}`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <JsonLd data={jsonLd} />
        <NextIntlClientProvider messages={messages}>
          {children}
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
