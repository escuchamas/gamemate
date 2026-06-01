"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveGamerProfileAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  const parse = (key: string) => {
    try { return JSON.parse(formData.get(key) as string || "[]") as string[]; }
    catch { return []; }
  };

  await prisma.gamerProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      gamesPlaying: parse("gamesPlaying"),
      gamesWanted: parse("gamesWanted"),
      weeklyHours: Number(formData.get("weeklyHours")) || null,
      schedule: parse("schedule"),
      gameCategories: parse("gameCategories"),
    },
    update: {
      gamesPlaying: parse("gamesPlaying"),
      gamesWanted: parse("gamesWanted"),
      weeklyHours: Number(formData.get("weeklyHours")) || null,
      schedule: parse("schedule"),
      gameCategories: parse("gameCategories"),
    },
  });

  revalidatePath("/profile");
}
