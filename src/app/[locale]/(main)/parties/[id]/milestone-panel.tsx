"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { updateMilestoneAction } from "@/actions/party";
import { GAME_MILESTONES } from "@/lib/constants";
import type { Game } from "@/generated/prisma/client";

interface Props {
  partyId: string;
  game: Game;
  currentMilestone: string | null;
  isLeader: boolean;
}

export function MilestonePanel({
  partyId,
  game,
  currentMilestone,
  isLeader,
}: Props) {
  const t = useTranslations("milestone");
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(currentMilestone ?? "");
  const [isPending, startTransition] = useTransition();

  const milestones = GAME_MILESTONES[game];

  const getMilestoneLabel = (id: string) => {
    try {
      return t(`${game}.${id}` as any);
    } catch {
      return id;
    }
  };

  const save = () => {
    if (!selected) return;
    startTransition(async () => {
      await updateMilestoneAction(partyId, selected);
      setEditing(false);
    });
  };

  return (
    <div className="rounded-xl bg-amber-600/10 border border-amber-500/30 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-lg">🎮</span>
          <h3 className="font-semibold text-amber-300">{t("title")}</h3>
        </div>
        {isLeader && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs px-2 py-1 rounded-lg border border-amber-500/30 text-amber-400 hover:border-amber-400 transition-colors"
          >
            {t("update")}
          </button>
        )}
      </div>

      {!editing ? (
        <>
          <p className="text-sm text-[var(--muted-foreground)] mb-2">
            {t("banner")}
          </p>
          <div className="rounded-lg bg-amber-600/10 border border-amber-500/20 px-4 py-3 text-center">
            <p className="text-lg font-semibold text-white">
              {currentMilestone
                ? getMilestoneLabel(currentMilestone)
                : t("notSet")}
            </p>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-2">
            {milestones.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSelected(m)}
                className={`text-left px-3 py-2 rounded-lg text-sm transition-all border ${
                  selected === m
                    ? "bg-amber-600/20 border-amber-500/50 text-white"
                    : "bg-[var(--muted)] border-[var(--card-border)] text-[var(--muted-foreground)] hover:border-amber-500/30"
                }`}
              >
                {getMilestoneLabel(m)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={isPending || !selected}
              className="flex-1 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-500 transition-colors disabled:opacity-50"
            >
              {isPending ? "..." : t("update")}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setSelected(currentMilestone ?? "");
              }}
              className="px-4 py-2 rounded-lg border border-[var(--card-border)] text-[var(--muted-foreground)] text-sm hover:text-[var(--foreground)] transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
