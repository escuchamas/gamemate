import { Link } from "@/i18n/navigation";
import { Footer } from "@/components/layout/footer";
import { PublicHeader } from "@/components/layout/public-header";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { JsonLd, faqJsonLd } from "@/components/json-ld";
import { localeAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: localeAlternates("es", "/publicar-servidor", { esOnly: true }),
  title: "Publicar servidor de Minecraft o Zomboid gratis",
  description:
    "Publica gratis tu servidor en el tablón de GameMate y llega a jugadores hispanohablantes. Votos diarios para subir en el ranking, sin posiciones de pago.",
  openGraph: {
    title: "Publicar servidor en GameMate — gratis y sin comisiones",
    description:
      "Publica tu servidor de Minecraft o Project Zomboid. Llega a jugadores hispanohablantes con reputación verificada.",
    url: "https://gamemate.es/es/publicar-servidor",
    siteName: "GameMate",
    type: "website",
    images: [{ url: "https://gamemate.es/games/biome-minecraft.webp", width: 800, height: 400 }],
  },
};

const STEPS = [
  {
    n: "1",
    title: "Crea tu cuenta gratis",
    desc: "Regístrate en menos de un minuto con Google o con tu email. Sin datos de pago, sin suscripciones.",
  },
  {
    n: "2",
    title: "Rellena la ficha del servidor",
    desc: "Nombre, descripción, IP/web, juego, modo y lo que lo hace especial. Menos de 3 minutos.",
  },
  {
    n: "3",
    title: "Aparece en el tablón",
    desc: "Tu servidor queda visible para toda la comunidad hispanohablante. Los jugadores votan cada día para subirte en el ranking.",
  },
];

const BENEFITS = [
  {
    emoji: "🆓",
    title: "Completamente gratis",
    desc: "Publicar y mantener tu servidor en GameMate no cuesta nada. Sin planes de pago, sin posiciones de pago.",
  },
  {
    emoji: "🗳️",
    title: "Sistema de votos diarios",
    desc: "Cada jugador puede votar una vez al día. Los servidores más activos suben en el ranking de forma orgánica.",
  },
  {
    emoji: "🇪🇸",
    title: "Comunidad hispanohablante",
    desc: "Todos los jugadores de GameMate buscan específicamente compañeros en español. Tu servidor llega al público correcto.",
  },
  {
    emoji: "✅",
    title: "Jugadores con reputación",
    desc: "Los usuarios tienen valoraciones de partidas anteriores. Sabes si la gente que se une a tu servidor es seria.",
  },
  {
    emoji: "🔗",
    title: "Enlaza tu Discord o web",
    desc: "Incluye el link de tu Discord, web o foro para que los jugadores interesados puedan contactar directamente.",
  },
  {
    emoji: "📊",
    title: "Visibilidad en las landings de juego",
    desc: "Tu servidor aparece también en las páginas de Minecraft, Project Zomboid y LoL con tráfico SEO orgánico.",
  },
];

const FAQ = [
  {
    q: "¿Hay algún coste por publicar mi servidor?",
    a: "No. Publicar y mantener el servidor en el tablón de GameMate es completamente gratis, ahora y siempre. GameMate vive de donaciones voluntarias de la comunidad.",
  },
  {
    q: "¿Qué juegos puedo publicar?",
    a: "Ahora mismo: Minecraft (Java y Bedrock), Project Zomboid y League of Legends. Si tu juego no está en la lista, puedes publicarlo igualmente en la categoría Otro.",
  },
  {
    q: "¿Cómo funciona el ranking?",
    a: "Los jugadores registrados pueden votar tu servidor una vez al día. Cuantos más votos acumules, más arriba apareces. No hay posiciones de pago.",
  },
  {
    q: "¿Puedo incluir el Discord de mi servidor?",
    a: "Sí. Puedes añadir el enlace de Discord, tu web o cualquier URL relevante en la ficha del servidor.",
  },
  {
    q: "¿Cuánto tiempo tarda en aparecer?",
    a: "Tu servidor es visible de forma inmediata después de publicarlo, sin revisión manual previa.",
  },
];

export default async function PublicarServidorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale); // permite generar la página por adelantado
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <PublicHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 flex flex-col gap-14">

        {/* Hero */}
        <div className="text-center flex flex-col gap-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/15 border border-orange-500/25 text-orange-400 text-xs font-medium mx-auto">
            🖥️ Para administradores de servidor
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Publica tu servidor y encuentra<br />jugadores hispanohablantes
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Gratis, sin comisiones, sin posiciones de pago. El ranking lo decide la comunidad con votos diarios.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/servers/new"
              className="px-7 py-3 rounded-xl bg-[var(--primary)] text-white shadow-[0_3px_0_var(--primary-edge)] active:translate-y-[3px] active:shadow-none font-semibold hover:bg-[var(--primary-hover)] transition-colors text-base"
            >
              Publicar mi servidor gratis
            </Link>
            <Link
              href="/servers"
              className="px-7 py-3 rounded-xl bg-[var(--card)] border border-[var(--card-border)] text-white font-semibold hover:bg-[var(--muted)] transition-colors text-base"
            >
              Ver el tablón
            </Link>
          </div>
        </div>

        {/* Cómo funciona */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6 text-center">Cómo funciona</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-6 flex flex-col gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {s.n}
                </div>
                <h3 className="font-semibold text-white text-sm">{s.title}</h3>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Beneficios */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6">¿Por qué publicar en GameMate?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5 flex gap-4">
                <div className="text-2xl flex-shrink-0">{b.emoji}</div>
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1">{b.title}</h3>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <JsonLd data={faqJsonLd(FAQ)} />
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
          <h2 className="text-2xl font-bold text-white mb-2">¿Tienes un servidor? Publícalo ahora</h2>
          <p className="text-[var(--muted-foreground)] mb-6 max-w-lg mx-auto">
            En menos de 3 minutos tu servidor estará visible para toda la comunidad hispanohablante. Gratis para siempre.
          </p>
          <Link
            href="/servers/new"
            className="px-8 py-3 rounded-xl bg-[var(--primary)] text-white shadow-[0_3px_0_var(--primary-edge)] active:translate-y-[3px] active:shadow-none font-semibold hover:bg-[var(--primary-hover)] transition-colors text-lg"
          >
            Publicar mi servidor gratis
          </Link>
        </section>

      </main>
      <Footer />
    </div>
  );
}
