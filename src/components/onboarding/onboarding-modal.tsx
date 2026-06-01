"use client";

import { useState } from "react";
import { GamerProfileWizard } from "./gamer-profile-wizard";

export function OnboardingModal() {
  const [done, setDone] = useState(false);

  if (done) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[var(--background)] border border-[var(--card-border)] rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <div className="text-3xl mb-2">🎮</div>
          <h1 className="text-xl font-bold text-white">Cuéntanos sobre ti, gamer</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Solo te llevará 2 minutos. Esto nos ayuda a mostrarte parties y jugadores afines.
          </p>
        </div>
        <GamerProfileWizard onComplete={() => setDone(true)} />
      </div>
    </div>
  );
}
