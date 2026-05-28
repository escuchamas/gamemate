import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// GET — returns messages since lastId cursor
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ partyId: string }> }
) {
  const { partyId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const member = await prisma.partyMember.findUnique({
    where: { partyId_userId: { partyId, userId: session.user.id } },
  });
  if (!member) {
    return Response.json({ error: "Not a member" }, { status: 403 });
  }

  const lastId = req.nextUrl.searchParams.get("lastId") ?? undefined;

  const messages = await prisma.message.findMany({
    where: {
      partyId,
      ...(lastId ? { id: { gt: lastId } } : {}),
    },
    orderBy: { createdAt: "asc" },
    take: lastId ? 50 : 50,
    include: { user: { select: { id: true, name: true, username: true } } },
  });

  return Response.json({ messages });
}

// POST — send a message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ partyId: string }> }
) {
  const { partyId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const member = await prisma.partyMember.findUnique({
    where: { partyId_userId: { partyId, userId: session.user.id } },
  });
  if (!member) {
    return Response.json({ error: "Not a member" }, { status: 403 });
  }

  const { content } = await req.json();
  if (
    typeof content !== "string" ||
    content.trim().length === 0 ||
    content.length > 1000
  ) {
    return Response.json({ error: "Invalid message" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: { partyId, userId: session.user.id, content: content.trim() },
    include: { user: { select: { id: true, name: true, username: true } } },
  });

  return Response.json({ message });
}
