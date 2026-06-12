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
  openGraph: {
    title: "Parties activas – Busca equipo para Minecraft, LoL y Project Zomboid",
    description: "Encuentra parties de Minecraft, League of Legends y Project Zomboid a tu nivel. Filtra por juego, nivel y idioma. Únete a jugadores verificados.",
    url: "https://gamemate.es/es/parties",
    siteName: "GameMate",
    type: "website",
    images: [{ url: "https://gamemate.es/games/biome-minecraft.webp", width: 800, height: 400 }],
  },
  twitter: { card: "summary_large_image", title: "Parties activas | GameMate", description: "Encuentra tu equipo para Minecraft, LoL y Project Zomboid." },
};

const PARTY_SELECT = {
  id: true, name: true, description: true, game: true, gameLabel: true,
  skillLevel: true, status: true, maxPlayers: true, language: true,
  minecraftVersion: true, lolRoles: true, lolRankMin: true, lolRankMax: true,
  modded: true, createdAt: true,
  creator: { select: { name: true, image: true, email: true } },
  _count: { select: { members: true } },
} as const;

const DEMO_DOMAIN = "@gamemate-demo.fake";
const TARGET_VISIBLE = 15; // parties visibles totales mínimas

const VALID_STATUSES = ["OPEN", "FULL", "IN_GAME"] as const;
type ValidStatus = typeof VALID_STATUSES[number];

interface PartiesPageProps {
  searchParams: Promise<{
    game?: string;
    skill?: string;
    lang?: string;
    tab?: string;
    status?: string;
  }>;
}

export default async function PartiesPage({ searchParams }: PartiesPageProps) {
  const params = await searchParams;
  const session = await auth();
  if (!session) redirect("/login");
  const t = await getTranslations("parties");

  const isMine = params.tab === "mine";
  const statusFilter = VALID_STATUSES.includes(params.status as ValidStatus)
    ? [params.status as ValidStatus]
    : ["OPEN", "FULL", "IN_GAME"];

  const gameFilter = (!isMine && params.game && ["MINECRAFT", "PROJECT_ZOMBOID", "LEAGUE_OF_LEGENDS", "OTHER"].includes(params.game))
    ? params.game : undefined;
  const skillFilter = (!isMine && params.skill && ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"].includes(params.skill))
    ? params.skill : undefined;

  const baseWhere: Record<string, unknown> = { status: { in: statusFilter } };
  if (gameFilter) baseWhere.game = gameFilter;
  if (skillFilter) baseWhere.skillLevel = skillFilter;
  if (!isMine && params.lang) baseWhere.language = params.lang;

  const allParties = await prisma.party.findMany({
    where: isMine
      ? { members: { some: { userId: session.user.id } }, status: { in: statusFilter as any } }
      : { ...baseWhere, status: { in: statusFilter as any } },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: PARTY_SELECT,
  });

  let parties;
  if (isMine) {
    parties = allParties;
  } else {
    const realParties = allParties.filter(p => !p.creator.email?.endsWith(DEMO_DOMAIN));
    const demoParties = allParties.filter(p => p.creator.email?.endsWith(DEMO_DOMAIN));
    // Reales primero, demo rellenan hasta TARGET_VISIBLE
    const demoSlots = Math.max(0, TARGET_VISIBLE - realParties.length);
    parties = [...realParties, ...demoParties.slice(0, demoSlots)];
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">{t("title")}</h1>
        <Link href="/parties/new">
          <Button size="sm">{t("createButton")}</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--muted)] rounded-xl p-1 w-fit">
        <Link
          href="/parties"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            !isMine ? "bg-[var(--card)] text-white shadow-sm" : "text-[var(--muted-foreground)] hover:text-white"
          }`}
        >
          {t("allParties")}
        </Link>
        <Link
          href="/parties?tab=mine"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isMine ? "bg-[var(--card)] text-white shadow-sm" : "text-[var(--muted-foreground)] hover:text-white"
          }`}
        >
          {t("myParties")}
        </Link>
      </div>

      {/* Filters — only on "all" tab */}
      {!isMine && <PartiesFilter game={params.game} skill={params.skill} status={params.status} />}

      {/* Count */}
      <p className="text-sm text-[var(--muted-foreground)] -mt-2">
        {isMine
          ? t("myActive", { count: parties.length })
          : t("waiting", { count: parties.length })}
      </p>

      {parties.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <p className="text-4xl mb-3">{isMine ? "🎮" : "😴"}</p>
          <p className="font-medium text-white mb-1">
            {isMine ? t("empty.myTitle") : t("empty.title")}
          </p>
          <p className="text-sm mb-4">
            {isMine ? t("empty.mySubtitle") : t("empty.subtitle")}
          </p>
          <Link href={isMine ? "/parties" : "/parties/new"}>
            <Button>{isMine ? t("empty.myCta") : t("empty.cta")}</Button>
          </Link>
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
