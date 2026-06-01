"use client";

import { useState, useTransition } from "react";
import { updateDisplayNameAction } from "@/actions/profile";
import { useRouter } from "@/i18n/navigation";

interface Props {
  currentName: string | null;
}

export function NameEditor({ currentName }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentName ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const save = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateDisplayNameAction(value);
      if (result.error) {
        setError(result.error);
      } else {
        setEditing(false);
        router.refresh();
      }
    });
  };

  const cancel = () => {
    setValue(currentName ?? "");
    setError(null);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-white">{currentName}</h1>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-[var(--muted-foreground)] hover:text-white transition-colors"
          aria-label="Editar nombre"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
          maxLength={32}
          autoFocus
          className="px-2 py-1 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 w-48"
        />
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
