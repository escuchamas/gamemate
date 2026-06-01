"use client";

import { useEffect, useRef } from "react";

const GAME_EMOJI: Record<string, string> = {
  MINECRAFT: "⛏️",
  PROJECT_ZOMBOID: "🧟",
  LEAGUE_OF_LEGENDS: "⚔️",
  OTHER: "🎮",
};

const SKILL_LABELS: Record<string, string> = {
  BEGINNER: "Principiante",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzado",
  EXPERT: "Experto",
};

export interface PartyPreview {
  id: string;
  name: string;
  game: string;
  skillLevel: string;
  memberCount: number;
  maxPlayers: number;
  creatorName: string | null;
  language: string;
}

interface Props {
  parties: PartyPreview[];
}

export function PartiesCarousel({ parties }: Props) {
  if (parties.length === 0) return null;

  // Duplicate enough times to fill any screen width
  const items = [...parties, ...parties, ...parties];

  return (
    <div className="w-full overflow-hidden py-6 select-none" aria-hidden="true">
      <p className="text-center text-xs text-[var(--muted-foreground)] uppercase tracking-widest mb-4">
        Parties activas ahora mismo
      </p>
      <div
        className="flex gap-4"
        style={{
          width: "max-content",
          animation: "carousel-scroll 40s linear infinite",
        }}
      >
        {items.map((party, i) => (
          <div
            key={`${party.id}-${i}`}
            className="flex-shrink-0 w-64 rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-4 flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{GAME_EMOJI[party.game] ?? "🎮"}</span>
              <span className="text-sm font-semibold text-white truncate">{party.name}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span>{SKILL_LABELS[party.skillLevel] ?? party.skillLevel}</span>
              <span className="font-medium text-orange-400">
                {party.memberCount}/{party.maxPlayers} jugadores
              </span>
            </div>
            {party.creatorName && (
              <p className="text-xs text-[var(--muted-foreground)] truncate">
                por {party.creatorName.split(" ")[0]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
