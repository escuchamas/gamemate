import { auth } from "@/lib/auth";
import { signOutAction } from "@/actions/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";
import { Avatar } from "@/components/ui/avatar";

export async function Navbar() {
  const session = await auth();
  const t = await getTranslations("nav");

  const userImage = session?.user?.id
    ? (await prisma.user.findUnique({ where: { id: session.user.id }, select: { image: true } }))?.image
    : null;

  const pendingFriendRequests = session?.user?.id
    ? await prisma.friendship.count({ where: { receiverId: session.user.id, status: "PENDING" } })
    : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[var(--background)]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="GameMate" className="h-7" />
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
            <>
              <Link
                href="/parties/new"
                className="px-3 py-1.5 text-sm rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                {t("createParty")}
              </Link>
              <Link
                href="/history"
                className="px-3 py-1.5 text-sm rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                Historial
              </Link>
              <Link
                href="/friends"
                className="relative px-3 py-1.5 text-sm rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                Amigos
                {pendingFriendRequests > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {pendingFriendRequests}
                  </span>
                )}
              </Link>
            </>
          )}
          <Link
            href="/suggestions"
            className="px-3 py-1.5 text-sm rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            Sugerencias
          </Link>
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
                <Avatar image={userImage} name={session.user.name} size="sm" />
                <span className="hidden sm:block text-[var(--foreground)] text-sm">
                  {session.user.name?.split(" ")[0]}
                </span>
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs rounded-lg border border-[var(--card-border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-orange-500/50 transition-colors"
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
                className="px-4 py-1.5 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-500 transition-colors font-medium"
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
