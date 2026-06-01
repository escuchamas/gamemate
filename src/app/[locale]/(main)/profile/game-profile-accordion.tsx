"use client";

import { useState } from "react";
import { GameProfileWizard } from "./game-profile-wizard";
import { GAME_ICONS, GAME_LABELS } from "@/lib/constants";

type Game = "MINECRAFT" | "PROJECT_ZOMBOID" | "LEAGUE_OF_LEGENDS";

interface Props {
  game: Game;
  existing: Record<string, unknown> | null;
  initialOpen?: boolean;
  editLabel: string;
  createLabel: string;
}

export function GameProfileAccordion({ game, existing, initialOpen = false, editLabel, createLabel }: Props) {
  const [open, setOpen] = useState(initialOpen);

  return (
    <div className={`rounded-xl border transition-colors ${
      open ? "bg-[var(--card)] border-[var(--card-border)]" : "bg-[var(--card)] border-[var(--card-border)]"
    }`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{GAME_ICONS[game]}</span>
          <div>
            <p className="font-medium text-white">
              {existing ? editLabel : createLabel} {GAME_LABELS[game]}
            </p>
            {existing ? (
              <p className="text-xs text-green-400 mt-0.5">✓ Perfil completado</p>
            ) : (
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Sin completar — solo necesario si quieres unirte a parties</p>
            )}
          </div>
        </div>
        <span className={`text-[var(--muted-foreground)] transition-transform text-sm ${open ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5">
          <div className="border-t border-[var(--card-border)] pt-5">
            <GameProfileWizard game={game} existing={existing as any} />
          </div>
        </div>
      )}
    </div>
  );
}
