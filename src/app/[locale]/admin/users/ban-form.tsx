"use client";

import { useState, useTransition } from "react";
import { banUserAction } from "@/actions/admin";

const BAN_REASONS = [
  "Comportamiento tóxico o agresivo",
  "Acoso a otros usuarios",
  "Spam o flood en el chat",
  "Contenido inapropiado u ofensivo",
  "Trampas o exploits",
  "Múltiples cuentas (ban evasion)",
  "Suplantación de identidad",
  "Incumplimiento reiterado de normas",
];

export function BanForm({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleBan = () => {
    if (!reason) return;
    const fullReason = details.trim() ? `${reason} — ${details.trim()}` : reason;
    startTransition(async () => {
      await banUserAction(userId, fullReason);
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-red-400 hover:text-red-300 transition-colors text-left"
      >
        Banear
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-60 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="px-2 py-1.5 rounded text-xs bg-[var(--muted)] border border-[var(--card-border)] text-white focus:outline-none focus:ring-1 focus:ring-red-500"
      >
        <option value="">Selecciona un motivo...</option>
        {BAN_REASONS.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Detalles adicionales (opcional)..."
        rows={2}
        maxLength={300}
        className="px-2 py-1.5 rounded text-xs bg-[var(--muted)] border border-[var(--card-border)] text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
      />
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleBan}
          disabled={!reason || isPending}
          className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-40 font-medium"
        >
          {isPending ? "Baneando..." : "Confirmar ban"}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setReason(""); setDetails(""); }}
          className="text-xs text-[var(--muted-foreground)] hover:text-white transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
