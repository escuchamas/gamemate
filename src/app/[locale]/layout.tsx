import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { CookieBanner } from "@/components/cookie-banner";

export const metadata: Metadata = {
  title: "GameMate – Find your gaming crew",
  description:
    "Connect with players at your skill level for Minecraft, Project Zomboid and more.",
  manifest: "/manifest.json",
  other: {
    "msapplication-TileColor": "#0f0f13",
    "msapplication-TileImage": "/ms-icon-144x144.png",
    "theme-color": "#0f0f13",
  },
};

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
    <html lang={locale} className="h-full">
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          {children}
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
