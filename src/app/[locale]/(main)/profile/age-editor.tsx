"use client";

import { useState, useTransition } from "react";
import { updateAgeAction } from "@/actions/profile";
import { useRouter } from "@/i18n/navigation";

interface Props {
  currentAge: number | null;
}

export function AgeEditor({ currentAge }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentAge?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const save = () => {
    const age = parseInt(value, 10);
    setError(null);
    startTransition(async () => {
      const result = await updateAgeAction(age);
      if (result.error) {
        setError(result.error);
      } else {
        setEditing(false);
        router.refresh();
      }
    });
  };

  const cancel = () => {
    setValue(currentAge?.toString() ?? "");
    setError(null);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <span>🎂</span>
        <span>{currentAge ? `${currentAge} años` : "Edad no indicada"}</span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
        >
          {currentAge ? "Editar" : "Añadir edad"}
        </button>
        {!currentAge && (
          <span className="text-xs text-amber-400">— algunas parties lo requieren</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
          min={13}
          max={99}
          autoFocus
          className="px-2 py-1 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-20"
          placeholder="25"
        />
        <span className="text-sm text-[var(--muted-foreground)]">años</span>
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
        >
          {isPending ? "..." : "Guardar"}
        </button>
        <button
          type="button"
          onClick={cancel}
          className="px-2.5 py-1 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-white text-xs transition-colors"
        >
          Cancelar
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
