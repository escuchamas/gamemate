import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  GAME_ICONS,
  GAME_LABELS,
  SKILL_LABELS,
  PARTY_STATUS_LABELS,
  LANGUAGE_FLAG,
} from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";
import type { Game, SkillLevel, PartyStatus } from "@/generated/prisma/client";

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
  modded: boolean;
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
  modded,
  creatorName,
  creatorImage,
  createdAt,
}: PartyCardProps) {
  return (
    <Link href={`/parties/${id}`} className="block group">
      <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-4 hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl flex-shrink-0">{GAME_ICONS[game]}</span>
            <h3 className="font-semibold text-sm text-white truncate group-hover:text-orange-300 transition-colors">
              {name}
            </h3>
          </div>
          <Badge variant={statusVariant[status]}>
            {PARTY_STATUS_LABELS[status]}
          </Badge>
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mb-3">
            {description}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge variant="primary">{SKILL_LABELS[skillLevel]}</Badge>
          <Badge variant="default">{GAME_LABELS[game]}</Badge>
          <Badge variant="default">{LANGUAGE_FLAG[language] ?? language.toUpperCase()}</Badge>
          {modded && <Badge variant="accent">Mods</Badge>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1">
            <span>👥</span>
            <span>
              {memberCount}/{maxPlayers} jugadores
            </span>
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
    </Link>
  );
}
