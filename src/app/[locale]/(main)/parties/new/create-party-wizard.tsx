"use client";

import { useState, useRef } from "react";
import { createPartyAction } from "@/actions/party";
import {
  SKILL_CRITERIA,
  POPULAR_MODPACKS,
  MINECRAFT_VERSION_LABELS,
  LOL_ROLE_LABELS,
  LOL_RANK_LABELS,
  DEFAULT_RULES,
  RULE_CATEGORY_LABELS,
  LANGUAGES,
} from "@/lib/constants";

type Game = "MINECRAFT" | "PROJECT_ZOMBOID" | "LEAGUE_OF_LEGENDS";
type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

interface WizardData {
  game: Game | "";
  name: string;
  description: string;
  skillLevel: SkillLevel | "";
  minPlayers: number;
  maxPlayers: number;
  language: string;
  minecraftVersion: string;
  lolRoles: string[];
  lolRankMin: string;
  lolRankMax: string;
  modded: boolean;
  modTags: string[];
  modsNote: string;
  serverInfo: string;
  selectedRules: string[];
}

const GAME_OPTIONS = [
  { value: "MINECRAFT" as Game, label: "Minecraft", emoji: "⛏️", desc: "Survival, creativo, modpacks..." },
  { value: "PROJECT_ZOMBOID" as Game, label: "Project Zomboid", emoji: "🧟", desc: "Supervivencia cooperativa" },
  { value: "LEAGUE_OF_LEGENDS" as Game, label: "League of Legends", emoji: "⚔️", desc: "Ranked, normal, ARAM..." },
];

const SKILL_OPTIONS: { value: SkillLevel; label: string; sub: string }[] = [
  { value: "BEGINNER", label: "Principiante", sub: "Llevo poco tiempo, aprendo jugando" },
  { value: "INTERMEDIATE", label: "Intermedio", sub: "Conozco lo básico, me defiendo bien" },
  { value: "ADVANCED", label: "Avanzado", sub: "Tengo mucha experiencia en el juego" },
  { value: "EXPERT", label: "Experto", sub: "Domino todo, busco gente al mismo nivel" },
];

function buildSteps(game: Game | ""): string[] {
  const base = ["game", "name", "description", "skill", "players", "language"];
  if (!game) return ["game"];
  if (game === "MINECRAFT") return ["game", "name", "description", "mc_version", "skill", "players", "language", "mods", "rules", "summary"];
  if (game === "PROJECT_ZOMBOID") return ["game", "name", "description", "skill", "players", "language", "mods", "rules", "summary"];
  if (game === "LEAGUE_OF_LEGENDS") return ["game", "name", "description", "lol_roles", "lol_ranks", "skill", "players", "language", "rules", "summary"];
  return base;
}

export function CreatePartyWizard() {
  const [data, setData] = useState<WizardData>({
    game: "", name: "", description: "", skillLevel: "",
    minPlayers: 2, maxPlayers: 4, language: "es",
    minecraftVersion: "", lolRoles: [], lolRankMin: "", lolRankMax: "",
    modded: false, modTags: [], modsNote: "", serverInfo: "",
    selectedRules: [],
  });
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const steps = buildSteps(data.game);
  const currentStep = steps[step];
  const progress = steps.length > 1 ? (step / (steps.length - 1)) * 100 : 0;

  function go(dir: "forward" | "back") {
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setStep((s) => dir === "forward" ? s + 1 : s - 1);
      setAnimating(false);
    }, 160);
  }

  function next() {
    setError("");
    // Validation per step
    if (currentStep === "game" && !data.game) { setError("Selecciona un juego para continuar."); return; }
    if (currentStep === "name" && !data.name.trim()) { setError("El nombre es obligatorio."); return; }
    if (currentStep === "skill" && !data.skillLevel) { setError("Selecciona un nivel."); return; }
    if (currentStep === "mc_version" && !data.minecraftVersion) { setError("Selecciona la versión."); return; }

    if (currentStep === "summary") {
      setSubmitting(true);
      formRef.current?.requestSubmit();
      return;
    }
    go("forward");
  }

  function back() {
    setError("");
    go("back");
  }

  function skip() {
    setError("");
    go("forward");
  }

  const set = (key: keyof WizardData, value: unknown) => setData((d) => ({ ...d, [key]: value }));

  const gameRules = data.game ? DEFAULT_RULES[data.game] : [];
  const requiredRules = gameRules.filter((r) => r.isRequired);
  const optionalRules = gameRules.filter((r) => !r.isRequired);
  const popularPacks = data.game && data.game in POPULAR_MODPACKS
    ? POPULAR_MODPACKS[data.game as keyof typeof POPULAR_MODPACKS]
    : [];

  const slideClass = animating
    ? direction === "forward"
      ? "opacity-0 translate-x-8"
      : "opacity-0 -translate-x-8"
    : "opacity-100 translate-x-0";

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6">
      {/* Progress bar */}
      {data.game && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
            <span>Paso {step + 1} de {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--muted)]">
            <div
              className="h-full rounded-full bg-orange-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Step content */}
      <div className={`transition-all duration-160 ${slideClass}`}>

        {/* GAME */}
        {currentStep === "game" && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold text-white">¿Para qué juego buscas compañeros?</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Elige uno y personalizamos el resto.</p>
            </div>
            <div className="flex flex-col gap-3">
              {GAME_OPTIONS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => { set("game", g.value); set("selectedRules", []); go("forward"); }}
                  className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                    data.game === g.value
                      ? "bg-orange-600/15 border-orange-500 text-white"
                      : "bg-[var(--card)] border-[var(--card-border)] hover:border-orange-500/40 text-white"
                  }`}
                >
                  <span className="text-3xl">{g.emoji}</span>
                  <div>
                    <p className="font-semibold">{g.label}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{g.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* NAME */}
        {currentStep === "name" && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold text-white">¿Cómo se llama tu party?</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Un nombre claro ayuda a encontrar compañeros afines.</p>
            </div>
            <input
              type="text"
              value={data.name}
              onChange={(e) => set("name", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && next()}
              placeholder="Ej: Survival tranquilo sin prisas, Ranked flex por la tarde..."
              autoFocus
              maxLength={80}
              className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--card-border)] text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500 text-base"
            />
          </div>
        )}

        {/* DESCRIPTION */}
        {currentStep === "description" && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold text-white">¿Quieres contarles algo más?</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Opcional — cualquier detalle que ayude a elegir bien.</p>
            </div>
            <textarea
              value={data.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Ej: Buscamos gente activa, conectamos fines de semana por la tarde..."
              rows={4}
              maxLength={300}
              className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--card-border)] text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none"
            />
          </div>
        )}

        {/* MC VERSION */}
        {currentStep === "mc_version" && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold text-white">¿Java o Bedrock?</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Son incompatibles entre sí, así que es importante saberlo.</p>
            </div>
            <div className="flex flex-col gap-3">
              {Object.entries(MINECRAFT_VERSION_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { set("minecraftVersion", value); go("forward"); }}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                    data.minecraftVersion === value
                      ? "bg-orange-600/15 border-orange-500 text-white"
                      : "bg-[var(--card)] border-[var(--card-border)] hover:border-orange-500/40 text-white"
                  }`}
                >
                  <span className="text-xl">{label.split(" ")[0]}</span>
                  <span className="font-medium">{label.split(" ").slice(1).join(" ")}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* LOL ROLES */}
        {currentStep === "lol_roles" && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold text-white">¿Qué roles necesitas en el equipo?</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Selecciona todos los que buscas. Puedes dejar vacío si eres flexible.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(LOL_ROLE_LABELS).map(([role, label]) => {
                const selected = data.lolRoles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => set("lolRoles", selected ? data.lolRoles.filter((r) => r !== role) : [...data.lolRoles, role])}
                    className={`px-4 py-2 rounded-full text-sm transition-all border font-medium ${
                      selected
                        ? "bg-orange-600 border-orange-600 text-white"
                        : "bg-[var(--muted)] border-[var(--card-border)] text-[var(--muted-foreground)] hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* LOL RANKS */}
        {currentStep === "lol_ranks" && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold text-white">¿Rango requerido?</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Opcional — si no pones límites, cualquier rango puede unirse.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-[var(--muted-foreground)]">Rango mínimo</label>
                <select
                  value={data.lolRankMin}
                  onChange={(e) => set("lolRankMin", e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--card-border)] text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                >
                  <option value="">Sin mínimo</option>
                  {Object.entries(LOL_RANK_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-[var(--muted-foreground)]">Rango máximo</label>
                <select
                  value={data.lolRankMax}
                  onChange={(e) => set("lolRankMax", e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--card-border)] text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                >
                  <option value="">Sin máximo</option>
                  {Object.entries(LOL_RANK_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* SKILL */}
        {currentStep === "skill" && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold text-white">¿Qué nivel buscas en los compañeros?</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Sé honesto — mejor empezar con las expectativas claras.</p>
            </div>
            <div className="flex flex-col gap-3">
              {SKILL_OPTIONS.map((s) => {
                const criteria = data.game && data.game in SKILL_CRITERIA
                  ? SKILL_CRITERIA[data.game as keyof typeof SKILL_CRITERIA][s.value]
                  : null;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => { set("skillLevel", s.value); go("forward"); }}
                    className={`flex flex-col gap-1 p-4 rounded-xl border text-left transition-all ${
                      data.skillLevel === s.value
                        ? "bg-orange-600/15 border-orange-500"
                        : "bg-[var(--card)] border-[var(--card-border)] hover:border-orange-500/40"
                    }`}
                  >
                    <span className="font-semibold text-white">{s.label}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">{criteria ?? s.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PLAYERS */}
        {currentStep === "players" && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold text-white">¿Cuántos jugadores en total?</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Tú incluido. Puedes poner un mínimo y un máximo.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-[var(--muted-foreground)]">Mínimo</label>
                <div className="flex gap-2 flex-wrap">
                  {[2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => set("minPlayers", n)}
                      className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all border ${
                        data.minPlayers === n
                          ? "bg-orange-600 border-orange-600 text-white"
                          : "bg-[var(--muted)] border-[var(--card-border)] text-[var(--muted-foreground)] hover:text-white"
                      }`}
                    >{n}</button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-[var(--muted-foreground)]">Máximo</label>
                <div className="flex gap-2 flex-wrap">
                  {[2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => set("maxPlayers", n)}
                      className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all border ${
                        data.maxPlayers === n
                          ? "bg-orange-600 border-orange-600 text-white"
                          : "bg-[var(--muted)] border-[var(--card-border)] text-[var(--muted-foreground)] hover:text-white"
                      }`}
                    >{n}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LANGUAGE */}
        {currentStep === "language" && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold text-white">¿En qué idioma jugaréis?</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Ayuda a filtrar compañeros por idioma.</p>
            </div>
            <div className="flex flex-col gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => { set("language", l.value); go("forward"); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                    data.language === l.value
                      ? "bg-orange-600/15 border-orange-500 text-white"
                      : "bg-[var(--card)] border-[var(--card-border)] hover:border-orange-500/40 text-white"
                  }`}
                >
                  <span className="text-lg">{l.label.split(" ")[0]}</span>
                  <span className="font-medium">{l.label.split(" ").slice(1).join(" ")}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MODS */}
        {currentStep === "mods" && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold text-white">¿Jugáis con mods?</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Importante saberlo para que los compañeros vengan preparados.</p>
            </div>
            <div className="flex gap-3">
              {[{ v: true, label: "Sí, con mods" }, { v: false, label: "No, sin mods" }].map(({ v, label }) => (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => { set("modded", v); if (!v) set("modTags", []); }}
                  className={`flex-1 py-3 rounded-xl border font-medium text-sm transition-all ${
                    data.modded === v
                      ? "bg-orange-600/15 border-orange-500 text-white"
                      : "bg-[var(--card)] border-[var(--card-border)] text-[var(--muted-foreground)] hover:text-white"
                  }`}
                >{label}</button>
              ))}
            </div>

            {data.modded && popularPacks.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-[var(--muted-foreground)]">¿Con cuál? Toca los que usáis:</p>
                <div className="flex flex-wrap gap-2">
                  {popularPacks.map((pack) => {
                    const active = data.modTags.includes(pack);
                    return (
                      <button
                        key={pack}
                        type="button"
                        onClick={() => set("modTags", active ? data.modTags.filter((t) => t !== pack) : [...data.modTags, pack])}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                          active
                            ? "bg-orange-600 border-orange-600 text-white"
                            : "bg-[var(--muted)] border-[var(--card-border)] text-[var(--muted-foreground)] hover:text-white"
                        }`}
                      >{active ? "✓ " : ""}{pack}</button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={data.modsNote}
                  onChange={(e) => set("modsNote", e.target.value)}
                  placeholder="Otro mod o nota sobre los mods (opcional)"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--card-border)] text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>
            )}
          </div>
        )}

        {/* RULES */}
        {currentStep === "rules" && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold text-white">¿Alguna norma para la party?</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Las obligatorias ya están incluidas. Marca las que quieras añadir.</p>
            </div>

            {requiredRules.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Siempre activas</p>
                {requiredRules.map((r) => (
                  <div key={r.text} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-green-600/10 border border-green-600/20">
                    <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                    <span className="text-xs text-white">{r.text}</span>
                  </div>
                ))}
              </div>
            )}

            {optionalRules.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Opcionales — toca para activar</p>
                {optionalRules.map((r) => {
                  const active = data.selectedRules.includes(r.text);
                  return (
                    <button
                      key={r.text}
                      type="button"
                      onClick={() => set("selectedRules", active ? data.selectedRules.filter((x) => x !== r.text) : [...data.selectedRules, r.text])}
                      className={`flex items-start gap-2 px-3 py-2.5 rounded-lg border text-left transition-all ${
                        active
                          ? "bg-orange-600/15 border-orange-500/60"
                          : "bg-[var(--muted)] border-[var(--card-border)] hover:border-orange-500/30"
                      }`}
                    >
                      <span className={`mt-0.5 flex-shrink-0 text-xs ${active ? "text-orange-400" : "text-[var(--muted-foreground)]"}`}>
                        {active ? "✓" : "○"}
                      </span>
                      <span className="text-xs text-white">{r.text}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SUMMARY */}
        {currentStep === "summary" && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold text-white">¡Todo listo!</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Esto es lo que verán los demás jugadores.</p>
            </div>
            <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5 flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{GAME_OPTIONS.find((g) => g.value === data.game)?.emoji}</span>
                <span className="font-bold text-white text-lg">{data.name}</span>
              </div>
              {data.description && <p className="text-[var(--muted-foreground)] text-xs">{data.description}</p>}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-[var(--muted)] border border-[var(--card-border)] text-white">
                  {SKILL_OPTIONS.find((s) => s.value === data.skillLevel)?.label}
                </span>
                <span className="px-2 py-1 rounded-full bg-[var(--muted)] border border-[var(--card-border)] text-white">
                  👥 {data.minPlayers}–{data.maxPlayers} jugadores
                </span>
                <span className="px-2 py-1 rounded-full bg-[var(--muted)] border border-[var(--card-border)] text-white">
                  {LANGUAGES.find((l) => l.value === data.language)?.label}
                </span>
                {data.modded && <span className="px-2 py-1 rounded-full bg-[var(--muted)] border border-[var(--card-border)] text-white">Con mods</span>}
              </div>
              {data.selectedRules.length > 0 && (
                <p className="text-xs text-[var(--muted-foreground)]">
                  {requiredRules.length + data.selectedRules.length} normas activas
                </p>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={back}
            className="px-4 py-2.5 rounded-xl border border-[var(--card-border)] text-[var(--muted-foreground)] hover:text-white text-sm transition-colors"
          >
            ← Atrás
          </button>
        )}

        {currentStep !== "game" && currentStep !== "mc_version" && currentStep !== "skill" && currentStep !== "language" && (
          <div className="flex-1" />
        )}

        {/* Skip for optional steps */}
        {(currentStep === "description" || currentStep === "lol_roles" || currentStep === "lol_ranks" || currentStep === "mods" || currentStep === "rules") && (
          <button
            type="button"
            onClick={skip}
            className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors"
          >
            Saltar
          </button>
        )}

        {currentStep !== "game" && currentStep !== "mc_version" && currentStep !== "skill" && currentStep !== "language" && (
          <button
            type="button"
            onClick={next}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-orange-600 text-white font-medium text-sm hover:bg-orange-500 transition-colors disabled:opacity-60"
          >
            {currentStep === "summary" ? (submitting ? "Creando..." : "Crear party 🚀") : "Siguiente →"}
          </button>
        )}
      </div>

      {/* Hidden form for submission */}
      <form ref={formRef} action={async (fd) => { await createPartyAction({}, fd); }} className="hidden">
        <input name="name" value={data.name} readOnly />
        <input name="description" value={data.description} readOnly />
        <input name="game" value={data.game} readOnly />
        <input name="skillLevel" value={data.skillLevel} readOnly />
        <input name="minPlayers" value={data.minPlayers} readOnly />
        <input name="maxPlayers" value={data.maxPlayers} readOnly />
        <input name="language" value={data.language} readOnly />
        <input name="minecraftVersion" value={data.minecraftVersion} readOnly />
        <input name="lolRoles" value={JSON.stringify(data.lolRoles)} readOnly />
        <input name="lolRankMin" value={data.lolRankMin} readOnly />
        <input name="lolRankMax" value={data.lolRankMax} readOnly />
        <input name="modded" value={String(data.modded)} readOnly />
        <input name="modTags" value={JSON.stringify(data.modTags)} readOnly />
        <input name="modsNote" value={data.modsNote} readOnly />
        <input name="serverInfo" value={data.serverInfo} readOnly />
        <input name="selectedRules" value={JSON.stringify(data.selectedRules)} readOnly />
        <input name="customRules" value="[]" readOnly />
      </form>
    </div>
  );
}
