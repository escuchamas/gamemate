import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";

const ADMIN_EMAILS = ["fernandomcq123@gmail.com", "fernando_mcq@hotmail.com"];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--card-border)] bg-[var(--background)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <img src="/icon.png" alt="GameMate" className="h-7 w-7 rounded-full" />
            </Link>
            <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">Admin</span>
          </div>
          <nav className="flex items-center gap-1 flex-wrap">
            {[
              { href: "/admin", label: "Mensajes" },
              { href: "/admin/suggestions", label: "Peticiones" },
              { href: "/admin/users", label: "Usuarios" },
              { href: "/admin/parties", label: "Parties" },
              { href: "/admin/reports", label: "Reportes" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href as any}
                className="px-3 py-1.5 text-sm rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/"
              className="px-3 py-1.5 text-sm rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            >
              ← App
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
