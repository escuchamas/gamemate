"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const ADMIN_EMAILS = ["fernandomcq123@gmail.com", "fernando_mcq@hotmail.com"];

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    throw new Error("Unauthorized");
  }
}

export async function markContactReadAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.contactMessage.update({ where: { id }, data: { read: true } });
  revalidatePath("/admin");
}

export async function deleteContactAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin");
}

export async function markSuggestionReadAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.suggestion.update({ where: { id }, data: { read: true } });
  revalidatePath("/admin");
}

export async function updateSuggestionStatusAction(id: string, status: string): Promise<void> {
  await requireAdmin();
  await prisma.suggestion.update({
    where: { id },
    data: { status: status as any, read: true },
  });
  revalidatePath("/admin");
}
