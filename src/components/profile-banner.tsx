"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";

const DISMISS_KEY = "gamemate_profile_banner_dismissed";

export function ProfileBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(DISMISS_KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="border-b border-orange-500/20 bg-orange-500/5">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <span className="text-orange-400 flex-shrink-0 mt-0.5 sm:mt-0">💡</span>
          <div>
            <p className="text-sm text-white font-medium">
              Completa tu perfil de jugador para unirte a parties
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Los miembros revisan tu perfil antes de aceptarte — sin él no podrás solicitar unirte. Puedes saltarte este paso por ahora.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/profile"
            className="px-3 py-1.5 text-xs rounded-lg bg-orange-600 text-white hover:bg-orange-500 transition-colors font-medium whitespace-nowrap"
          >
            Completar perfil
          </Link>
          <button
            onClick={dismiss}
            className="text-[var(--muted-foreground)] hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
