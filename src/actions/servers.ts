"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type ActionResult = { error?: string; success?: string };

function spanishDateString(): string {
  return new Date().toLocaleDateString("es-ES", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).split("/").reverse().join("-"); // "YYYY-MM-DD"
}

export async function createServerAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const game = formData.get("game") as string;
  const ip = (formData.get("ip") as string)?.trim() || null;
  const discordUrl = (formData.get("discordUrl") as string)?.trim() || null;
  const websiteUrl = (formData.get("websiteUrl") as string)?.trim() || null;
  const modded = formData.get("modded") === "true";
  const modsNote = (formData.get("modsNote") as string)?.trim() || null;
  const maxPlayersRaw = formData.get("maxPlayers");
  const maxPlayers = maxPlayersRaw ? Number(maxPlayersRaw) : null;

  if (!name || name.length < 3) return { error: "El nombre debe tener al menos 3 caracteres" };
  if (!description || description.length < 20) return { error: "La descripción debe tener al menos 20 caracteres" };
  if (!game || !["MINECRAFT", "PROJECT_ZOMBOID", "LEAGUE_OF_LEGENDS", "OTHER"].includes(game)) {
    return { error: "Selecciona un juego válido" };
  }
  if (discordUrl && !discordUrl.startsWith("https://discord")) {
    return { error: "El enlace de Discord debe empezar por https://discord" };
  }
  if (!discordUrl && !websiteUrl) {
    return { error: "Añade al menos un enlace de contacto (Discord o web)" };
  }
  if (websiteUrl && !websiteUrl.startsWith("http")) {
    return { error: "La URL de la web debe empezar por http" };
  }

  const server = await prisma.gameServer.create({
    data: {
      name,
      description,
      game: game as any,
      ip,
      discordUrl,
      websiteUrl,
      modded,
      modsNote,
      maxPlayers,
      language: "es",
      creatorId: session.user.id,
    },
    select: { id: true },
  });

  revalidatePath("/servers");
  redirect(`/servers/${server.id}`);
}

export async function voteServerAction(serverId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión para votar" };

  const today = spanishDateString();

  const existing = await prisma.serverVote.findUnique({
    where: { serverId_userId_date: { serverId, userId: session.user.id, date: today } },
    select: { id: true },
  });
  if (existing) return { error: "Ya has votado hoy por este servidor" };

  await prisma.$transaction([
    prisma.serverVote.create({
      data: { serverId, userId: session.user.id, date: today },
    }),
    prisma.gameServer.update({
      where: { id: serverId },
      data: { totalVotes: { increment: 1 } },
    }),
  ]);

  revalidatePath(`/servers/${serverId}`);
  revalidatePath("/servers");
  return { success: "¡Voto registrado!" };
}
