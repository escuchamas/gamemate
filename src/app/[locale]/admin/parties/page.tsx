import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { closePartyAdminAction, deletePartyAdminAction } from "@/actions/admin";
import { GAME_ICONS, GAME_LABELS } from "@/lib/constants";

export default async function AdminPartiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  const where: Record<string, unknown> = {};
  if (q?.trim()) {
    where.OR = [
      { name: { contains: q.trim(), mode: "insensitive" } },
      { description: { contains: q.trim(), mode: "insensitive" } },
      { creator: { name: { contains: q.trim(), mode: "insensitive" } } },
    ];
  }
  if (status && ["OPEN", "FULL", "IN_GAME", "CLOSED"].includes(status)) {
    where.status = status;
  }

  const parties = await prisma.party.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      creator: { select: { id: true, name: true, username: true } },
      _count: { select: { members: true, messages: true } },
    },
  });

  const STATUS_STYLES: Record<string, string> = {
    OPEN: "bg-green-500/20 text-green-400 border-green-500/30",
    FULL: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    IN_GAME: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    CLOSED: "bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--card-border)]",
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Parties</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{parties.length} resultados</p>
        </div>

        <form method="GET" className="flex gap-2 flex-wrap">
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por nombre, descripción o creador..."
            className="px-3 py-2 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-orange-500 w-72"
          />
          <select
            name="status"
            defaultValue={status ?? ""}
            className="px-3 py-2 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="">Todos los estados</option>
            <option value="OPEN">Abiertas</option>
            <option value="FULL">Llenas</option>
            <option value="IN_GAME">En partida</option>
            <option value="CLOSED">Cerradas</option>
          </select>
          <button type="submit" className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-500 transition-colors">
            Filtrar
          </button>
        </form>
      </div>

      {parties.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <p className="text-4xl mb-3">🎮</p>
          <p className="font-medium text-white">Sin parties</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {parties.map((party) => (
            <div
              key={party.id}
              className={`rounded-xl border p-4 flex items-start gap-4 ${
                party.status === "CLOSED"
                  ? "bg-[var(--card)] border-[var(--card-border)] opacity-60"
                  : "bg-[var(--card)] border-[var(--card-border)]"
              }`}
            >
              <span className="text-2xl flex-shrink-0">{GAME_ICONS[party.game]}</span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-white text-sm">{party.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[party.status]}`}>
                    {party.status}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">{GAME_LABELS[party.game]}</span>
                </div>

                {party.description && (
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mb-1">
                    {party.description}
                  </p>
                )}

                <div className="flex items-center gap-3 flex-wrap text-xs text-[var(--muted-foreground)]">
                  <span>
                    Creada por{" "}
                    <Link href={`/admin/users/${party.creator.id}`} className="text-orange-400 hover:underline">
                      {party.creator.name ?? party.creator.username}
                    </Link>
                  </span>
                  <span>👥 {party._count.members} miembros</span>
                  <span>💬 {party._count.messages} mensajes</span>
                  <span>{new Date(party.createdAt).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-shrink-0 items-end">
                <Link
                  href={`/parties/${party.id}`}
                  className="text-xs text-[var(--muted-foreground)] hover:text-white transition-colors"
                  target="_blank"
                >
                  Ver party →
                </Link>
                {party.status !== "CLOSED" && (
                  <form action={closePartyAdminAction.bind(null, party.id)}>
                    <button type="submit" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                      Cerrar
                    </button>
                  </form>
                )}
                <form
                  action={deletePartyAdminAction.bind(null, party.id)}
                  onSubmit={(e) => {
                    if (!confirm(`¿Eliminar "${party.name}"? Esta acción no se puede deshacer.`)) {
                      e.preventDefault();
                    }
                  }}
                >
                  <button type="submit" className="text-xs text-red-400 hover:text-red-300 transition-colors">
                    Eliminar
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
