import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { Link } from "@/i18n/navigation";
import {
  acceptFriendRequestAction,
  rejectFriendRequestAction,
  removeFriendAction,
  sendFriendRequestAction,
} from "@/actions/friends";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function FriendsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const { q } = await searchParams;

  const [friendships, pendingReceived, pendingSent] = await Promise.all([
    prisma.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
      },
      include: {
        sender: { select: { id: true, name: true, username: true, image: true, reputation: true } },
        receiver: { select: { id: true, name: true, username: true, image: true, reputation: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.friendship.findMany({
      where: { receiverId: session.user.id, status: "PENDING" },
      include: {
        sender: { select: { id: true, name: true, username: true, image: true, reputation: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.friendship.findMany({
      where: { senderId: session.user.id, status: "PENDING" },
      select: { receiverId: true },
    }),
  ]);

  const unreadCounts = await prisma.directMessage.groupBy({
    by: ["senderId"],
    where: { receiverId: session.user.id, read: false },
    _count: true,
  });
  const unreadMap = new Map(unreadCounts.map((u) => [u.senderId, u._count]));

  const friendIds = new Set(
    friendships.map((f) => f.senderId === session.user.id ? f.receiverId : f.senderId)
  );
  const pendingSentIds = new Set(pendingSent.map((p) => p.receiverId));
  const pendingReceivedIds = new Set(pendingReceived.map((p) => p.senderId));

  // Search results
  let searchResults: { id: string; name: string | null; username: string | null; image: string | null; reputation: number }[] = [];
  if (q && q.trim().length >= 2) {
    searchResults = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: session.user.id } },
          {
            OR: [
              { name: { contains: q.trim(), mode: "insensitive" } },
              { username: { contains: q.trim(), mode: "insensitive" } },
            ],
          },
        ],
      },
      select: { id: true, name: true, username: true, image: true, reputation: true },
      take: 10,
    });
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <h1 className="text-xl font-bold text-white">Amigos</h1>

      {/* Search */}
      <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5">
        <h2 className="font-semibold text-white mb-3">Buscar jugadores</h2>
        <form method="GET" className="flex gap-2">
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por nombre o @usuario..."
            autoComplete="off"
            className="flex-1 px-3 py-2 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-500 transition-colors"
          >
            Buscar
          </button>
        </form>

        {q && q.trim().length >= 2 && (
          <div className="mt-4">
            {searchResults.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">
                No se encontraron jugadores para "{q}".
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {searchResults.map((user) => {
                  const isFriend = friendIds.has(user.id);
                  const sentPending = pendingSentIds.has(user.id);
                  const receivedPending = pendingReceivedIds.has(user.id);

                  return (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar image={user.image} name={user.name} size="md" />
                        <div>
                          <p className="text-sm font-medium text-white">{user.name ?? "—"}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            @{user.username ?? "—"} · ⭐ {user.reputation.toFixed(1)}
                          </p>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {isFriend ? (
                          <span className="text-xs text-green-400 px-3 py-1 rounded-lg border border-green-500/30 bg-green-500/10">
                            ✓ Amigos
                          </span>
                        ) : sentPending ? (
                          <span className="text-xs text-[var(--muted-foreground)] px-3 py-1 rounded-lg border border-[var(--card-border)]">
                            Solicitud enviada
                          </span>
                        ) : receivedPending ? (
                          <span className="text-xs text-orange-400 px-3 py-1 rounded-lg border border-orange-500/30 bg-orange-500/10">
                            Te envió solicitud →{" "}
                            <Link href="/friends" className="underline">ver</Link>
                          </span>
                        ) : (
                          <form action={sendFriendRequestAction.bind(null, user.id)}>
                            <button
                              type="submit"
                              className="px-3 py-1 text-xs rounded-lg bg-orange-600 text-white hover:bg-orange-500 transition-colors"
                            >
                              + Añadir amigo
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {q && q.trim().length < 2 && (
          <p className="text-xs text-[var(--muted-foreground)] mt-2">Escribe al menos 2 caracteres.</p>
        )}
      </div>

      {/* Pending requests */}
      {pendingReceived.length > 0 && (
        <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            Solicitudes pendientes
            <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">
              {pendingReceived.length}
            </span>
          </h2>
          <div className="flex flex-col gap-3">
            {pendingReceived.map((f) => (
              <div key={f.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar image={f.sender.image} name={f.sender.name} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-white">{f.sender.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">@{f.sender.username ?? "—"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <form action={acceptFriendRequestAction.bind(null, f.id)}>
                    <button type="submit" className="px-3 py-1 text-xs rounded-lg bg-orange-600 text-white hover:bg-orange-500 transition-colors">
                      Aceptar
                    </button>
                  </form>
                  <form action={rejectFriendRequestAction.bind(null, f.id)}>
                    <button type="submit" className="px-3 py-1 text-xs rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-white transition-colors">
                      Rechazar
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends list */}
      <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5">
        <h2 className="font-semibold text-white mb-4">
          Mis amigos ({friendships.length})
        </h2>

        {friendships.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Aún no tienes amigos. Búscalos arriba o añádelos desde el{" "}
            <Link href="/history" className="text-orange-400 hover:underline">historial de parties</Link>.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {friendships.map((f) => {
              const friend = f.senderId === session.user.id ? f.receiver : f.sender;
              const unread = unreadMap.get(friend.id) ?? 0;
              return (
                <div key={f.id} className="flex items-center justify-between">
                  <Link href={`/friends/${friend.id}`} className="flex items-center gap-3 group">
                    <div className="relative">
                      <Avatar image={friend.image} name={friend.name} size="md" />
                      {unread > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                          {unread}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors">
                        {friend.name}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        @{friend.username ?? "—"} · ⭐ {friend.reputation.toFixed(1)}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/friends/${friend.id}`}
                      className="px-3 py-1 text-xs rounded-lg bg-orange-600 text-white hover:bg-orange-500 transition-colors"
                    >
                      💬 Mensaje
                    </Link>
                    <form action={removeFriendAction.bind(null, f.id)}>
                      <button type="submit" className="px-3 py-1 text-xs rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-white transition-colors">
                        Eliminar
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
