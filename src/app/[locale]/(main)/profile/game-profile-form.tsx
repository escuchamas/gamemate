"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { updateGameProfileAction } from "@/actions/profile";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  PLAYER_TAGS,
  MINECRAFT_STYLE_LABELS,
  PZ_STYLE_LABELS,
} from "@/lib/constants";
import type { Game, GameProfile } from "@/generated/prisma/client";

interface Props {
  game: Game;
  existing: GameProfile | null;
}

export function GameProfileForm({ game, existing }: Props) {
  const [state, action, isPending] = useActionState(updateGameProfileAction, {});
  const [selectedTags, setSelectedTags] = useState<Set<string>>(
    new Set(existing?.tags ?? [])
  );
  const t = useTranslations("profile.gameProfile");
  const tProfile = useTranslations("profile");
  const tCommon = useTranslations("common");

  const tags = PLAYER_TAGS[game];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else if (next.size < 8) next.add(tag);
      return next;
    });
  };

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="game" value={game} />
      <input
        type="hidden"
        name="tags"
        value={JSON.stringify(Array.from(selectedTags))}
      />

      {state.error && (
        <p className="text-sm text-red-400">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm text-green-400">{state.success}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Select
          name="skillLevel"
          label={t("level")}
          defaultValue={existing?.skillLevel ?? "BEGINNER"}
          options={[
            { value: "BEGINNER", label: "Principiante" },
            { value: "INTERMEDIATE", label: "Intermedio" },
            { value: "ADVANCED", label: "Avanzado" },
            { value: "EXPERT", label: "Experto" },
          ]}
        />
        <Input
          name="playtimeHours"
          type="number"
          label={t("playtime")}
          placeholder="500"
          defaultValue={existing?.playtimeHours?.toString() ?? ""}
          min={0}
          max={99999}
        />
      </div>

      {game === "MINECRAFT" && (
        <Select
          name="minecraftStyle"
          label={t("style")}
          defaultValue={existing?.minecraftStyle ?? ""}
          options={Object.entries(MINECRAFT_STYLE_LABELS).map(([v, l]) => ({
            value: v,
            label: l,
          }))}
          placeholder="Elige tu modo"
        />
      )}

      {game === "PROJECT_ZOMBOID" && (
        <Select
          name="pzStyle"
          label={t("pzStyle")}
          defaultValue={existing?.pzStyle ?? ""}
          options={Object.entries(PZ_STYLE_LABELS).map(([v, l]) => ({
            value: v,
            label: l,
          }))}
          placeholder="Elige tu estilo"
        />
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[var(--foreground)]">
            {t("tagsLabel")}
          </label>
          <span className="text-xs text-[var(--muted-foreground)]">
            {selectedTags.size}/8
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border cursor-pointer ${
                selectedTags.has(tag)
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--card-border)] hover:border-indigo-500/50"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="modded"
            value="true"
            defaultChecked={existing?.modded ?? false}
            className="w-4 h-4 accent-indigo-600"
          />
          <span className="text-sm text-[var(--foreground)]">{t("modded")}</span>
        </label>
      </div>
      <input
        type="hidden"
        name="modded"
        value={existing?.modded ? "true" : "false"}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--foreground)]">
          {t("notes")}
        </label>
        <textarea
          name="notes"
          defaultValue={existing?.notes ?? ""}
          placeholder={t("notesPlaceholder")}
          className="w-full px-3 py-2 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          rows={2}
          maxLength={300}
        />
      </div>

      <Button type="submit" loading={isPending} size="sm">
        {existing ? tProfile("saveChanges") : tCommon("create")}
      </Button>
    </form>
  );
}
