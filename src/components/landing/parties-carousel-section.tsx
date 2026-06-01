import { prisma } from "@/lib/prisma";
import { PartiesCarousel } from "./parties-carousel";

export async function PartiesCarouselSection() {
  const parties = await prisma.party.findMany({
    where: { status: { in: ["OPEN", "FULL", "IN_GAME"] } },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      name: true,
      game: true,
      skillLevel: true,
      maxPlayers: true,
      language: true,
      creator: { select: { name: true } },
      _count: { select: { members: true } },
    },
  });

  if (parties.length < 2) return null;

  const previews = parties.map((p) => ({
    id: p.id,
    name: p.name,
    game: p.game,
    skillLevel: p.skillLevel,
    memberCount: p._count.members,
    maxPlayers: p.maxPlayers,
    creatorName: p.creator.name,
    language: p.language,
  }));

  return <PartiesCarousel parties={previews} />;
}
