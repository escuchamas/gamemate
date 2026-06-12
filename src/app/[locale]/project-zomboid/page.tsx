import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Footer } from "@/components/layout/footer";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buscar compañeros de Project Zomboid en español | GameMate",
  description:
    "Encuentra supervivientes para Project Zomboid: roleplay, hardcore, PvE, PvP. Servidores y parties en español. Perfiles verificados. Gratis.",
  openGraph: {
    title: "Buscar compañeros de Project Zomboid en español | GameMate",
    description: "Encuentra supervivientes para PZ: roleplay, hardcore, PvE, PvP. Servidores y parties en español verificados.",
    url: "https://gamemate.es/es/project-zomboid",
    siteName: "GameMate",
    type: "website",
    images: [{ url: "https://gamemate.es/games/PZ.jpg", width: 800, height: 400 }],
  },
};

const FAQ = [
  {
    q: "¿Cómo encuentro gente para jugar Project Zomboid en español?",
    a: "En GameMate puedes unirte a parties de PZ filtradas por estilo: roleplay, hardcore, survival relajado, PvE o PvP. También hay servidores permanentes en español.",
  },
  {
    q: "¿Hay servidores de Project Zomboid en español?",
    a: "Sí. En el tablón de GameMate encontrarás servidores hispanos como MEMENTO MORI, NosferaDomain o BlackOut En La Mazmorra, con diferentes configuraciones.",
  },
  {
    q: "¿Qué configuraciones de servidor hay disponibles?",
    a: "Vanilla, mods de calidad de vida, roleplay obligatorio, permadeath, PvEvP, supervivencia extrema. Filtra por estilo para encontrar lo que buscas.",
  },
  {
    q: "¿Hace falta experiencia previa?",
    a: "No. Hay parties para todos los niveles, desde principiantes que quieren aprender hasta veteranos buscando configuraciones extremas.",
  },
];

export default async function ProjectZomboidPage() {
  const parties = await prisma.party.findMany({
    where: { game: "PROJECT_ZOMBOID", status: { in: ["OPEN", "FULL"] } },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true, name: true, skillLevel: true, status: true,
      maxPlayers: true, modded: true,
      _count: { select: { members: true } },
    },
  });

  const SKILL: Record<string, string> = { BEGINNER: "Principiante", INTERMEDIATE: "Intermedio", ADVANCED: "Avanzado", EXPERT: "Experto" };

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
            <img src="/games/PZ.jpg" alt="Project Zomboid" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
              <h1 className="text-3xl font-bold text-white">Compañeros de Project Zomboid en español</h1>
            </div>
          </div>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Encuentra supervivientes para tu run de PZ — roleplay, hardcore, vanilla o mods. Parties y servidores permanentes en español con comunidad verificada.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/register" className="px-6 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-500 transition-colors">
              Buscar supervivientes gratis
            </Link>
            <Link href="/parties?game=PROJECT_ZOMBOID" className="px-6 py-3 rounded-xl bg-[var(--card)] border border-[var(--card-border)] text-white font-semibold hover:bg-[var(--muted)] transition-colors">
              Ver parties activas
            </Link>
          </div>
        </div>

        {/* Parties */}
        {parties.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Parties de Project Zomboid ahora mismo</h2>
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
                  <div className="flex gap-2 text-xs text-[var(--muted-foreground)]">
                    <span>{SKILL[p.skillLevel]}</span>
                    <span>·</span>
                    <span>{p._count.members}/{p.maxPlayers} jugadores</span>
                    {p.modded && <><span>·</span><span className="text-purple-400">Mods</span></>}
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-4">
              <Link href="/parties?game=PROJECT_ZOMBOID" className="text-sm text-orange-400 hover:text-orange-300 transition-colors">
                Ver todas las parties de Project Zomboid →
              </Link>
            </div>
          </section>
        )}

        {/* Por qué */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">¿Por qué usar GameMate para PZ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { emoji: "🧟", title: "Todos los estilos", desc: "Roleplay, hardcore, vanilla, mods, PvE, PvP. Encuentra exactamente el tipo de run que buscas." },
              { emoji: "🔒", title: "Comunidad fiable", desc: "Sin gente que abandona al segundo día. Las valoraciones penalizan la falta de compromiso." },
              { emoji: "🖥️", title: "Servidores reales", desc: "Además de parties, encuentra servidores permanentes hispanohablantes verificados." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5">
                <div className="text-2xl mb-2">{item.emoji}</div>
                <h3 className="font-semibold text-white text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-[var(--muted-foreground)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Servidores */}
        <section>
          <h2 className="text-xl font-bold text-white mb-2">Servidores de Project Zomboid en español</h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            ¿Prefieres un servidor permanente? Consulta el tablón de GameMate con servidores hispanos como MEMENTO MORI, NosferaDomain o BlackOut En La Mazmorra.
          </p>
          <Link href="/servers?game=PROJECT_ZOMBOID" className="inline-flex px-5 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--card-border)] text-white hover:border-orange-500/50 transition-all text-sm font-medium">
            Ver servidores de Project Zomboid →
          </Link>
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
          <h2 className="text-2xl font-bold text-white mb-2">¿Listo para sobrevivir juntos?</h2>
          <p className="text-[var(--muted-foreground)] mb-6">Regístrate gratis y encuentra tu equipo de supervivencia en minutos.</p>
          <Link href="/register" className="px-8 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-500 transition-colors text-lg">
            Empezar gratis
          </Link>
        </section>

      </main>
      <Footer />
    </div>
  );
}
