import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Footer } from "@/components/layout/footer";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buscar compañeros de Minecraft en español | GameMate",
  description:
    "Encuentra jugadores de Minecraft a tu nivel: survival, hardcore, SMP, modpacks. Comunidad española activa. Perfiles verificados y sistema de reputación. Gratis.",
  openGraph: {
    title: "Buscar compañeros de Minecraft en español | GameMate",
    description: "Encuentra jugadores de Minecraft a tu nivel. Survival, hardcore, SMP, modpacks. Comunidad española verificada.",
    url: "https://gamemate.es/es/minecraft",
    siteName: "GameMate",
    type: "website",
    images: [{ url: "https://gamemate.es/games/biome-minecraft.webp", width: 800, height: 400 }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Buscar compañeros de Minecraft en español",
  description: "Plataforma para encontrar jugadores de Minecraft en español a tu nivel.",
  url: "https://gamemate.es/es/minecraft",
  inLanguage: "es",
};

const FAQ = [
  {
    q: "¿Cómo encuentro compañeros para Minecraft en español?",
    a: "En GameMate puedes crear o unirte a parties de Minecraft filtradas por nivel, versión (Java/Bedrock) y estilo de juego. Todos los perfiles están verificados.",
  },
  {
    q: "¿Para qué modos de juego hay parties?",
    a: "Survival vanilla, hardcore, SkyBlock, SMP, modpacks como RLCraft o ATM9, creativo, factions y más. Filtra por nivel para encontrar gente a tu altura.",
  },
  {
    q: "¿Es gratuito?",
    a: "Completamente gratis para los jugadores. Sin suscripciones ni anuncios. GameMate vive de donaciones voluntarias.",
  },
  {
    q: "¿También hay servidores de Minecraft en español?",
    a: "Sí, en el tablón de servidores de GameMate puedes encontrar servidores permanentes en español como Supercraft, Obsilion, DEATHZONE o Arefy.",
  },
];

export default async function MinecraftPage() {
  const parties = await prisma.party.findMany({
    where: { game: "MINECRAFT", status: { in: ["OPEN", "FULL"] } },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true, name: true, skillLevel: true, status: true,
      maxPlayers: true, minecraftVersion: true, modded: true,
      _count: { select: { members: true } },
    },
  });

  const SKILL: Record<string, string> = { BEGINNER: "Principiante", INTERMEDIATE: "Intermedio", ADVANCED: "Avanzado", EXPERT: "Experto" };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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
            <img src="/games/biome-minecraft.webp" alt="Minecraft" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
              <h1 className="text-3xl font-bold text-white">Compañeros de Minecraft en español</h1>
            </div>
          </div>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Encuentra jugadores de Minecraft a tu nivel — survival, hardcore, SMP, modpacks. Todos los perfiles verificados, con reputación real de la comunidad.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/register" className="px-6 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-500 transition-colors">
              Buscar equipo gratis
            </Link>
            <Link href="/parties?game=MINECRAFT" className="px-6 py-3 rounded-xl bg-[var(--card)] border border-[var(--card-border)] text-white font-semibold hover:bg-[var(--muted)] transition-colors">
              Ver parties activas
            </Link>
          </div>
        </div>

        {/* Parties activas */}
        {parties.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Parties de Minecraft ahora mismo</h2>
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
                    {p.minecraftVersion && <><span>·</span><span>{p.minecraftVersion}</span></>}
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-4">
              <Link href="/parties?game=MINECRAFT" className="text-sm text-orange-400 hover:text-orange-300 transition-colors">
                Ver todas las parties de Minecraft →
              </Link>
            </div>
          </section>
        )}

        {/* Por qué GameMate */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">¿Por qué usar GameMate para Minecraft?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { emoji: "⭐", title: "Reputación verificada", desc: "Cada jugador tiene valoraciones reales de partidas anteriores. Sin sorpresas." },
              { emoji: "🎯", title: "Filtro por nivel", desc: "Principiante, intermedio, avanzado o experto. Encuentras gente a tu altura." },
              { emoji: "📋", title: "Normas claras", desc: "Cada party tiene reglas definidas: vanilla, mods, horarios, estilo de juego." },
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
          <h2 className="text-xl font-bold text-white mb-2">Servidores de Minecraft en español</h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            ¿Buscas un servidor permanente? En el tablón de GameMate encontrarás servidores como Supercraft, Obsilion, DEATHZONE o Arefy.
          </p>
          <Link href="/servers?game=MINECRAFT" className="inline-flex px-5 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--card-border)] text-white hover:border-orange-500/50 transition-all text-sm font-medium">
            Ver servidores de Minecraft →
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

        {/* CTA final */}
        <section className="text-center rounded-2xl bg-orange-600/10 border border-orange-500/20 p-8">
          <h2 className="text-2xl font-bold text-white mb-2">¿Listo para encontrar tu equipo?</h2>
          <p className="text-[var(--muted-foreground)] mb-6">Regístrate gratis y crea o únete a una party de Minecraft en menos de 2 minutos.</p>
          <Link href="/register" className="px-8 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-500 transition-colors text-lg">
            Empezar gratis
          </Link>
        </section>

      </main>
      <Footer />
    </div>
  );
}
