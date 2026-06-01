"use client";

import { useState } from "react";
import { sendFriendRequestAction } from "@/actions/friends";

export function AddFriendForm({ targetId }: { targetId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <span className="text-xs text-green-400 px-3 py-1 rounded-lg border border-green-500/30 bg-green-500/10">
        Solicitud enviada
      </span>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1 text-xs rounded-lg bg-orange-600 text-white hover:bg-orange-500 transition-colors"
      >
        + Añadir amigo
      </button>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        const fd = new FormData(e.currentTarget);
        await sendFriendRequestAction(targetId, fd);
        setSent(true);
        setPending(false);
      }}
      className="flex flex-col gap-2 items-end"
    >
      <textarea
        name="note"
        placeholder="Añade una nota (opcional)..."
        maxLength={200}
        rows={2}
        autoFocus
        className="w-56 px-3 py-2 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-xs text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-1 text-xs rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-white transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="px-3 py-1 text-xs rounded-lg bg-orange-600 text-white hover:bg-orange-500 transition-colors disabled:opacity-50"
        >
          {pending ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </form>
  );
}
