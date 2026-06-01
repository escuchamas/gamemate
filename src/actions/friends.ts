"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications";

type ActionResult = { error?: string; success?: string };

export async function sendFriendRequestAction(targetId: string, formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  if (targetId === session.user.id) return;

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { senderId: session.user.id, receiverId: targetId },
        { senderId: targetId, receiverId: session.user.id },
      ],
    },
  });

  if (existing) return;

  const note = (formData.get("note") as string | null)?.trim().slice(0, 200) || null;

  await prisma.friendship.create({
    data: { senderId: session.user.id, receiverId: targetId, note },
  });

  const sender = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true } });
  await createNotification({
    userId: targetId,
    type: "FRIEND_REQUEST",
    title: "Nueva solicitud de amistad",
    body: note
      ? `${sender?.name ?? "Alguien"} quiere ser tu amigo: "${note}"`
      : `${sender?.name ?? "Alguien"} quiere ser tu amigo`,
    link: "/friends",
  });

  revalidatePath("/history");
  revalidatePath("/friends");
}

export async function acceptFriendRequestAction(friendshipId: string, _formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!friendship || friendship.receiverId !== session.user.id) return;

  await prisma.friendship.update({
    where: { id: friendshipId },
    data: { status: "ACCEPTED" },
  });

  const accepter = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true } });
  await createNotification({
    userId: friendship.senderId,
    type: "FRIEND_ACCEPTED",
    title: "Solicitud de amistad aceptada",
    body: `${accepter?.name ?? "Alguien"} aceptó tu solicitud de amistad`,
    link: "/friends",
  });

  revalidatePath("/friends");
}

export async function rejectFriendRequestAction(friendshipId: string, _formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!friendship || friendship.receiverId !== session.user.id) return;

  const rejecter = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true } });
  const senderId = friendship.senderId;

  await prisma.friendship.delete({ where: { id: friendshipId } });

  await createNotification({
    userId: senderId,
    type: "FRIEND_REJECTED",
    title: "Solicitud de amistad rechazada",
    body: `${rejecter?.name ?? "Alguien"} rechazó tu solicitud de amistad`,
    link: "/friends",
  });

  revalidatePath("/friends");
}

export async function removeFriendAction(friendshipId: string, _formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!friendship) return;
  if (friendship.senderId !== session.user.id && friendship.receiverId !== session.user.id) return;

  await prisma.friendship.delete({ where: { id: friendshipId } });

  revalidatePath("/friends");
}

export async function sendDirectMessageAction(receiverId: string, content: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };
  if (!content.trim()) return { error: "Mensaje vacío" };
  if (content.length > 1000) return { error: "Mensaje demasiado largo" };

  const friendship = await prisma.friendship.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { senderId: session.user.id, receiverId },
        { senderId: receiverId, receiverId: session.user.id },
      ],
    },
  });

  if (!friendship) return { error: "Solo puedes escribir a tus amigos" };

  await prisma.directMessage.create({
    data: { senderId: session.user.id, receiverId, content: content.trim() },
  });

  return { success: "ok" };
}

export async function markMessagesReadAction(friendId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.directMessage.updateMany({
    where: { senderId: friendId, receiverId: session.user.id, read: false },
    data: { read: true },
  });
}
