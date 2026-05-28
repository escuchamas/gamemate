import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { GAME_ICONS, GAME_LABELS, SKILL_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { sendFriendRequestAction } from "@/actions/friends";

export default async function HistoryPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const memberships = await prisma.partyMember.findMany({
    where: { userId: session.user.id },
    orderBy: { joinedAt: "desc" },
    include: {
      party: {
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, username: true, image: true, reputation: true } },
            },
          },
        },
      },
    },
  });

  // Get existing friendships to know who's already a friend
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { senderId: session.user.id },
        { receiverId: session.user.id },
      ],
    },
  });

  const friendMap = new Map(
    friendships.map((f) => {
      const otherId = f.senderId === session.user.id ? f.receiverId : f.senderId;
      return [otherId, f];
    })
  );

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Historial de parties</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Todas las parties en las que has participado y la gente con la que jugaste.
        </p>
      </div>

      {memberships.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <p className="text-4xl mb-3">🎮</p>
          <p className="font-medium text-white mb-1">Aún no has jugado en ninguna party</p>
          <Link href="/parties" className="text-sm text-orange-400 hover:underline">
            Busca una party
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {memberships.map(({ party, joinedAt }) => {
            const otherMembers = party.members.filter((m) => m.userId !== session.user.id);
            return (
              <div key={party.id} className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{GAME_ICONS[party.game]}</span>
                    <div>
                      <Link href={`/parties/${party.id}`} className="font-semibold text-white hover:text-orange-400 transition-colors">
                        {party.name}
                      </Link>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {GAME_LABELS[party.game]} · {SKILL_LABELS[party.skillLevel]}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-[var(--muted-foreground)]">{formatDate(joinedAt)}</span>
                </div>

                {otherMembers.length === 0 ? (
                  <p className="text-sm text-[var(--muted-foreground)]">Solo tú en esta party.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide">Compañeros</p>
                    {otherMembers.map(({ user }) => {
                      const friendship = friendMap.get(user.id);
                      return (
                        <div key={user.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar image={user.image} name={user.name} size="sm" />
                            <div>
                              <Link href={`/players/${user.id}`} className="text-sm font-medium text-white hover:text-orange-400 transition-colors">
                                {user.name}
                              </Link>
                              <p className="text-xs text-[var(--muted-foreground)]">
                                @{user.username ?? "—"} · ⭐ {user.reputation.toFixed(1)}
                              </p>
                            </div>
                          </div>
                          <FriendButton userId={user.id} friendship={friendship} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FriendButton({
  userId,
  friendship,
}: {
  userId: string;
  friendship: { id: string; status: string; senderId: string } | undefined;
}) {
  if (!friendship) {
    return (
      <form action={sendFriendRequestAction.bind(null, userId)}>
        <button
          type="submit"
          className="px-3 py-1 text-xs rounded-lg bg-orange-600 text-white hover:bg-orange-500 transition-colors"
        >
          + Añadir amigo
        </button>
      </form>
    );
  }
  if (friendship.status === "ACCEPTED") {
    return <Badge variant="success">Amigos ✓</Badge>;
  }
  return <Badge variant="default">Solicitud pendiente</Badge>;
}
