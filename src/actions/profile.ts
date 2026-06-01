"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gameProfileSchema } from "@/lib/validations";
import { z } from "zod";
import { updateTag } from "next/cache";
import { Resend } from "resend";

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

export async function updateProfileImageAction(
  imageUrl: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  if (!imageUrl.startsWith("https://res.cloudinary.com/")) {
    return { error: "URL de imagen no válida" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: imageUrl },
  });

  updateTag(`profile-${session.user.id}`);
  return { success: "Foto actualizada" };
}

export async function updateGameProfileAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  const tagsRaw = formData.get("tags");
  const game = formData.get("game") as string;
  const lolRank = formData.get("lolRank") as string | null;

  // For LoL, derive skillLevel from lolRank since they don't have a separate skill step
  const derivedSkillLevel = game === "LEAGUE_OF_LEGENDS" && lolRank
    ? (["IRON", "BRONZE", "SILVER"].includes(lolRank) ? "BEGINNER"
      : ["GOLD", "PLATINUM"].includes(lolRank) ? "INTERMEDIATE"
      : ["EMERALD", "DIAMOND"].includes(lolRank) ? "ADVANCED"
      : "EXPERT")
    : formData.get("skillLevel");

  const raw = {
    game,
    skillLevel: derivedSkillLevel,
    playtimeHours: formData.get("playtimeHours")
      ? Number(formData.get("playtimeHours"))
      : undefined,
    modded: formData.get("modded") === "true",
    modsNote: formData.get("modsNote") || undefined,
    minecraftStyle: formData.get("minecraftStyle") || undefined,
    pzStyle: formData.get("pzStyle") || undefined,
    lolRank: lolRank || undefined,
    lolRole: formData.get("lolRole") || undefined,
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

  const isNew = !(await prisma.rating.findUnique({
    where: {
      raterId_ratedId_partyId: {
        raterId: session.user.id,
        ratedId: parsed.data.ratedId,
        partyId: parsed.data.partyId ?? "",
      },
    },
    select: { id: true },
  }));

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

  // Send email only on first rating, not edits
  if (!isNew) return { success: "Valoración actualizada" };

  try {
    const [ratedUser, raterUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: parsed.data.ratedId },
        select: { email: true, name: true },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true },
      }),
    ]);

    if (ratedUser) {
      const TRAITS: { key: keyof typeof parsed.data; emoji: string; label: string }[] = [
        { key: "levelMatch",   emoji: "🎯", label: "Nivel como prometió" },
        { key: "friendliness", emoji: "😊", label: "Buen rollo" },
        { key: "funFactor",    emoji: "🔥", label: "Muy divertido" },
        { key: "reliability",  emoji: "✅", label: "Responsable" },
      ];
      const endorsed = TRAITS.filter((t) => (parsed.data[t.key] as number) >= 5);
      const endorsedHtml = endorsed.length > 0
        ? endorsed.map((t) => `<span style="display:inline-block;background:#1c1c2e;border:1px solid #374151;border-radius:8px;padding:6px 12px;margin:4px;font-size:13px">${t.emoji} ${t.label}</span>`).join("")
        : "";

      const base = process.env.AUTH_URL ?? "https://gamemate.es";
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "GameMate <noreply@gamemate.es>",
        to: ratedUser.email,
        subject: `${raterUser?.name ?? "Alguien"} te ha valorado en GameMate ⭐`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f0f13;color:#e8e8f0;border-radius:12px">
            <div style="text-align:center;margin-bottom:24px">
              <img src="https://gamemate.es/apple-icon.png" alt="GameMate" style="width:64px;height:64px;border-radius:50%"/>
            </div>
            <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 8px">¡Te han valorado, ${ratedUser.name ?? "gamer"}! ⭐</h1>
            <p style="color:#a0a0b8;margin:0 0 20px;line-height:1.6">
              <strong style="color:#ffffff">${raterUser?.name ?? "Un compañero"}</strong> ha dejado una valoración sobre ti.
            </p>
            ${endorsedHtml ? `
            <div style="margin:0 0 20px">
              <p style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 10px">Lo que destacó</p>
              <div>${endorsedHtml}</div>
            </div>` : ""}
            ${parsed.data.comment ? `
            <div style="background:#1c1c2e;border-left:3px solid #ea580c;border-radius:4px;padding:12px 16px;margin:0 0 24px">
              <p style="color:#e8e8f0;font-size:14px;margin:0;font-style:italic">"${parsed.data.comment}"</p>
            </div>` : ""}
            <a href="${base}/es/profile" style="display:inline-block;background:#ea580c;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">
              Ver mi reputación →
            </a>
            <p style="color:#6b7280;font-size:12px;margin-top:32px">
              Si no esperabas este email, puedes ignorarlo.
            </p>
          </div>
        `,
      });
    }
  } catch {
    // No bloquear el flujo si el email falla
  }

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

    const threshold = 15;

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
