import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";
import { DEMO_EMAIL_DOMAIN } from "@/lib/emails";
import { AdminNav } from "@/components/admin/admin-nav";

// Página privada o de acceso: fuera de Google
export const metadata: Metadata = { title: "Admin", robots: NOINDEX };

const ADMIN_EMAILS = ["fernandomcq123@gmail.com", "fernando_mcq@hotmail.com"];

const DAY = 24 * 60 * 60 * 1000;

async function getStats() {
  const real = { NOT: { email: { endsWith: DEMO_EMAIL_DOMAIN } } };
  const weekAgo = new Date(Date.now() - 7 * DAY);
  const [users, verified, newUsers, active, openParties, servers, emailsSent, emailsOpened, unread, reports] = await Promise.all([
    prisma.user.count({ where: real }),
    prisma.user.count({ where: { ...real, emailVerified: { not: null } } }),
    prisma.user.count({ where: { ...real, createdAt: { gte: weekAgo } } }),
    prisma.user.count({ where: { ...real, lastSeenAt: { gte: weekAgo } } }),
    prisma.party.count({ where: { status: { in: ["OPEN", "FULL", "IN_GAME"] }, creator: real } }),
    prisma.gameServer.count(),
    prisma.emailLog.count({ where: { userId: { not: null }, sentAt: { gte: weekAgo } } }),
    prisma.emailLog.count({ where: { userId: { not: null }, sentAt: { gte: weekAgo }, openedAt: { not: null } } }),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.report.count({ where: { status: "PENDING" } }),
  ]);
  return { users, verified, newUsers, active, openParties, servers, emailsSent, emailsOpened, unread, reports };
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    redirect("/");
  }

  const s = await getStats();
  // Datos reales (sin cuentas de demo), última semana
  const stats = [
    { label: "Usuarios", value: s.users, note: `${s.verified} verificados` },
    { label: "Nuevos (7 días)", value: s.newUsers, note: `${s.active} activos esta semana` },
    { label: "Parties abiertas", value: s.openParties, note: "de jugadores reales" },
    { label: "Servidores", value: s.servers, note: "en el tablón" },
    { label: "Emails (7 días)", value: s.emailsSent, note: `${s.emailsOpened} abiertos` },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--card-border)] bg-[var(--background)]/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/" className="shrink-0 hover:opacity-80 transition-opacity">
                <img src="/icon.png" alt="GameMate" className="h-7 w-7 rounded-full" />
              </Link>
              <p className="font-semibold text-white truncate [font-family:var(--font-display),sans-serif]">Panel de GameMate</p>
            </div>
            <Link
              href="/parties"
              className="shrink-0 px-3 py-1.5 text-sm rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            >
              Volver a la web
            </Link>
          </div>
          <AdminNav unreadMessages={s.unread} openReports={s.reports} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
        <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {stats.map((st) => (
            <div key={st.label} className="rounded-[14px] bg-[var(--card)] border-[1.5px] border-[var(--card-border)] px-4 py-3">
              <dt className="text-sm text-[var(--muted-foreground)]">{st.label}</dt>
              <dd className="m-0">
                <span className="block text-2xl font-bold text-white tabular-nums [font-family:var(--font-display),sans-serif]">{st.value}</span>
                <span className="block text-xs text-[var(--muted-foreground)]">{st.note}</span>
              </dd>
            </div>
          ))}
        </dl>
        <div>{children}</div>
      </main>
    </div>
  );
}
