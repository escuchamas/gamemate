"use client";

import { useActionState, useState } from "react";
import { createSuggestionAction } from "@/actions/suggestions";

export function SuggestionForm() {
  const [state, action, pending] = useActionState(createSuggestionAction, {});
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 rounded-xl border border-dashed border-[var(--card-border)] text-sm text-[var(--muted-foreground)] hover:text-white hover:border-orange-500/50 transition-colors"
      >
        + Nueva petición
      </button>
    );
  }

  return (
    <form
      action={async (fd) => {
        await action(fd);
        setOpen(false);
      }}
      className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5 flex flex-col gap-3"
    >
      <h3 className="font-semibold text-white">Nueva petición</h3>

      <input
        name="title"
        placeholder="Título (ej: Añadir Terraria)"
        maxLength={100}
        required
        className="w-full bg-[var(--muted)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-orange-500"
      />

      <textarea
        name="description"
        placeholder="Describe tu idea con detalle..."
        maxLength={1000}
        required
        rows={3}
        className="w-full bg-[var(--muted)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
      />

      <select
        name="category"
        className="w-full bg-[var(--muted)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
      >
        <option value="NEW_GAME">🎮 Nuevo juego</option>
        <option value="FEATURE">✨ Nueva función</option>
        <option value="DESIGN">🎨 Diseño</option>
        <option value="OTHER">💡 Otra idea</option>
      </select>

      {state.error && <p className="text-xs text-red-400">{state.error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-500 transition-colors disabled:opacity-50"
        >
          {pending ? "Enviando..." : "Enviar"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] text-sm hover:text-white transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
