import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import Image from "next/image";
import {
  GAME_ICONS,
  GAME_LABELS,
  SKILL_LABELS,
  PARTY_STATUS_LABELS,
  LANGUAGE_FLAG,
  MINECRAFT_VERSION_LABELS,
  LOL_ROLE_LABELS,
  LOL_RANK_LABELS,
} from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";
import type { Game, SkillLevel, PartyStatus } from "@/generated/prisma/client";

const GAME_COVERS: Partial<Record<Game, string>> = {
  MINECRAFT: "/games/biome-minecraft.webp",
};

const GAME_LOGOS: Partial<Record<Game, string>> = {
  LEAGUE_OF_LEGENDS: "/games/logo lol.png",
  PROJECT_ZOMBOID: "/games/pz.png",
};

interface PartyCardProps {
  id: string;
  name: string;
  description: string | null;
  game: Game;
  skillLevel: SkillLevel;
  status: PartyStatus;
  memberCount: number;
  maxPlayers: number;
  language: string;
  minecraftVersion?: string | null;
  lolRoles?: string[];
  lolRankMin?: string | null;
  lolRankMax?: string | null;
  modded: boolean;
  gameLabel?: string | null;
  creatorName: string | null;
  creatorImage?: string | null;
  createdAt: Date;
}

const statusVariant: Record<PartyStatus, "success" | "warning" | "danger" | "default"> = {
  OPEN: "success",
  FULL: "warning",
  IN_GAME: "accent" as any,
  CLOSED: "danger",
};

export function PartyCard({
  id,
  name,
  description,
  game,
  skillLevel,
  status,
  memberCount,
  maxPlayers,
  language,
  minecraftVersion,
  lolRoles,
  lolRankMin,
  lolRankMax,
  modded,
  gameLabel,
  creatorName,
  creatorImage,
  createdAt,
}: PartyCardProps) {
  const cover = GAME_COVERS[game];

  return (
    <Link href={`/parties/${id}`} className="block group">
      <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] overflow-hidden hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/5">

        {/* Cover image / header */}
        {cover ? (
          <div className="relative h-28 w-full overflow-hidden">
            <Image
              src={cover}
              alt={GAME_LABELS[game]}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            {/* Name + badge on image */}
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-end justify-between gap-2">
              <h3 className="font-semibold text-sm text-white truncate group-hover:text-orange-300 transition-colors leading-tight">
                {name}
              </h3>
              <Badge variant={statusVariant[status]} className="flex-shrink-0">
                {PARTY_STATUS_LABELS[status]}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="px-4 pt-4 flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              {GAME_LOGOS[game] ? (
                <img
                  src={GAME_LOGOS[game]}
                  alt={GAME_LABELS[game]}
                  className="h-6 w-6 object-contain flex-shrink-0"
                />
              ) : (
                <span className="text-xl flex-shrink-0">{GAME_ICONS[game]}</span>
              )}
              <h3 className="font-semibold text-sm text-white truncate group-hover:text-orange-300 transition-colors">
                {name}
              </h3>
            </div>
            <Badge variant={statusVariant[status]}>
              {PARTY_STATUS_LABELS[status]}
            </Badge>
          </div>
        )}

        <div className="px-4 pb-4 pt-3 flex flex-col gap-3">
          {/* Description */}
          {description && (
            <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">
              {description}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="primary">{SKILL_LABELS[skillLevel]}</Badge>
            <Badge variant="default">{game === "OTHER" && gameLabel ? gameLabel : GAME_LABELS[game]}</Badge>
            <Badge variant="default">{LANGUAGE_FLAG[language] ?? language.toUpperCase()}</Badge>
            {minecraftVersion && <Badge variant="default">{MINECRAFT_VERSION_LABELS[minecraftVersion]}</Badge>}
            {lolRoles && lolRoles.length > 0 && lolRoles.map((r) => (
              <Badge key={r} variant="default">{LOL_ROLE_LABELS[r]}</Badge>
            ))}
            {(lolRankMin || lolRankMax) && (
              <Badge variant="default">
                {lolRankMin ? LOL_RANK_LABELS[lolRankMin] : "Cualquier"} → {lolRankMax ? LOL_RANK_LABELS[lolRankMax] : "cualquier rango"}
              </Badge>
            )}
            {modded && <Badge variant="accent">Mods</Badge>}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1">
              <span>👥</span>
              <span>{memberCount}/{maxPlayers} jugadores</span>
            </span>
            <span className="flex items-center gap-1.5">
              {creatorName && (
                <>
                  <Avatar image={creatorImage} name={creatorName} size="sm" className="w-5 h-5 text-[10px]" />
                  <span>{creatorName}</span>
                  <span>·</span>
                </>
              )}
              {formatRelativeTime(createdAt)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
