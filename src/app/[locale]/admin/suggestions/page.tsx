import { prisma } from "@/lib/prisma";
import { markSuggestionReadAction, updateSuggestionStatusAction } from "@/actions/admin";

const CATEGORY_LABEL: Record<string, string> = {
  NEW_GAME: "🎮 Nuevo juego",
  FEATURE: "✨ Nueva función",
  DESIGN: "🎨 Diseño",
  OTHER: "💡 Otra idea",
};

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Abierta" },
  { value: "IN_REVIEW", label: "En revisión" },
  { value: "IMPLEMENTED", label: "Implementada" },
  { value: "REJECTED", label: "Rechazada" },
];

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-[var(--muted)] text-[var(--muted-foreground)]",
  IN_REVIEW: "bg-amber-500/20 text-amber-400",
  IMPLEMENTED: "bg-green-500/20 text-green-400",
  REJECTED: "bg-red-500/20 text-red-400",
};

export default async function AdminSuggestionsPage() {
  const suggestions = await prisma.suggestion.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
    take: 200,
  });

  const unread = suggestions.filter((s) => !s.read).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Peticiones</h1>
          {unread > 0 && (
            <p className="text-sm text-orange-400 mt-0.5">{unread} nuevas</p>
          )}
        </div>
        <span className="text-sm text-[var(--muted-foreground)]">{suggestions.length} total</span>
      </div>

      {suggestions.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <p className="text-4xl mb-3">💡</p>
          <p className="font-medium text-white">Sin peticiones aún</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {suggestions.map((s) => (
            <div
              key={s.id}
              className={`rounded-xl border p-5 flex flex-col gap-3 ${
                s.read
                  ? "bg-[var(--card)] border-[var(--card-border)]"
                  : "bg-orange-500/5 border-orange-500/20"
              }`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {!s.read && <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]">
                    {CATEGORY_LABEL[s.category]}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[s.status]}`}>
                    {STATUS_OPTIONS.find((o) => o.value === s.status)?.label}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {new Date(s.createdAt).toLocaleDateString("es", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!s.read && (
                    <form action={markSuggestionReadAction.bind(null, s.id)}>
                      <button type="submit" className="text-xs text-orange-400 hover:text-orange-300 transition-colors">
                        Marcar leída
                      </button>
                    </form>
                  )}
                  <form action={updateSuggestionStatusAction.bind(null, s.id, "IN_REVIEW")}>
                    <button type="submit" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                      En revisión
                    </button>
                  </form>
                  <form action={updateSuggestionStatusAction.bind(null, s.id, "IMPLEMENTED")}>
                    <button type="submit" className="text-xs text-green-400 hover:text-green-300 transition-colors">
                      Implementada
                    </button>
                  </form>
                  <form action={updateSuggestionStatusAction.bind(null, s.id, "REJECTED")}>
                    <button type="submit" className="text-xs text-red-400 hover:text-red-300 transition-colors">
                      Rechazar
                    </button>
                  </form>
                </div>
              </div>

              <div>
                <p className="font-semibold text-white text-sm mb-1">{s.title}</p>
                <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap">{s.description}</p>
              </div>

              <p className="text-xs text-[var(--muted-foreground)]">
                Por <span className="text-[var(--foreground)]">{s.user.name ?? "Anónimo"}</span>
                {s.user.email && (
                  <> · <a href={`mailto:${s.user.email}`} className="text-orange-400 hover:underline">{s.user.email}</a></>
                )}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
