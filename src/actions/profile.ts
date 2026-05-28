"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gameProfileSchema } from "@/lib/validations";
import { z } from "zod";
import { updateTag } from "next/cache";

type ActionResult = { error?: string; success?: string };

const ratingSchema = z.object({
  ratedId: z.string().cuid(),
  partyId: z.string().cuid().optional(),
  levelMatch: z.number().int().min(1).max(5),
  friendliness: z.number().int().min(1).max(5),
  funFactor: z.number().int().min(1).max(5),
  reliability: z.number().int().min(1).max(5),
  comment: z.string().max(300).optional(),
});

export async function updateGameProfileAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  const tagsRaw = formData.get("tags");
  const raw = {
    game: formData.get("game"),
    skillLevel: formData.get("skillLevel"),
    playtimeHours: formData.get("playtimeHours")
      ? Number(formData.get("playtimeHours"))
      : undefined,
    modded: formData.get("modded") === "true",
    modsNote: formData.get("modsNote") || undefined,
    minecraftStyle: formData.get("minecraftStyle") || undefined,
    pzStyle: formData.get("pzStyle") || undefined,
    notes: formData.get("notes") || undefined,
  };

  const parsed = gameProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const tags: string[] = tagsRaw ? JSON.parse(tagsRaw as string) : [];

  await prisma.gameProfile.upsert({
    where: {
      userId_game: { userId: session.user.id, game: parsed.data.game },
    },
    update: { ...parsed.data, tags },
    create: { userId: session.user.id, ...parsed.data, tags },
  });

  updateTag(`profile-${session.user.id}`);
  return { success: "Perfil de juego actualizado" };
}

export async function ratePlayerAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  const raw = {
    ratedId: formData.get("ratedId"),
    partyId: formData.get("partyId") || undefined,
    levelMatch: Number(formData.get("levelMatch")),
    friendliness: Number(formData.get("friendliness")),
    funFactor: Number(formData.get("funFactor")),
    reliability: Number(formData.get("reliability")),
    comment: formData.get("comment") || undefined,
  };

  const parsed = ratingSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Valoración inválida" };
  }

  if (parsed.data.ratedId === session.user.id) {
    return { error: "No puedes valorarte a ti mismo" };
  }

  const avg =
    (parsed.data.levelMatch +
      parsed.data.friendliness +
      parsed.data.funFactor +
      parsed.data.reliability) /
    4;

  await prisma.$transaction(async (tx) => {
    await tx.rating.upsert({
      where: {
        raterId_ratedId_partyId: {
          raterId: session.user.id,
          ratedId: parsed.data.ratedId,
          partyId: parsed.data.partyId ?? "",
        },
      },
      update: {
        levelMatch: parsed.data.levelMatch,
        friendliness: parsed.data.friendliness,
        funFactor: parsed.data.funFactor,
        reliability: parsed.data.reliability,
        comment: parsed.data.comment,
      },
      create: {
        raterId: session.user.id,
        ratedId: parsed.data.ratedId,
        partyId: parsed.data.partyId ?? null,
        levelMatch: parsed.data.levelMatch,
        friendliness: parsed.data.friendliness,
        funFactor: parsed.data.funFactor,
        reliability: parsed.data.reliability,
        comment: parsed.data.comment,
      },
    });

    // Recalculate user reputation
    const allRatings = await tx.rating.findMany({
      where: { ratedId: parsed.data.ratedId },
      select: { levelMatch: true, friendliness: true, funFactor: true, reliability: true },
    });

    const newAvg =
      allRatings.reduce(
        (sum, r) =>
          sum + (r.levelMatch + r.friendliness + r.funFactor + r.reliability) / 4,
        0
      ) / allRatings.length;

    await tx.user.update({
      where: { id: parsed.data.ratedId },
      data: {
        reputation: Math.round(newAvg * 10) / 10,
        reputationCount: allRatings.length,
      },
    });
  });

  updateTag(`profile-${parsed.data.ratedId}`);
  return { success: "Valoración enviada" };
}

export async function voteBadgeAction(
  targetId: string,
  badge: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  if (targetId === session.user.id) {
    return { error: "No puedes votarte a ti mismo" };
  }

  // Only users who shared a party can vote
  const sharedParty = await prisma.partyMember.findFirst({
    where: {
      userId: session.user.id,
      party: { members: { some: { userId: targetId } } },
    },
  });

  if (!sharedParty) {
    return { error: "Solo puedes avalar badges de gente con quien hayas jugado" };
  }

  await prisma.$transaction(async (tx) => {
    // Upsert vote (one vote per voter per badge per user)
    await tx.badgeVote.upsert({
      where: {
        voterId_targetId_badge: {
          voterId: session.user.id,
          targetId,
          badge: badge as any,
        },
      },
      update: {},
      create: {
        voterId: session.user.id,
        targetId,
        badge: badge as any,
      },
    });

    // Count votes
    const voteCount = await tx.badgeVote.count({
      where: { targetId, badge: badge as any },
    });

    // Thresholds per badge
    const THRESHOLDS: Record<string, number> = {
      MENTOR: 50,
    };
    const threshold = THRESHOLDS[badge] ?? 100;

    // Grant badge if threshold reached and not already granted
    if (voteCount >= threshold) {
      await tx.userBadge.upsert({
        where: { userId_badge: { userId: targetId, badge: badge as any } },
        update: {},
        create: { userId: targetId, badge: badge as any },
      });
    }
  });

  updateTag(`profile-${targetId}`);
  return { success: "¡Aval enviado!" };
}
