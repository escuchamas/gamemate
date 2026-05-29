import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GAME_ICONS, GAME_LABELS, BADGE_INFO } from "@/lib/constants";

export default async function LandingPage() {
  const session = await auth();
  if (session) redirect("/parties");

  const t = await getTranslations("landing");
  const tNav = await getTranslations("nav");

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <img src="/logo.png" alt="GameMate" className="h-8" />
        <div className="flex gap-3">
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
        <div className="flex flex-col items-center gap-6">
          <img src="/logo.png" alt="GameMate" className="w-72 sm:w-96 drop-shadow-2xl" />
          <div className="flex gap-3 text-4xl">
            <span>{GAME_ICONS.MINECRAFT}</span>
            <span>{GAME_ICONS.PROJECT_ZOMBOID}</span>
          </div>
        </div>

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
              href="/parties"
              className="px-8 py-3 rounded-xl bg-[var(--card)] border border-[var(--card-border)] text-white font-semibold hover:bg-[var(--muted)] transition-colors text-lg"
            >
              {t("browseParties")}
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full mt-8">
          {(
            [
              { emoji: "🎯", key: "level" },
              { emoji: "📜", key: "rules" },
              { emoji: "⭐", key: "reputation" },
            ] as const
          ).map((f) => (
            <div
              key={f.key}
              className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5 text-left"
            >
              <div className="text-3xl mb-2">{f.emoji}</div>
              <h3 className="font-semibold text-white mb-1">
                {t(`features.${f.key}.title`)}
              </h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                {t(`features.${f.key}.desc`)}
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
                className="px-3 py-1.5 rounded-full bg-[var(--card)] border border-[var(--card-border)] text-sm text-white flex items-center gap-1.5"
              >
                <span>{badge.emoji}</span>
                <span>{badge.label}</span>
              </span>
            ))}
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-2">
            {t("badgesNote")}
          </p>
        </div>

        {/* Games */}
        <div className="flex gap-6 text-center">
          {(["MINECRAFT", "PROJECT_ZOMBOID"] as const).map((g) => (
            <div key={g} className="flex flex-col items-center gap-1">
              <span className="text-4xl">{GAME_ICONS[g]}</span>
              <span className="text-sm text-[var(--muted-foreground)]">
                {GAME_LABELS[g]}
              </span>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-[var(--muted-foreground)]">
        {t("footer")}
      </footer>
    </div>
  );
}
