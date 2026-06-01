import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GAME_ICONS, GAME_LABELS, BADGE_INFO } from "@/lib/constants";

export default async function LandingPage() {
  const session = await auth();
  if (session) redirect("/es/parties");

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* Nav minimal */}
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <span className="text-xl font-bold text-white flex items-center gap-2">
          🎮 GameMate
        </span>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="px-4 py-1.5 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-500 transition-colors font-medium"
          >
            Registrarse
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-8 py-16">
        <div className="flex gap-4 text-5xl">
          <span>{GAME_ICONS.MINECRAFT}</span>
          <span>{GAME_ICONS.PROJECT_ZOMBOID}</span>
        </div>

        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Jugar solo mola menos.
            <br />
            <span className="text-orange-400">Juega con gente como tú.</span>
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] mb-8">
            ¿Harto de partidas con pros que te lo spoilean todo, o con novatos
            que no saben ni crafting? Aquí encontrarás jugadores de{" "}
            <strong className="text-white">tu mismo nivel</strong> para
            disfrutar el juego como se merece.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-500 transition-colors text-lg"
            >
              Empezar gratis 🚀
            </Link>
            <Link
              href="/parties"
              className="px-8 py-3 rounded-xl bg-[var(--card)] border border-[var(--card-border)] text-white font-semibold hover:bg-[var(--muted)] transition-colors text-lg"
            >
              Ver parties activas
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full mt-8">
          {[
            {
              emoji: "🎯",
              title: "Mismo nivel",
              desc: "Grupos de 2 a 6 jugadores filtrados por nivel de juego. Sin pros, sin novatos — solo tu ritmo.",
            },
            {
              emoji: "📜",
              title: "Normas claras",
              desc: "Cada party tiene sus reglas desde el principio. Sin dramas, sin sorpresas. Lo que acuerdas, lo que hay.",
            },
            {
              emoji: "⭐",
              title: "Reputación real",
              desc: "Los demás valoran tu nivel, simpatía y si eres divertido. Badges verificados por 100+ jugadores.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5 text-left"
            >
              <div className="text-3xl mb-2">{f.emoji}</div>
              <h3 className="font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-sm text-[var(--muted-foreground)]">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Badges preview */}
        <div className="max-w-2xl w-full">
          <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-3">
            Badges verificados por la comunidad
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {Object.values(BADGE_INFO).map((badge) => (
              <span
                key={badge.label}
                className="px-3 py-1.5 rounded-full bg-[var(--card)] border border-[var(--card-border)] text-sm text-white flex items-center gap-1.5"
              >
                <span>{badge.emoji}</span>
                <span>{badge.label}</span>
              </span>
            ))}
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-2">
            Solo se conceden cuando más de 100 jugadores los avalan
          </p>
        </div>

        {/* Games */}
        <div className="flex gap-6 text-center">
          {(["MINECRAFT", "PROJECT_ZOMBOID"] as const).map((g) => (
            <div key={g} className="flex flex-col items-center gap-1">
              <span className="text-4xl">{GAME_ICONS[g]}</span>
              <span className="text-sm text-[var(--muted-foreground)]">
                {GAME_LABELS[g]}
              </span>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-[var(--muted-foreground)]">
        GameMate — Hecho por un gamer, para gamers. 0 corporativo, 100%
        comunidad.
      </footer>
    </div>
  );
}
