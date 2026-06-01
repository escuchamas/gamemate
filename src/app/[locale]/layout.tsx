import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { CookieBanner } from "@/components/cookie-banner";

const BASE = "https://gamemate.es";

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
    alternates: {
      canonical: `${BASE}/${locale}`,
      languages: {
        "es": `${BASE}/es`,
        "en": `${BASE}/en`,
        "x-default": `${BASE}/es`,
      },
    },
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
          url: `${BASE}/logo.png`,
          width: 800,
          height: 200,
          alt: "GameMate – Encuentra tu equipo de juego",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BASE}/logo.png`],
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

  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          {children}
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
