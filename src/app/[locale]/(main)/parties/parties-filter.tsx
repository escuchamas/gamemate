"use client";

import { useRouter } from "next/navigation";
import { SKILL_LABELS } from "@/lib/constants";

const GAMES = [
  { value: "MINECRAFT", label: "⛏️ Minecraft" },
  { value: "PROJECT_ZOMBOID", label: "🧟 Project Zomboid" },
  { value: "LEAGUE_OF_LEGENDS", label: "⚔️ League of Legends" },
  { value: "OTHER", label: "🎮 Otro juego" },
];

const SKILLS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const;

export function PartiesFilter({ game, skill }: { game?: string; skill?: string }) {
  const router = useRouter();

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
        <option value="">🎮 Todos los juegos</option>
        {GAMES.map((g) => (
          <option key={g.value} value={g.value}>{g.label}</option>
        ))}
      </select>

      <select
        value={skill ?? ""}
        onChange={(e) => update(game ?? "", e.target.value)}
        className="px-3 py-2 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
      >
        <option value="">⭐ Todos los niveles</option>
        {SKILLS.map((s) => (
          <option key={s} value={s}>{SKILL_LABELS[s]}</option>
        ))}
      </select>
    </div>
  );
}
