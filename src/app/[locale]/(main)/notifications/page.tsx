import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { markAllNotificationsReadAction } from "@/actions/notifications";

const TYPE_ICON: Record<string, string> = {
  FRIEND_REQUEST: "👤",
  FRIEND_ACCEPTED: "🤝",
  FRIEND_REJECTED: "❌",
  JOIN_REQUEST: "📩",
  JOIN_APPROVED: "✅",
  JOIN_REJECTED: "❌",
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unread = notifications.filter((n) => !n.read);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Notificaciones</h1>
          {unread.length > 0 && (
            <p className="text-sm text-[var(--muted-foreground)]">{unread.length} sin leer</p>
          )}
        </div>
        {unread.length > 0 && (
          <form action={markAllNotificationsReadAction}>
            <button
              type="submit"
              className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
            >
              Marcar todo como leído
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <p className="text-4xl mb-3">🔔</p>
          <p className="font-medium text-white mb-1">Sin notificaciones</p>
          <p className="text-sm">Aquí aparecerán solicitudes de amistad, respuestas a parties y más.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <NotificationRow key={n.id} notification={n} />
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationRow({ notification: n }: {
  notification: { id: string; type: string; title: string; body: string | null; link: string | null; read: boolean; createdAt: Date };
}) {
  const icon = TYPE_ICON[n.type] ?? "🔔";
  const content = (
    <div className={`rounded-xl border p-4 flex items-start gap-3 transition-colors ${
      n.read
        ? "bg-[var(--card)] border-[var(--card-border)]"
        : "bg-orange-500/5 border-orange-500/20"
    }`}>
      <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${n.read ? "text-[var(--foreground)]" : "text-white"}`}>
          {n.title}
        </p>
        {n.body && (
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{n.body}</p>
        )}
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          {new Date(n.createdAt).toLocaleDateString("es", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      {!n.read && (
        <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-1.5" />
      )}
    </div>
  );

  if (n.link) {
    return (
      <Link href={n.link as any} className="block hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }
  return content;
}
