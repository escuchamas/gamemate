"use client";

import { useState, useRef } from "react";
import { saveGamerProfileAction } from "@/actions/gamer-profile";

const POPULAR_GAMES = [
  "Minecraft", "League of Legends", "Valorant", "Fortnite", "Apex Legends",
  "CS2", "Dota 2", "Project Zomboid", "Rust", "ARK", "Deep Rock Galactic",
  "Phasmophobia", "Valheim", "7 Days to Die", "GTA V", "Elden Ring",
  "Baldur's Gate 3", "Stardew Valley", "Among Us", "Fall Guys",
];

const CATEGORIES = [
  { value: "survival", label: "🏕️ Survival / Mundo abierto" },
  { value: "fps", label: "🔫 FPS / Shooter" },
  { value: "rpg", label: "⚔️ RPG / Aventura" },
  { value: "moba", label: "🏆 MOBA / Competitivo" },
  { value: "horror", label: "👻 Terror / Cooperativo" },
  { value: "strategy", label: "🧠 Estrategia / RTS" },
  { value: "sandbox", label: "🎨 Sandbox / Creativo" },
  { value: "battle_royale", label: "💀 Battle Royale" },
  { value: "simulation", label: "🚜 Simulación / Casual" },
  { value: "sports", label: "⚽ Deportes / Racing" },
];

const SCHEDULE_OPTIONS = [
  { value: "morning", label: "🌅 Mañanas (9–14h)" },
  { value: "afternoon", label: "☀️ Tardes (14–20h)" },
  { value: "evening", label: "🌆 Noches (20–00h)" },
  { value: "night", label: "🌙 Madrugadas (00–6h)" },
  { value: "weekends", label: "📅 Fines de semana" },
];

const HOURS_OPTIONS = [
  { value: 3, label: "Menos de 5h" },
  { value: 8, label: "5–10h" },
  { value: 15, label: "10–20h" },
  { value: 25, label: "20–30h" },
  { value: 40, label: "Más de 30h" },
];

interface Props {
  onComplete: () => void;
}

export function GamerProfileWizard({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [gamesPlaying, setGamesPlaying] = useState<string[]>([]);
  const [gamesWanted, setGamesWanted] = useState<string[]>([]);
  const [weeklyHours, setWeeklyHours] = useState<number | null>(null);
  const [schedule, setSchedule] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [customGame, setCustomGame] = useState("");
  const [customWanted, setCustomWanted] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const STEPS = ["playing", "wanted", "hours", "schedule", "categories", "done"];
  const currentStep = STEPS[step];
  const progress = (step / (STEPS.length - 1)) * 100;

  function go(dir: "forward" | "back") {
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => { setStep((s) => dir === "forward" ? s + 1 : s - 1); setAnimating(false); }, 160);
  }

  function toggleItem<T>(arr: T[], item: T, set: (v: T[]) => void) {
    set(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  }

  function addCustomGame(list: string[], setList: (v: string[]) => void, val: string, setVal: (v: string) => void) {
    const trimmed = val.trim();
    if (trimmed && !list.includes(trimmed)) setList([...list, trimmed]);
    setVal("");
  }

  async function handleSubmit() {
    setSubmitting(true);
    const fd = new FormData();
    fd.set("gamesPlaying", JSON.stringify(gamesPlaying));
    fd.set("gamesWanted", JSON.stringify(gamesWanted));
    fd.set("weeklyHours", String(weeklyHours ?? ""));
    fd.set("schedule", JSON.stringify(schedule));
    fd.set("gameCategories", JSON.stringify(categories));
    await saveGamerProfileAction(fd);
    onComplete();
  }

  const slideClass = animating
    ? direction === "forward" ? "opacity-0 translate-x-8" : "opacity-0 -translate-x-8"
    : "opacity-100 translate-x-0";

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
          <span>Paso {step + 1} de {STEPS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--muted)]">
          <div className="h-full rounded-full bg-orange-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className={`transition-all duration-160 ${slideClass}`}>

        {/* PLAYING */}
        {currentStep === "playing" && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold text-white">¿A qué juegos juegas ahora?</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Selecciona los que quieras o escribe los tuyos.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_GAMES.map((g) => (
                <button key={g} type="button"
                  onClick={() => toggleItem(gamesPlaying, g, setGamesPlaying)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all border ${
                    gamesPlaying.includes(g)
                      ? "bg-orange-600 border-orange-600 text-white"
                      : "bg-[var(--muted)] border-[var(--card-border)] text-[var(--muted-foreground)] hover:text-white"
                  }`}
                >{gamesPlaying.includes(g) ? "✓ " : ""}{g}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={customGame}
                onChange={(e) => setCustomGame(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomGame(gamesPlaying, setGamesPlaying, customGame, setCustomGame))}
                placeholder="Otro juego..."
                className="flex-1 px-3 py-2 rounded-xl bg-[var(--muted)] border border-[var(--card-border)] text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button type="button" onClick={() => addCustomGame(gamesPlaying, setGamesPlaying, customGame, setCustomGame)}
                className="px-3 py-2 rounded-xl bg-orange-600 text-white text-sm hover:bg-orange-500 transition-colors">+</button>
            </div>
            {gamesPlaying.length > 0 && (
              <p className="text-xs text-orange-400">{gamesPlaying.length} seleccionado{gamesPlaying.length > 1 ? "s" : ""}: {gamesPlaying.join(", ")}</p>
            )}
          </div>
        )}

        {/* WANTED */}
        {currentStep === "wanted" && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold text-white">¿Qué juegos te gustaría probar?</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Juegos en tu lista de pendientes o que te da curiosidad.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_GAMES.filter((g) => !gamesPlaying.includes(g)).map((g) => (
                <button key={g} type="button"
                  onClick={() => toggleItem(gamesWanted, g, setGamesWanted)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all border ${
                    gamesWanted.includes(g)
                      ? "bg-orange-600 border-orange-600 text-white"
                      : "bg-[var(--muted)] border-[var(--card-border)] text-[var(--muted-foreground)] hover:text-white"
                  }`}
                >{gamesWanted.includes(g) ? "✓ " : ""}{g}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={customWanted}
                onChange={(e) => setCustomWanted(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomGame(gamesWanted, setGamesWanted, customWanted, setCustomWanted))}
                placeholder="Otro juego..."
                className="flex-1 px-3 py-2 rounded-xl bg-[var(--muted)] border border-[var(--card-border)] text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button type="button" onClick={() => addCustomGame(gamesWanted, setGamesWanted, customWanted, setCustomWanted)}
                className="px-3 py-2 rounded-xl bg-orange-600 text-white text-sm hover:bg-orange-500 transition-colors">+</button>
            </div>
          </div>
        )}

        {/* HOURS */}
        {currentStep === "hours" && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold text-white">¿Cuántas horas juegas a la semana?</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Aproximadamente, sin presión.</p>
            </div>
            <div className="flex flex-col gap-2">
              {HOURS_OPTIONS.map((h) => (
                <button key={h.value} type="button"
                  onClick={() => { setWeeklyHours(h.value); go("forward"); }}
                  className={`px-4 py-3 rounded-xl border text-left font-medium text-sm transition-all ${
                    weeklyHours === h.value
                      ? "bg-orange-600/15 border-orange-500 text-white"
                      : "bg-[var(--card)] border-[var(--card-border)] text-white hover:border-orange-500/40"
                  }`}
                >{h.label}</button>
              ))}
            </div>
          </div>
        )}

        {/* SCHEDULE */}
        {currentStep === "schedule" && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold text-white">¿Cuándo sueles jugar?</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Selecciona todo lo que aplique.</p>
            </div>
            <div className="flex flex-col gap-2">
              {SCHEDULE_OPTIONS.map((s) => {
                const active = schedule.includes(s.value);
                return (
                  <button key={s.value} type="button"
                    onClick={() => toggleItem(schedule, s.value, setSchedule)}
                    className={`px-4 py-3 rounded-xl border text-left font-medium text-sm transition-all ${
                      active
                        ? "bg-orange-600/15 border-orange-500 text-white"
                        : "bg-[var(--card)] border-[var(--card-border)] text-[var(--muted-foreground)] hover:text-white hover:border-orange-500/40"
                    }`}
                  >
                    {active ? "✓ " : ""}{s.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CATEGORIES */}
        {currentStep === "categories" && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold text-white">¿Qué tipo de juegos te molan más?</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Selecciona los que más te representen.</p>
            </div>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map((c) => {
                const active = categories.includes(c.value);
                return (
                  <button key={c.value} type="button"
                    onClick={() => toggleItem(categories, c.value, setCategories)}
                    className={`px-4 py-3 rounded-xl border text-left text-sm transition-all ${
                      active
                        ? "bg-orange-600/15 border-orange-500 text-white font-medium"
                        : "bg-[var(--card)] border-[var(--card-border)] text-[var(--muted-foreground)] hover:text-white hover:border-orange-500/40"
                    }`}
                  >
                    {active ? "✓ " : ""}{c.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* DONE */}
        {currentStep === "done" && (
          <div className="flex flex-col gap-5 text-center">
            <div className="text-5xl">🎮</div>
            <div>
              <h2 className="text-2xl font-bold text-white">¡Perfil listo!</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-2">
                Ya puedes explorar parties. Cuando intentes unirte a una, te pediremos el perfil específico de ese juego.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        {step > 0 && currentStep !== "done" && (
          <button type="button" onClick={() => go("back")}
            className="px-4 py-2.5 rounded-xl border border-[var(--card-border)] text-[var(--muted-foreground)] hover:text-white text-sm transition-colors">
            ← Atrás
          </button>
        )}
        <div className="flex-1" />

        {(currentStep === "playing" || currentStep === "wanted" || currentStep === "schedule" || currentStep === "categories") && (
          <button type="button" onClick={() => go("forward")}
            className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors">
            Saltar
          </button>
        )}

        {currentStep !== "hours" && currentStep !== "done" && (
          <button type="button" onClick={() => go("forward")}
            className="px-6 py-2.5 rounded-xl bg-orange-600 text-white font-medium text-sm hover:bg-orange-500 transition-colors">
            Siguiente →
          </button>
        )}

        {currentStep === "done" && (
          <button type="button" onClick={handleSubmit} disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-orange-600 text-white font-medium text-sm hover:bg-orange-500 transition-colors disabled:opacity-60 w-full">
            {submitting ? "Guardando..." : "Entrar a GameMate 🚀"}
          </button>
        )}
      </div>

      <form ref={formRef} className="hidden" />
    </div>
  );
}
