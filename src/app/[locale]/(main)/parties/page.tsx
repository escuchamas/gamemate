import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PartyCard } from "@/components/party/party-card";
import { Button } from "@/components/ui/button";
import { GAME_LABELS, SKILL_LABELS } from "@/lib/constants";
import { PartiesFilter } from "./parties-filter";
import { Link } from "@/i18n/navigation";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Game, SkillLevel } from "@/generated/prisma/client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parties activas – Busca equipo para Minecraft, LoL y Project Zomboid",
  description:
    "Encuentra parties de Minecraft, League of Legends y Project Zomboid a tu nivel. Filtra por juego, nivel y idioma. Únete a jugadores verificados.",
};

interface PartiesPageProps {
  searchParams: Promise<{
    game?: string;
    skill?: string;
    lang?: string;
  }>;
}

export default async function PartiesPage({ searchParams }: PartiesPageProps) {
  const params = await searchParams;
  const session = await auth();
  if (!session) redirect("/login");
  const t = await getTranslations("parties");

  const where: Record<string, unknown> = { status: "OPEN" };
  if (params.game && ["MINECRAFT", "PROJECT_ZOMBOID", "LEAGUE_OF_LEGENDS", "OTHER"].includes(params.game)) {
    where.game = params.game;
  }
  if (
    params.skill &&
    ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"].includes(params.skill)
  ) {
    where.skillLevel = params.skill;
  }
  if (params.lang) {
    where.language = params.lang;
  }

  const parties = await prisma.party.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true, name: true, description: true, game: true, gameLabel: true,
      skillLevel: true, status: true, maxPlayers: true, language: true,
      minecraftVersion: true, lolRoles: true, lolRankMin: true, lolRankMax: true,
      modded: true, createdAt: true,
      creator: { select: { name: true, image: true } },
      _count: { select: { members: true } },
    },
  });

  const games: { value: Game; label: string }[] = [
    { value: "MINECRAFT", label: "⛏️ Minecraft" },
    { value: "PROJECT_ZOMBOID", label: "🧟 Project Zomboid" },
    { value: "LEAGUE_OF_LEGENDS", label: "⚔️ League of Legends" },
    { value: "OTHER", label: "🎮 Otro juego" },
  ];
  const skills: SkillLevel[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{t("title")}</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              {t("waiting", { count: parties.length })}
            </p>
          </div>
          {session ? (
            <Link href="/parties/new">
              <Button size="sm">{t("createButton")}</Button>
            </Link>
          ) : (
            <Link
              href="/register"
              className="px-4 py-2 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-500 transition-colors"
            >
              {t("joinToCreate")}
            </Link>
          )}
        </div>

        <PartiesFilter game={params.game} skill={params.skill} />
      </div>

      {parties.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <p className="text-4xl mb-3">😴</p>
          <p className="font-medium text-white mb-1">{t("empty.title")}</p>
          <p className="text-sm mb-4">{t("empty.subtitle")}</p>
          {session ? (
            <Link href="/parties/new">
              <Button>{t("empty.cta")}</Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button>{t("empty.ctaGuest")}</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {parties.map((party) => (
            <PartyCard
              key={party.id}
              id={party.id}
              name={party.name}
              description={party.description}
              game={party.game}
              skillLevel={party.skillLevel}
              status={party.status}
              memberCount={party._count.members}
              maxPlayers={party.maxPlayers}
              language={party.language}
              minecraftVersion={party.minecraftVersion}
              lolRoles={party.lolRoles}
              lolRankMin={party.lolRankMin}
              lolRankMax={party.lolRankMax}
              modded={party.modded}
              gameLabel={party.gameLabel}
              creatorName={party.creator.name}
              creatorImage={party.creator.image}
              createdAt={party.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterLink({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        active
          ? "bg-orange-600 text-white"
          : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      }`}
    >
      {label}
    </Link>
  );
}
