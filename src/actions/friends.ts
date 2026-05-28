"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ActionResult = { error?: string; success?: string };

export async function sendFriendRequestAction(targetId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };
  if (targetId === session.user.id) return { error: "No puedes añadirte a ti mismo" };

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { senderId: session.user.id, receiverId: targetId },
        { senderId: targetId, receiverId: session.user.id },
      ],
    },
  });

  if (existing) {
    if (existing.status === "ACCEPTED") return { error: "Ya sois amigos" };
    if (existing.status === "PENDING") return { error: "Solicitud ya enviada" };
  }

  await prisma.friendship.create({
    data: { senderId: session.user.id, receiverId: targetId },
  });

  revalidatePath("/friends");
  return { success: "Solicitud enviada" };
}

export async function acceptFriendRequestAction(friendshipId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!friendship || friendship.receiverId !== session.user.id) return { error: "Solicitud no encontrada" };

  await prisma.friendship.update({
    where: { id: friendshipId },
    data: { status: "ACCEPTED" },
  });

  revalidatePath("/friends");
  return { success: "Solicitud aceptada" };
}

export async function rejectFriendRequestAction(friendshipId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!friendship || friendship.receiverId !== session.user.id) return { error: "Solicitud no encontrada" };

  await prisma.friendship.delete({ where: { id: friendshipId } });

  revalidatePath("/friends");
  return { success: "Solicitud rechazada" };
}

export async function removeFriendAction(friendshipId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!friendship) return { error: "No encontrado" };
  if (friendship.senderId !== session.user.id && friendship.receiverId !== session.user.id) {
    return { error: "Sin permiso" };
  }

  await prisma.friendship.delete({ where: { id: friendshipId } });

  revalidatePath("/friends");
  return { success: "Amigo eliminado" };
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
