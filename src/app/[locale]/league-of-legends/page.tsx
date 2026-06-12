import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Footer } from "@/components/layout/footer";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buscar duo y equipo para League of Legends en español | GameMate",
  description:
    "Encuentra duo carril, premade 5v5 o equipo de Clash para LoL. Filtra por rango, rol y nivel. Comunidad española verificada. Gratis.",
  openGraph: {
    title: "Buscar duo y equipo para LoL en español | GameMate",
    description: "Encuentra duo carril, premade 5v5 o equipo de Clash. Filtra por rango y rol. Comunidad española verificada.",
    url: "https://gamemate.es/es/league-of-legends",
    siteName: "GameMate",
    type: "website",
    images: [{ url: "https://gamemate.es/games/lol.jpg", width: 800, height: 400 }],
  },
};

const FAQ = [
  {
    q: "¿Cómo encuentro duo para ranked en League of Legends?",
    a: "Crea un perfil en GameMate, indica tu rango y rol principal, y únete a parties de LoL filtradas por rango. Puedes buscar duo carril, premade 5v5 o equipo de Clash.",
  },
  {
    q: "¿Puedo buscar por rol específico?",
    a: "Sí. Cada party de LoL especifica los roles que busca: Top, Jungle, Mid, ADC o Support. Filtra para encontrar exactamente lo que necesitas.",
  },
  {
    q: "¿Qué rangos hay disponibles?",
    a: "Desde Hierro hasta Challenger. Cada party tiene rango mínimo y máximo para asegurar que todos estén al mismo nivel.",
  },
  {
    q: "¿También hay parties de ARAM o normals?",
    a: "Sí, no todo es ranked. Hay parties para ARAM en premade, normals para practicar muñecos y sesiones de entrenamiento de macro.",
  },
];

export default async function LeagueOfLegendsPage() {
  const parties = await prisma.party.findMany({
    where: { game: "LEAGUE_OF_LEGENDS", status: { in: ["OPEN", "FULL"] } },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true, name: true, skillLevel: true, status: true,
      maxPlayers: true, lolRoles: true, lolRankMin: true, lolRankMax: true,
      _count: { select: { members: true } },
    },
  });

  const SKILL: Record<string, string> = { BEGINNER: "Principiante", INTERMEDIATE: "Intermedio", ADVANCED: "Avanzado", EXPERT: "Experto" };
  const RANK: Record<string, string> = { IRON: "Hierro", BRONZE: "Bronce", SILVER: "Plata", GOLD: "Oro", PLATINUM: "Platino", EMERALD: "Esmeralda", DIAMOND: "Diamante", MASTER: "Master", GRANDMASTER: "Gran Maestro", CHALLENGER: "Challenger" };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="GameMate" className="h-8" />
        </Link>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <Link href="/login" className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors">Entrar</Link>
          <Link href="/register" className="px-4 py-1.5 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-500 transition-colors font-medium">Registrarse</Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 flex flex-col gap-12">

        {/* Hero */}
        <div className="text-center flex flex-col gap-4">
          <div className="relative rounded-2xl overflow-hidden h-48 mb-2">
            <img src="/games/lol.jpg" alt="League of Legends" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
              <h1 className="text-3xl font-bold text-white">Duo y equipo para LoL en español</h1>
            </div>
          </div>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Busca duo carril, premade 5v5 o equipo de Clash. Filtra por rango y rol. Sin toxic, sin flaming — perfiles verificados con reputación real.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/register" className="px-6 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-500 transition-colors">
              Buscar duo gratis
            </Link>
            <Link href="/parties?game=LEAGUE_OF_LEGENDS" className="px-6 py-3 rounded-xl bg-[var(--card)] border border-[var(--card-border)] text-white font-semibold hover:bg-[var(--muted)] transition-colors">
              Ver parties activas
            </Link>
          </div>
        </div>

        {/* Parties activas */}
        {parties.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Parties de LoL ahora mismo</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {parties.map((p) => (
                <Link key={p.id} href={`/parties/${p.id}`}
                  className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-4 hover:border-orange-500/50 transition-all flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm text-white truncate">{p.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${p.status === "OPEN" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>
                      {p.status === "OPEN" ? "Abierta" : "Llena"}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs text-[var(--muted-foreground)] flex-wrap">
                    <span>{SKILL[p.skillLevel]}</span>
                    <span>·</span>
                    <span>{p._count.members}/{p.maxPlayers} jugadores</span>
                    {p.lolRankMin && p.lolRankMax && (
                      <><span>·</span><span>{RANK[p.lolRankMin]} → {RANK[p.lolRankMax]}</span></>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-4">
              <Link href="/parties?game=LEAGUE_OF_LEGENDS" className="text-sm text-orange-400 hover:text-orange-300 transition-colors">
                Ver todas las parties de LoL →
              </Link>
            </div>
          </section>
        )}

        {/* Por qué */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">¿Por qué usar GameMate para LoL?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { emoji: "🛡️", title: "Sin toxic", desc: "El sistema de reputación penaliza el comportamiento tóxico. La comunidad se autorregula." },
              { emoji: "⚔️", title: "Filtro por rol y rango", desc: "Busca exactamente el rol que necesitas dentro de tu rango. Sin perder el tiempo." },
              { emoji: "🏆", title: "Clash y torneos", desc: "Encuentra los 5 para Clash o forma equipo para ligas amateur." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5">
                <div className="text-2xl mb-2">{item.emoji}</div>
                <h3 className="font-semibold text-white text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-[var(--muted-foreground)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Preguntas frecuentes</h2>
          <div className="flex flex-col gap-4">
            {FAQ.map((item) => (
              <div key={item.q} className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5">
                <h3 className="font-semibold text-white text-sm mb-1">{item.q}</h3>
                <p className="text-sm text-[var(--muted-foreground)]">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center rounded-2xl bg-orange-600/10 border border-orange-500/20 p-8">
          <h2 className="text-2xl font-bold text-white mb-2">¿Listo para subir de rango?</h2>
          <p className="text-[var(--muted-foreground)] mb-6">Regístrate gratis y encuentra tu duo o premade en menos de 2 minutos.</p>
          <Link href="/register" className="px-8 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-500 transition-colors text-lg">
            Empezar gratis
          </Link>
        </section>

      </main>
      <Footer />
    </div>
  );
}
