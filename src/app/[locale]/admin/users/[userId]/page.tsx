import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { deleteMessageAction } from "@/actions/admin";
import { Link } from "@/i18n/navigation";
import { GAME_LABELS, GAME_ICONS } from "@/lib/constants";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      gameProfiles: true,
      partiesCreated: { orderBy: { createdAt: "desc" }, take: 10 },
      partyMembers: {
        orderBy: { joinedAt: "desc" },
        take: 10,
        include: { party: { select: { id: true, name: true, game: true } } },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 30,
        include: { party: { select: { id: true, name: true } } },
      },
      reportsReceived: {
        orderBy: { createdAt: "desc" },
        include: { reporter: { select: { name: true, username: true } } },
      },
    },
  });

  if (!user) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link href="/admin/users" className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors">
          ← Usuarios
        </Link>
      </div>

      {/* Header */}
      <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5 flex items-center gap-4">
        <Avatar image={user.image} name={user.name} size="lg" />
        <div>
          <h1 className="text-lg font-bold text-white">{user.name}</h1>
          <p className="text-sm text-[var(--muted-foreground)]">@{user.username} · {user.email}</p>
          <div className="flex gap-2 mt-1 flex-wrap">
            {user.banned && <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">Baneado{user.banReason ? `: ${user.banReason}` : ""}</span>}
            {user.emailVerified ? <span className="text-xs text-green-400">✓ Email verificado</span> : <span className="text-xs text-amber-400">✗ Sin verificar</span>}
            <span className="text-xs text-[var(--muted-foreground)]">⭐ {user.reputation.toFixed(1)}</span>
            <span className="text-xs text-[var(--muted-foreground)]">Registro: {new Date(user.createdAt).toLocaleDateString("es")}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Game profiles */}
        <Section title="Perfiles de juego">
          {user.gameProfiles.length === 0 ? (
            <Empty text="Sin perfiles configurados" />
          ) : (
            user.gameProfiles.map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-sm py-1.5 border-b border-[var(--card-border)] last:border-0">
                <span>{GAME_ICONS[p.game]}</span>
                <span className="text-white">{GAME_LABELS[p.game]}</span>
                <span className="text-[var(--muted-foreground)]">· {p.skillLevel}</span>
                {p.tags.length > 0 && <span className="text-xs text-[var(--muted-foreground)]">· {p.tags.slice(0, 3).join(", ")}</span>}
              </div>
            ))
          )}
        </Section>

        {/* Parties */}
        <Section title="Parties (miembro)">
          {user.partyMembers.length === 0 ? (
            <Empty text="Sin parties" />
          ) : (
            user.partyMembers.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-sm py-1.5 border-b border-[var(--card-border)] last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span>{GAME_ICONS[m.party.game]}</span>
                  <span className="text-white truncate">{m.party.name}</span>
                  {m.role === "LEADER" && <span className="text-xs text-orange-400">líder</span>}
                </div>
                <Link href={`/parties/${m.party.id}`} className="text-xs text-[var(--muted-foreground)] hover:text-white flex-shrink-0 ml-2">
                  Ver →
                </Link>
              </div>
            ))
          )}
        </Section>
      </div>

      {/* Recent messages */}
      <Section title={`Mensajes recientes (${user.messages.length})`}>
        {user.messages.length === 0 ? (
          <Empty text="Sin mensajes" />
        ) : (
          <div className="flex flex-col gap-1">
            {user.messages.map((msg) => (
              <div key={msg.id} className="flex items-start justify-between gap-3 py-2 border-b border-[var(--card-border)] last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Link href={`/parties/${msg.party.id}`} className="text-xs text-orange-400 hover:underline flex-shrink-0">
                      {msg.party.name}
                    </Link>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {new Date(msg.createdAt).toLocaleDateString("es", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--foreground)] break-words">{msg.content}</p>
                </div>
                <form action={deleteMessageAction.bind(null, msg.id)} className="flex-shrink-0">
                  <button type="submit" className="text-xs text-red-400 hover:text-red-300 transition-colors">
                    Eliminar
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Reports received */}
      {user.reportsReceived.length > 0 && (
        <Section title={`Reportes recibidos (${user.reportsReceived.length})`}>
          {user.reportsReceived.map((r) => (
            <div key={r.id} className="py-2 border-b border-[var(--card-border)] last:border-0">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-amber-400 font-medium">{r.reason.replace(/_/g, " ")}</span>
                  <span className="text-xs text-[var(--muted-foreground)] ml-2">por {r.reporter.name ?? r.reporter.username}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  r.status === "PENDING" ? "bg-amber-500/20 text-amber-400" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                }`}>{r.status}</span>
              </div>
              {r.description && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{r.description}</p>}
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5">
      <h2 className="font-semibold text-white text-sm mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-xs text-[var(--muted-foreground)] py-2">{text}</p>;
}
