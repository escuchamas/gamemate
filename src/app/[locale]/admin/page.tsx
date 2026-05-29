import { prisma } from "@/lib/prisma";
import { markContactReadAction, deleteContactAction } from "@/actions/admin";

const CATEGORY_LABEL: Record<string, string> = {
  GENERAL: "💬 Consulta",
  BUG: "🐛 Bug",
  QUESTION: "❓ Pregunta",
  OTHER: "📝 Otro",
};

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Mensajes de contacto</h1>
          {unread > 0 && (
            <p className="text-sm text-orange-400 mt-0.5">{unread} sin leer</p>
          )}
        </div>
        <span className="text-sm text-[var(--muted-foreground)]">{messages.length} total</span>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium text-white">Sin mensajes aún</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-xl border p-5 flex flex-col gap-3 ${
                msg.read
                  ? "bg-[var(--card)] border-[var(--card-border)]"
                  : "bg-orange-500/5 border-orange-500/20"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {!msg.read && (
                    <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                  )}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]">
                    {CATEGORY_LABEL[msg.category]}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {new Date(msg.createdAt).toLocaleDateString("es", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!msg.read && (
                    <form action={markContactReadAction.bind(null, msg.id)}>
                      <button
                        type="submit"
                        className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                      >
                        Marcar leído
                      </button>
                    </form>
                  )}
                  <form action={deleteContactAction.bind(null, msg.id)}>
                    <button
                      type="submit"
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-white text-sm">{msg.name}</span>
                  <a href={`mailto:${msg.email}`} className="text-xs text-orange-400 hover:underline">
                    {msg.email}
                  </a>
                </div>
                {msg.subject && (
                  <p className="text-sm font-medium text-[var(--foreground)] mb-1">{msg.subject}</p>
                )}
                <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
