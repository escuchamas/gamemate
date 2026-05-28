import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PartyCard } from "@/components/party/party-card";
import { Button } from "@/components/ui/button";
import { GAME_ICONS, GAME_LABELS, SKILL_LABELS } from "@/lib/constants";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { Game, SkillLevel } from "@/generated/prisma/client";

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
  const t = await getTranslations("parties");

  const where: Record<string, unknown> = { status: "OPEN" };
  if (params.game && ["MINECRAFT", "PROJECT_ZOMBOID"].includes(params.game)) {
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
    include: {
      creator: { select: { name: true } },
      _count: { select: { members: true } },
    },
  });

  const games: Game[] = ["MINECRAFT", "PROJECT_ZOMBOID"];
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
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
            >
              {t("joinToCreate")}
            </Link>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterLink
            label={t("allGames")}
            href="/parties"
            active={!params.game}
          />
          {games.map((g) => (
            <FilterLink
              key={g}
              label={`${GAME_ICONS[g]} ${GAME_LABELS[g]}`}
              href={`/parties?game=${g}`}
              active={params.game === g}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterLink
            label={t("allLevels")}
            href={params.game ? `/parties?game=${params.game}` : "/parties"}
            active={!params.skill}
          />
          {skills.map((s) => (
            <FilterLink
              key={s}
              label={SKILL_LABELS[s]}
              href={
                params.game
                  ? `/parties?game=${params.game}&skill=${s}`
                  : `/parties?skill=${s}`
              }
              active={params.skill === s}
            />
          ))}
        </div>
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
              modded={party.modded}
              creatorName={party.creator.name}
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
          ? "bg-indigo-600 text-white"
          : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      }`}
    >
      {label}
    </Link>
  );
}
