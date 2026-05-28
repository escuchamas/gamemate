import { auth, signOut } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { getInitials } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";

export async function Navbar() {
  const session = await auth();
  const t = await getTranslations("nav");

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[var(--background)]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg text-white hover:text-indigo-400 transition-colors"
        >
          <span className="text-2xl">🎮</span>
          <span>GameMate</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          <Link
            href="/parties"
            className="px-3 py-1.5 text-sm rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            {t("parties")}
          </Link>
          {session && (
            <Link
              href="/parties/new"
              className="px-3 py-1.5 text-sm rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            >
              {t("createParty")}
            </Link>
          )}
        </nav>

        {/* Auth + Locale switcher */}
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          {session ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {getInitials(session.user.name)}
                </div>
                <span className="hidden sm:block text-[var(--foreground)] text-sm">
                  {session.user.name?.split(" ")[0]}
                </span>
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs rounded-lg border border-[var(--card-border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-indigo-500/50 transition-colors"
                >
                  {t("logout")}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 text-sm rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                {t("login")}
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors font-medium"
              >
                {t("register")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
