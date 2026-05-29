"use client";

import { useActionState } from "react";
import { createSuggestionAction } from "@/actions/suggestions";

export function SuggestionForm() {
  const [state, action, pending] = useActionState(createSuggestionAction, {});

  if (state.success) {
    return (
      <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-8 text-center flex flex-col items-center gap-3">
        <span className="text-4xl">✅</span>
        <p className="font-semibold text-white">Petición recibida</p>
        <p className="text-sm text-[var(--muted-foreground)]">
          Gracias por tu propuesta. La revisaremos y si encaja la añadiremos a la hoja de ruta.
        </p>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5 flex flex-col gap-4"
    >
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
        rows={4}
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

      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-500 transition-colors disabled:opacity-50"
      >
        {pending ? "Enviando..." : "Enviar petición"}
      </button>
    </form>
  );
}
