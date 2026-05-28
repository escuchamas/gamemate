import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const friendId = req.nextUrl.searchParams.get("friendId");
  const lastId = req.nextUrl.searchParams.get("lastId") ?? undefined;

  if (!friendId) return Response.json({ error: "Missing friendId" }, { status: 400 });

  const messages = await prisma.directMessage.findMany({
    where: {
      OR: [
        { senderId: session.user.id, receiverId: friendId },
        { senderId: friendId, receiverId: session.user.id },
      ],
      ...(lastId ? { id: { gt: lastId } } : {}),
    },
    orderBy: { createdAt: "asc" },
    take: 50,
    select: { id: true, senderId: true, content: true, createdAt: true },
  });

  // Mark as read
  await prisma.directMessage.updateMany({
    where: { senderId: friendId, receiverId: session.user.id, read: false },
    data: { read: true },
  });

  return Response.json({ messages });
}
