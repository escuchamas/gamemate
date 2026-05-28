import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { Link } from "@/i18n/navigation";
import { DirectChat } from "./direct-chat";
import { markMessagesReadAction } from "@/actions/friends";

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function DirectMessagePage({ params }: Props) {
  const { userId } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const [friend, friendship] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, username: true, image: true, reputation: true },
    }),
    prisma.friendship.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { senderId: session.user.id, receiverId: userId },
          { senderId: userId, receiverId: session.user.id },
        ],
      },
    }),
  ]);

  if (!friend) notFound();
  if (!friendship) redirect("/friends");

  // Mark messages as read
  await markMessagesReadAction(userId);

  const messages = await prisma.directMessage.findMany({
    where: {
      OR: [
        { senderId: session.user.id, receiverId: userId },
        { senderId: userId, receiverId: session.user.id },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4 h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-4 flex items-center gap-3">
        <Link href="/friends" className="text-[var(--muted-foreground)] hover:text-white transition-colors text-sm">
          ← Amigos
        </Link>
        <Avatar image={friend.image} name={friend.name} size="md" />
        <div>
          <p className="font-semibold text-white">{friend.name}</p>
          <p className="text-xs text-[var(--muted-foreground)]">@{friend.username ?? "—"} · ⭐ {friend.reputation.toFixed(1)}</p>
        </div>
      </div>

      <DirectChat
        friendId={friend.id}
        currentUserId={session.user.id}
        initialMessages={messages.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          content: m.content,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
