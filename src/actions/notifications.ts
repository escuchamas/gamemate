"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markAllNotificationsReadAction(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  revalidatePath("/notifications");
}

export async function markNotificationReadAction(id: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.notification.update({
    where: { id, userId: session.user.id },
    data: { read: true },
  });
}
