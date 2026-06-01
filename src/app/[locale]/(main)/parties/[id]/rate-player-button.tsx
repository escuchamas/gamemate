"use client";

import { useState, useActionState } from "react";
import { ratePlayerAction } from "@/actions/profile";

const TRAITS = [
  { key: "levelMatch",   emoji: "🎯", label: "Nivel como prometió",   desc: "Jugó al nivel que decía tener" },
  { key: "friendliness", emoji: "😊", label: "Buen rollo",            desc: "Agradable, sin toxicidad" },
  { key: "funFactor",    emoji: "🔥", label: "Muy divertido",         desc: "Fue un placer jugar con él/ella" },
  { key: "reliability",  emoji: "✅", label: "Responsable",           desc: "Avisó, se conectó, cumplió" },
] as const;

type TraitKey = (typeof TRAITS)[number]["key"];

interface ExistingRating {
  overallRating?: number;
  levelMatch: number;
  friendliness: number;
  funFactor: number;
  reliability: number;
  comment: string | null;
}

interface Props {
  ratedId: string;
  ratedName: string;
  partyId: string;
  existingRating: ExistingRating | null;
}

export function RatePlayerButton({ ratedId, ratedName, partyId, existingRating }: Props) {
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(existingRating?.overallRating ?? 5);
  const [hoverStar, setHoverStar] = useState(0);
  const [endorsed, setEndorsed] = useState<Set<TraitKey>>(
    () => new Set(
      (Object.entries(existingRating ?? {}) as [TraitKey, number][])
        .filter(([k, v]) => TRAITS.some(t => t.key === k) && v >= 5)
        .map(([k]) => k)
    )
  );
  const [comment, setComment] = useState(existingRating?.comment ?? "");
  const [saved, setSaved] = useState(false);

  const [state, action, isPending] = useActionState(ratePlayerAction, {});

  const alreadyRated = !!existingRating;

  if (saved || (state.success && !open)) {
    return (
      <button
        type="button"
        onClick={() => { setSaved(false); setOpen(true); }}
        className="text-xs text-green-400 hover:text-orange-400 transition-colors flex items-center gap-1"
      >
        ✓ Valorado · Editar
      </button>
    );
  }

  function toggle(key: TraitKey) {
    setEndorsed((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function score(key: TraitKey): number {
    return endorsed.has(key) ? 5 : 3;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-[var(--muted-foreground)] hover:text-orange-400 transition-colors flex items-center gap-1"
      >
        {alreadyRated ? "✓ Valorado · Editar" : "⭐ Valorar"}
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-xl border border-[var(--card-border)] bg-[var(--muted)] p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">¿Qué destacarías de {ratedName}?</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[var(--muted-foreground)] hover:text-white text-xs"
        >
          ✕
        </button>
      </div>

      {/* Star rating */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-[var(--muted-foreground)]">Valoración general</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setStars(n)}
              onMouseEnter={() => setHoverStar(n)}
              onMouseLeave={() => setHoverStar(0)}
              className="text-2xl leading-none transition-transform hover:scale-110"
            >
              <span className={(hoverStar || stars) >= n ? "text-yellow-400" : "text-[var(--card-border)]"}>
                ★
              </span>
            </button>
          ))}
          <span className="text-sm text-[var(--muted-foreground)] self-center ml-1">
            {["", "Mal rollo", "Flojo", "Normal", "Bien", "¡Genial!"][hoverStar || stars]}
          </span>
        </div>
      </div>

      <div className="border-t border-[var(--card-border)]" />

      <p className="text-xs text-[var(--muted-foreground)]">¿Qué destacarías?</p>
      <div className="grid grid-cols-2 gap-2">
        {TRAITS.map((t) => {
          const active = endorsed.has(t.key);
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => toggle(t.key)}
              className={`rounded-xl border p-3 text-left transition-all ${
                active
                  ? "border-orange-500 bg-orange-500/10 ring-1 ring-orange-500"
                  : "border-[var(--card-border)] bg-[var(--card)] hover:border-orange-500/30"
              }`}
            >
              <p className="text-lg leading-none mb-1">{t.emoji}</p>
              <p className={`text-xs font-semibold ${active ? "text-white" : "text-[var(--foreground)]"}`}>
                {t.label}
              </p>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5 leading-snug">{t.desc}</p>
            </button>
          );
        })}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="¿Algo que quieras destacar? (opcional)"
        maxLength={300}
        rows={2}
        className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--card-border)] text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
      />

      {state.error && (
        <p className="text-xs text-red-400">{state.error}</p>
      )}

      <form action={action} onSubmit={() => { setOpen(false); setSaved(true); }}>
        <input type="hidden" name="ratedId" value={ratedId} />
        <input type="hidden" name="partyId" value={partyId} />
        <input type="hidden" name="overallRating" value={stars} />
        <input type="hidden" name="levelMatch" value={score("levelMatch")} />
        <input type="hidden" name="friendliness" value={score("friendliness")} />
        <input type="hidden" name="funFactor" value={score("funFactor")} />
        <input type="hidden" name="reliability" value={score("reliability")} />
        <input type="hidden" name="comment" value={comment} />
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? "Guardando..." : alreadyRated ? "Guardar cambios ✓" : "Enviar valoración ✓"}
        </button>
      </form>
    </div>
  );
}
