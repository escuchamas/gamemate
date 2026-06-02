import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { unbanUserAction } from "@/actions/admin";
import { Link } from "@/i18n/navigation";
import { BanForm } from "./ban-form";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>;
}) {
  const { q, tab } = await searchParams;
  const showDemo = tab === "demo";

  const baseWhere = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
          { username: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const where = {
    ...baseWhere,
    email: showDemo
      ? { endsWith: "@gamemate-demo.fake" }
      : { not: { endsWith: "@gamemate-demo.fake" } },
  };

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      image: true,
      banned: true,
      banReason: true,
      emailVerified: true,
      reputation: true,
      reputationCount: true,
      createdAt: true,
      gameProfiles: { select: { game: true } },
      _count: {
        select: {
          partiesCreated: true,
          partyMembers: true,
          messages: true,
          reportsReceived: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Usuarios</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{users.length} resultados</p>
        </div>
        <form method="GET" className="flex gap-2 items-center">
          {tab === "demo" && <input type="hidden" name="tab" value="demo" />}
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por nombre, email o usuario..."
            className="px-3 py-2 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-orange-500 w-64"
          />
        </form>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--muted)] rounded-xl p-1 w-fit">
        <Link
          href="/admin/users"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            !showDemo ? "bg-[var(--card)] text-white shadow-sm" : "text-[var(--muted-foreground)] hover:text-white"
          }`}
        >
          Usuarios reales
        </Link>
        <Link
          href="/admin/users?tab=demo"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
            showDemo ? "bg-[var(--card)] text-white shadow-sm" : "text-[var(--muted-foreground)] hover:text-white"
          }`}
        >
          <span className="text-xs opacity-60">🤖</span> Demo
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {users.map((user) => (
          <div
            key={user.id}
            className={`rounded-xl border p-4 flex items-start gap-4 ${
              user.banned
                ? "bg-red-500/5 border-red-500/20"
                : "bg-[var(--card)] border-[var(--card-border)]"
            }`}
          >
            <Avatar image={user.image} name={user.name} size="md" className="flex-shrink-0" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white text-sm">{user.name ?? "Sin nombre"}</span>
                {user.username && (
                  <span className="text-xs text-[var(--muted-foreground)]">@{user.username}</span>
                )}
                {user.banned && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                    Baneado
                  </span>
                )}
                {!user.emailVerified && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Sin verificar
                  </span>
                )}
              </div>

              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{user.email}</p>

              {user.banned && user.banReason && (
                <p className="text-xs text-red-400 mt-1">Razón: {user.banReason}</p>
              )}

              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <Stat label="Parties creadas" value={user._count.partiesCreated} />
                <Stat label="Parties unido" value={user._count.partyMembers} />
                <Stat label="Mensajes" value={user._count.messages} />
                <Stat label="Reportes recibidos" value={user._count.reportsReceived} emoji={user._count.reportsReceived > 0 ? "⚠" : undefined} />
                <Stat label="Reputación" value={`${user.reputation.toFixed(1)} (${user.reputationCount})`} />
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-[var(--muted-foreground)]">Perfil:</span>
                  {user.gameProfiles.length === 0 ? (
                    <span className="text-amber-400">⚠ Sin completar</span>
                  ) : (
                    <span className="text-green-400">
                      ✓ {user.gameProfiles.map((p) => ({ MINECRAFT: "MC", PROJECT_ZOMBOID: "PZ", LEAGUE_OF_LEGENDS: "LoL", OTHER: "Otro" } as Record<string, string>)[p.game]).join(", ")}
                    </span>
                  )}
                </div>
                <Stat
                  label="Registro"
                  value={new Date(user.createdAt).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-shrink-0">
              <Link
                href={`/admin/users/${user.id}`}
                className="text-xs text-[var(--muted-foreground)] hover:text-white transition-colors text-right"
              >
                Ver actividad →
              </Link>
              {user.banned ? (
                <form action={unbanUserAction.bind(null, user.id)}>
                  <button type="submit" className="text-xs text-green-400 hover:text-green-300 transition-colors">
                    Desbanear
                  </button>
                </form>
              ) : (
                <BanForm userId={user.id} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, emoji }: { label: string; value: string | number; emoji?: string }) {
  return (
    <div className="flex items-center gap-1 text-xs">
      {emoji && <span>{emoji}</span>}
      <span className="text-[var(--muted-foreground)]">{label}:</span>
      <span className="text-[var(--foreground)] font-medium">{value}</span>
    </div>
  );
}

