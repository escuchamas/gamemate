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

export async function banUserAction(userId: string, reason: string): Promise<void> {
  await requireAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { banned: true, banReason: reason || "Moderación" },
  });
  revalidatePath("/admin/users");
}

export async function unbanUserAction(userId: string): Promise<void> {
  await requireAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { banned: false, banReason: null },
  });
  revalidatePath("/admin/users");
}

export async function resolveReportAction(id: string, status: "REVIEWED" | "RESOLVED_ACTION" | "RESOLVED_NO_ACTION"): Promise<void> {
  await requireAdmin();
  await prisma.report.update({ where: { id }, data: { status } });
  revalidatePath("/admin/reports");
}

export async function deleteMessageAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.message.delete({ where: { id } });
  revalidatePath("/admin/reports");
}

export async function deleteDirectMessageAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.directMessage.delete({ where: { id } });
  revalidatePath("/admin/reports");
}

export async function closePartyAdminAction(partyId: string): Promise<void> {
  await requireAdmin();
  await prisma.party.update({ where: { id: partyId }, data: { status: "CLOSED" } });
  revalidatePath("/admin/parties");
}

export async function deletePartyAdminAction(partyId: string): Promise<void> {
  await requireAdmin();
  await prisma.party.delete({ where: { id: partyId } });
  revalidatePath("/admin/parties");
}
