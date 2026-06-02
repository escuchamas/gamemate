"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const GAME_VALUES = ["MINECRAFT", "PROJECT_ZOMBOID", "LEAGUE_OF_LEGENDS", "OTHER"] as const;
const GAME_EMOJIS: Record<string, string> = {
  MINECRAFT: "⛏️",
  PROJECT_ZOMBOID: "🧟",
  LEAGUE_OF_LEGENDS: "⚔️",
  OTHER: "🎮",
};

const SKILLS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const;

export function PartiesFilter({ game, skill }: { game?: string; skill?: string }) {
  const router = useRouter();
  const tp = useTranslations("parties");
  const ts = useTranslations("skill");
  const tg = useTranslations("games");

  function update(newGame: string, newSkill: string) {
    const params = new URLSearchParams();
    if (newGame) params.set("game", newGame);
    if (newSkill) params.set("skill", newSkill);
    router.push(`/parties${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <select
        value={game ?? ""}
        onChange={(e) => update(e.target.value, skill ?? "")}
        className="px-3 py-2 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
      >
        <option value="">🎮 {tp("allGames")}</option>
        {GAME_VALUES.map((g) => (
          <option key={g} value={g}>{GAME_EMOJIS[g]} {tg(g)}</option>
        ))}
      </select>

      <select
        value={skill ?? ""}
        onChange={(e) => update(game ?? "", e.target.value)}
        className="px-3 py-2 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
      >
        <option value="">⭐ {tp("allLevels")}</option>
        {SKILLS.map((s) => (
          <option key={s} value={s}>{ts(s)}</option>
        ))}
      </select>
    </div>
  );
}
