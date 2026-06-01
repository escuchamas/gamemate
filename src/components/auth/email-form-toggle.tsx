"use client";

import { useState } from "react";

export function EmailFormToggle({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-transparent text-[var(--muted-foreground)] text-sm hover:text-white hover:border-white/20 transition-colors"
      >
        <span>{open ? "▲" : "▼"}</span>
        Continuar con email
      </button>

      {open && (
        <div className="flex flex-col gap-4 pt-1">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[var(--card-border)]" />
            <span className="text-xs text-[var(--muted-foreground)]">con email</span>
            <div className="flex-1 h-px bg-[var(--card-border)]" />
          </div>
          {children}
        </div>
      )}
    </div>
  );
}
