"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

type ActionResult = { error?: string; success?: string };

const suggestionSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(1000),
  category: z.enum(["NEW_GAME", "FEATURE", "DESIGN", "OTHER"]),
});

export async function createSuggestionAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  const parsed = suggestionSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  await prisma.suggestion.create({
    data: { userId: session.user.id, ...parsed.data },
  });

  revalidatePath("/suggestions");
  return { success: "Sugerencia enviada" };
}

export async function voteSuggestionAction(suggestionId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  const existing = await prisma.suggestionVote.findUnique({
    where: { userId_suggestionId: { userId: session.user.id, suggestionId } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.suggestionVote.delete({ where: { id: existing.id } }),
      prisma.suggestion.update({ where: { id: suggestionId }, data: { voteCount: { decrement: 1 } } }),
    ]);
    revalidatePath("/suggestions");
    return { success: "Voto retirado" };
  }

  await prisma.$transaction([
    prisma.suggestionVote.create({ data: { userId: session.user.id, suggestionId } }),
    prisma.suggestion.update({ where: { id: suggestionId }, data: { voteCount: { increment: 1 } } }),
  ]);

  revalidatePath("/suggestions");
  return { success: "Voto añadido" };
}
