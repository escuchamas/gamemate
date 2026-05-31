"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { updateGameProfileAction } from "@/actions/profile";
import {
  PLAYER_TAGS,
  MINECRAFT_STYLE_LABELS,
  PZ_STYLE_LABELS,
  SKILL_CRITERIA,
  LOL_ROLE_LABELS,
  LOL_RANK_LABELS,
} from "@/lib/constants";
import type { Game, GameProfile } from "@/generated/prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  game: Game;
  existing: GameProfile | null;
  onDone?: () => void;
}

interface WizardData {
  skillLevel: string;
  playtimeHours: string;
  minecraftStyle: string;
  pzStyle: string;
  lolRank: string;
  lolRole: string;
  modded: boolean;
  tags: string[];
  notes: string;
}

// ─── Step card ────────────────────────────────────────────────────────────────

function OptionCard({
  label,
  description,
  selected,
  onClick,
  emoji,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  emoji?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-4 transition-all ${
        selected
          ? "border-orange-500 bg-orange-500/10 ring-1 ring-orange-500"
          : "border-[var(--card-border)] bg-[var(--card)] hover:border-orange-500/40"
      }`}
    >
      <div className="flex items-start gap-3">
        {emoji && <span className="text-2xl flex-shrink-0 mt-0.5">{emoji}</span>}
        <div>
          <p className={`font-semibold text-sm ${selected ? "text-white" : "text-[var(--foreground)]"}`}>
            {label}
          </p>
          {description && (
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        <div className={`ml-auto flex-shrink-0 w-4 h-4 rounded-full border-2 mt-0.5 transition-colors ${
          selected ? "border-orange-500 bg-orange-500" : "border-[var(--card-border)]"
        }`} />
      </div>
    </button>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      <div className="flex-1 h-1 bg-[var(--muted)] rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-500 rounded-full transition-all duration-300"
          style={{ width: `${((current + 1) / total) * 100}%` }}
        />
      </div>
      <span className="text-xs text-[var(--muted-foreground)] flex-shrink-0">
        {current + 1} / {total}
      </span>
    </div>
  );
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

export function GameProfileWizard({ game, existing, onDone }: Props) {
  const [submitState, submitAction, isPending] = useActionState(
    updateGameProfileAction,
    {}
  );

  const [data, setData] = useState<WizardData>({
    skillLevel: existing?.skillLevel ?? "",
    playtimeHours: existing?.playtimeHours?.toString() ?? "",
    minecraftStyle: existing?.minecraftStyle ?? "",
    pzStyle: existing?.pzStyle ?? "",
    lolRank: existing?.lolRank ?? "",
    lolRole: existing?.lolRole ?? "",
    modded: existing?.modded ?? false,
    tags: existing?.tags ?? [],
    notes: existing?.notes ?? "",
  });

  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const formRef = useRef<HTMLFormElement>(null);

  // Navigate with animation
  const go = (next: number, dir: "forward" | "back") => {
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 180);
  };

  const set = <K extends keyof WizardData>(key: K, value: WizardData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const toggleTag = (tag: string) =>
    setData((d) => ({
      ...d,
      tags: d.tags.includes(tag)
        ? d.tags.filter((t) => t !== tag)
        : d.tags.length < 8
        ? [...d.tags, tag]
        : d.tags,
    }));

  // Build steps dynamically per game
  const steps = buildSteps(game);
  const totalSteps = steps.length;
  const isLast = step === totalSteps - 1;

  const canAdvance = (): boolean => {
    const current = steps[step];
    if (!current.required) return true;
    if (current.field === "skillLevel") return !!data.skillLevel;
    if (current.field === "minecraftStyle") return !!data.minecraftStyle;
    if (current.field === "pzStyle") return !!data.pzStyle;
    if (current.field === "lolRank") return !!data.lolRank;
    if (current.field === "lolRole") return !!data.lolRole;
    return true;
  };

  // Submit on last step
  const handleSubmit = () => {
    if (formRef.current) formRef.current.requestSubmit();
  };

  // Success
  useEffect(() => {
    if (submitState.success) onDone?.();
  }, [submitState.success, onDone]);

  const slideClass = animating
    ? direction === "forward"
      ? "-translate-x-6 opacity-0"
      : "translate-x-6 opacity-0"
    : "translate-x-0 opacity-100";

  return (
    <div className="flex flex-col">
      <ProgressBar current={step} total={totalSteps} />

      {/* Hidden form that gets submitted on last step */}
      <form ref={formRef} action={submitAction} className="hidden">
        <input type="hidden" name="game" value={game} />
        <input type="hidden" name="skillLevel" value={data.skillLevel} />
        <input type="hidden" name="playtimeHours" value={data.playtimeHours} />
        <input type="hidden" name="minecraftStyle" value={data.minecraftStyle} />
        <input type="hidden" name="pzStyle" value={data.pzStyle} />
        <input type="hidden" name="lolRank" value={data.lolRank} />
        <input type="hidden" name="lolRole" value={data.lolRole} />
        <input type="hidden" name="modded" value={String(data.modded)} />
        <input type="hidden" name="tags" value={JSON.stringify(data.tags)} />
        <input type="hidden" name="notes" value={data.notes} />
      </form>

      {/* Step content */}
      <div
        className={`transition-all duration-180 ${slideClass}`}
        style={{ transitionDuration: "180ms" }}
      >
        <StepContent
          step={steps[step]}
          data={data}
          game={game}
          set={set}
          toggleTag={toggleTag}
        />
      </div>

      {submitState.error && (
        <p className="text-sm text-red-400 mt-4">{submitState.error}</p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button
          type="button"
          onClick={() => go(step - 1, "back")}
          disabled={step === 0}
          className="px-4 py-2 text-sm text-[var(--muted-foreground)] hover:text-white transition-colors disabled:opacity-0 disabled:pointer-events-none"
        >
          ← Anterior
        </button>

        <div className="flex items-center gap-3">
          {!steps[step].required && !isLast && (
            <button
              type="button"
              onClick={() => go(step + 1, "forward")}
              className="px-4 py-2 text-sm text-[var(--muted-foreground)] hover:text-white transition-colors"
            >
              Saltar
            </button>
          )}

          {isLast ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="px-6 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-500 transition-colors disabled:opacity-50"
            >
              {isPending ? "Guardando..." : existing ? "Guardar cambios" : "Finalizar"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => canAdvance() && go(step + 1, "forward")}
              disabled={!canAdvance()}
              className="px-6 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step definitions ─────────────────────────────────────────────────────────

interface StepDef {
  title: string;
  subtitle?: string;
  field?: string;
  required?: boolean;
}

function buildSteps(game: Game): StepDef[] {
  const shared: StepDef[] = [
    {
      title: "¿Cuántas horas tienes?",
      subtitle: "Una estimación aproximada. No hace falta que sea exacta.",
      field: "playtimeHours",
      required: false,
    },
    {
      title: "¿Qué buscas en una party?",
      subtitle: "Elige hasta 8 etiquetas. Así los demás entienden tu estilo.",
      field: "tags",
      required: false,
    },
    {
      title: "¿Algo más que quieras contar?",
      subtitle: "Cuéntale al equipo cómo eres. Puedes saltarte este paso.",
      field: "notes",
      required: false,
    },
  ];

  if (game === "MINECRAFT") {
    return [
      { title: "¿Cuál es tu nivel en Minecraft?", subtitle: "Sé honesto — es para encontrar gente compatible, no para impresionar.", field: "skillLevel", required: true },
      { title: "¿Cómo juegas habitualmente?", subtitle: "Tu modo preferido de juego.", field: "minecraftStyle", required: true },
      ...shared,
    ];
  }

  if (game === "PROJECT_ZOMBOID") {
    return [
      { title: "¿Cuál es tu nivel en Project Zomboid?", subtitle: "Cuánto tiempo llevas sobreviviendo.", field: "skillLevel", required: true },
      { title: "¿Cuál es tu estilo de juego?", subtitle: "Qué tipo de experiencia buscas.", field: "pzStyle", required: true },
      ...shared,
    ];
  }

  if (game === "LEAGUE_OF_LEGENDS") {
    return [
      { title: "¿Cuál es tu rango actual?", subtitle: "Tu rango en la temporada actual o la última.", field: "lolRank", required: true },
      { title: "¿Cuál es tu rol principal?", subtitle: "El que más juegas. Luego podrás indicar secundarios.", field: "lolRole", required: true },
      ...shared,
    ];
  }

  return [{ title: "Configura tu perfil", field: "skillLevel", required: true }, ...shared];
}

// ─── Step renderer ────────────────────────────────────────────────────────────

function StepContent({
  step,
  data,
  game,
  set,
  toggleTag,
}: {
  step: StepDef;
  data: WizardData;
  game: Game;
  set: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void;
  toggleTag: (tag: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-white">{step.title}</h2>
        {step.subtitle && (
          <p className="text-sm text-[var(--muted-foreground)] mt-1">{step.subtitle}</p>
        )}
      </div>

      {step.field === "skillLevel" && (
        <div className="flex flex-col gap-2">
          {(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const).map((level) => {
            const labels: Record<string, string> = {
              BEGINNER: "Principiante",
              INTERMEDIATE: "Intermedio",
              ADVANCED: "Avanzado",
              EXPERT: "Experto",
            };
            const emojis: Record<string, string> = { BEGINNER: "🌱", INTERMEDIATE: "⚔️", ADVANCED: "🔥", EXPERT: "💎" };
            return (
              <OptionCard
                key={level}
                label={labels[level]}
                description={SKILL_CRITERIA[game]?.[level]}
                selected={data.skillLevel === level}
                onClick={() => set("skillLevel", level)}
                emoji={emojis[level]}
              />
            );
          })}
        </div>
      )}

      {step.field === "minecraftStyle" && (
        <div className="flex flex-col gap-2">
          {(Object.entries(MINECRAFT_STYLE_LABELS) as [string, string][]).map(([value, label]) => {
            const descs: Record<string, string> = {
              SURVIVAL: "Sobrevivir, explorar, construir a tu ritmo. El modo clásico.",
              HARDCORE: "Una vida. Sin respawn. Cada decisión importa.",
              CREATIVE: "Construir sin límites. Recursos infinitos.",
              ADVENTURE: "Explorar mapas y aventuras creadas por otros.",
            };
            const emojis: Record<string, string> = { SURVIVAL: "🌳", HARDCORE: "💀", CREATIVE: "🏗️", ADVENTURE: "🗺️" };
            return (
              <OptionCard
                key={value}
                label={label}
                description={descs[value]}
                selected={data.minecraftStyle === value}
                onClick={() => set("minecraftStyle", value)}
                emoji={emojis[value]}
              />
            );
          })}
        </div>
      )}

      {step.field === "pzStyle" && (
        <div className="flex flex-col gap-2">
          {(Object.entries(PZ_STYLE_LABELS) as [string, string][]).map(([value, label]) => {
            const descs: Record<string, string> = {
              CASUAL: "Sin presión. Jugar para disfrutar, sin importar si mueres.",
              ROLEPLAY: "El personaje importa. Decisiones coherentes con el lore.",
              HARDCORE: "Dificultad máxima. Solo los más preparados sobreviven.",
              CHALLENGE: "Condiciones especiales: modos custom, metas concretas.",
            };
            const emojis: Record<string, string> = { CASUAL: "😊", ROLEPLAY: "🎭", HARDCORE: "💀", CHALLENGE: "🏆" };
            return (
              <OptionCard
                key={value}
                label={label}
                description={descs[value]}
                selected={data.pzStyle === value}
                onClick={() => set("pzStyle", value)}
                emoji={emojis[value]}
              />
            );
          })}
        </div>
      )}

      {step.field === "lolRank" && (
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(LOL_RANK_LABELS) as [string, string][]).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => set("lolRank", value)}
              className={`rounded-xl border p-3 text-sm font-medium transition-all ${
                data.lolRank === value
                  ? "border-orange-500 bg-orange-500/10 text-white ring-1 ring-orange-500"
                  : "border-[var(--card-border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-orange-500/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {step.field === "lolRole" && (
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(LOL_ROLE_LABELS) as [string, string][]).map(([value, label]) => {
            const descs: Record<string, string> = {
              TOP: "Resistencia y duelos 1v1 en el carril superior.",
              JUNGLE: "Control del mapa, objetivos y ganks.",
              MID: "Carry mágico o asesino, domina el centro.",
              ADC: "Daño físico a distancia, late game.",
              SUPPORT: "Protege al equipo, visión y utilidad.",
              FILL: "Juego donde haga falta. Flexible.",
            };
            return (
              <OptionCard
                key={value}
                label={label}
                description={descs[value]}
                selected={data.lolRole === value}
                onClick={() => set("lolRole", value)}
              />
            );
          })}
        </div>
      )}

      {step.field === "playtimeHours" && (
        <div className="flex flex-col gap-3">
          <div className="relative max-w-xs">
            <input
              type="number"
              value={data.playtimeHours}
              onChange={(e) => set("playtimeHours", e.target.value)}
              placeholder="0"
              min={0}
              max={99999}
              className="w-full px-4 py-4 text-3xl font-bold text-center rounded-xl bg-[var(--muted)] border border-[var(--card-border)] text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)]">h</span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            Puedes dejarlo en blanco si no lo sabes.
          </p>
        </div>
      )}

      {step.field === "tags" && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {PLAYER_TAGS[game].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  data.tags.includes(tag)
                    ? "bg-orange-600 text-white border-orange-600"
                    : "bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--card-border)] hover:border-orange-500/50"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            {data.tags.length}/8 seleccionadas
          </p>
        </div>
      )}

      {step.field === "notes" && (
        <div className="flex flex-col gap-4">
          <textarea
            value={data.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Ej: Soy muy activo por las noches, no me gusta el PvP pero me encanta construir granjas..."
            rows={4}
            maxLength={300}
            className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--card-border)] text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          />
          {game !== "LEAGUE_OF_LEGENDS" && (
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => set("modded", !data.modded)}
                className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 flex items-center px-1 ${
                  data.modded ? "bg-orange-600" : "bg-[var(--muted)]"
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  data.modded ? "translate-x-4" : "translate-x-0"
                }`} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Juego con mods</p>
                <p className="text-xs text-[var(--muted-foreground)]">Actívalo si usas mods habitualmente.</p>
              </div>
            </label>
          )}
          <p className="text-xs text-[var(--muted-foreground)]">
            {data.notes.length}/300 caracteres
          </p>
        </div>
      )}
    </div>
  );
}
