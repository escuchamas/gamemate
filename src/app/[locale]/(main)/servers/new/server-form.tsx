"use client";

import { useActionState, useState } from "react";
import { createServerAction } from "@/actions/servers";

const GAMES = [
  { value: "MINECRAFT", label: "⛏️ Minecraft" },
  { value: "PROJECT_ZOMBOID", label: "🧟 Project Zomboid" },
  { value: "LEAGUE_OF_LEGENDS", label: "⚔️ League of Legends" },
  { value: "OTHER", label: "🎮 Otro juego" },
];

const initialState = { error: undefined, success: undefined };

export function ServerForm() {
  const [state, action, isPending] = useActionState(createServerAction, initialState);
  const [modded, setModded] = useState(false);
  const [game, setGame] = useState("");

  const showIp = game === "MINECRAFT" || game === "PROJECT_ZOMBOID";

  return (
    <form action={action} className="flex flex-col gap-5">
      {state?.error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}

      {/* Juego */}
      <Field label="Juego *">
        <select
          name="game"
          required
          value={game}
          onChange={(e) => setGame(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Selecciona un juego...</option>
          {GAMES.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
      </Field>

      {/* Nombre */}
      <Field label="Nombre del servidor *">
        <input
          type="text"
          name="name"
          required
          minLength={3}
          maxLength={100}
          placeholder="Ej: CraftEspaña SMP"
          className="w-full px-3 py-2.5 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </Field>

      {/* Descripción */}
      <Field label="Descripción *" hint="Mínimo 20 caracteres. Cuéntale a los jugadores qué hace especial a tu servidor.">
        <textarea
          name="description"
          required
          minLength={20}
          maxLength={2000}
          rows={5}
          placeholder="Describe el servidor, qué tipo de comunidad tenéis, el estilo de juego, normas..."
          className="w-full px-3 py-2.5 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        />
      </Field>

      {/* Discord */}
      <Field label="Enlace de Discord *" hint="https://discord.gg/...">
        <input
          type="url"
          name="discordUrl"
          required
          placeholder="https://discord.gg/tu-server"
          className="w-full px-3 py-2.5 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </Field>

      {/* IP — solo MC / PZ */}
      {showIp && (
        <Field label="IP del servidor" hint="Opcional. Dirección para conectarse directamente.">
          <input
            type="text"
            name="ip"
            placeholder="play.tu-servidor.com o 192.168.1.1:25565"
            className="w-full px-3 py-2.5 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </Field>
      )}

      {/* Web */}
      <Field label="Web propia" hint="Opcional.">
        <input
          type="url"
          name="websiteUrl"
          placeholder="https://tu-servidor.com"
          className="w-full px-3 py-2.5 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </Field>

      {/* Máximo jugadores */}
      <Field label="Máximo de jugadores" hint="Opcional.">
        <input
          type="number"
          name="maxPlayers"
          min={2}
          max={10000}
          placeholder="Ej: 100"
          className="w-40 px-3 py-2.5 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </Field>

      {/* Mods */}
      {(game === "MINECRAFT" || game === "PROJECT_ZOMBOID") && (
        <>
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input
              type="checkbox"
              name="modded"
              value="true"
              checked={modded}
              onChange={(e) => setModded(e.target.checked)}
              className="w-4 h-4 rounded accent-orange-500"
            />
            <span className="text-sm text-[var(--foreground)]">Servidor con mods</span>
          </label>
          {modded && (
            <Field label="¿Qué mods usáis?" hint="Breve listado o descripción.">
              <input
                type="text"
                name="modsNote"
                maxLength={300}
                placeholder="Ej: Fabric 1.21, Create, Terrafirmia..."
                className="w-full px-3 py-2.5 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </Field>
          )}
        </>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm transition-colors disabled:opacity-50 w-fit"
      >
        {isPending ? "Publicando..." : "Publicar servidor"}
      </button>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-white">{label}</label>
      {hint && <p className="text-xs text-[var(--muted-foreground)]">{hint}</p>}
      {children}
    </div>
  );
}
