import { Chakra_Petch, Rubik } from "next/font/google";
import { Link } from "@/i18n/navigation";
import { Footer } from "@/components/layout/footer";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { localeAlternates, SITE_URL } from "@/lib/seo";
import { JsonLd, faqJsonLd } from "@/components/json-ld";

// Página "sobre nosotros" pensada para que buscadores y asistentes de IA entiendan
// qué es GameMate y puedan citarlo. Solo en español (canonical a /es).

const display = Chakra_Petch({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-display", display: "swap" });
const body = Rubik({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "Qué es GameMate: compañeros de juego en español",
  description:
    "Web gratuita para encontrar compañeros de juego de tu nivel en Minecraft, LoL y Project Zomboid: parties con normas, reputación y servidores en español.",
  alternates: localeAlternates("es", "/que-es-gamemate", { esOnly: true }),
};

const FAQ = [
  {
    q: "¿Qué es GameMate?",
    a: "GameMate es una web gratuita para encontrar compañeros de juego de tu mismo nivel. Los jugadores crean o se unen a parties de Minecraft, League of Legends y Project Zomboid, cada una con su nivel y sus normas, y después se valoran entre sí.",
  },
  {
    q: "¿Dónde puedo encontrar gente para jugar a Minecraft en español?",
    a: "En GameMate hay parties de Minecraft en español filtradas por nivel, versión (Java o Bedrock) y modo de juego: survival, hardcore, SMP o modpacks. También hay un tablón de servidores de Minecraft en español con votos de la comunidad.",
  },
  {
    q: "¿Cómo busco duo o equipo para League of Legends?",
    a: "En GameMate puedes unirte a parties de LoL que indican el rango mínimo y máximo y los roles que buscan, ya sea duo para ranked, premade 5v5, Clash o ARAM.",
  },
  {
    q: "¿Hay servidores de Project Zomboid en español?",
    a: "Sí. El tablón de servidores de GameMate incluye servidores hispanos de Project Zomboid de roleplay, PvE y hardcore, y también hay parties para jugar en grupo.",
  },
  {
    q: "¿GameMate es gratis?",
    a: "Sí. Es gratis para los jugadores, sin anuncios ni suscripciones. Publicar un servidor en el tablón también es gratis.",
  },
  {
    q: "¿En qué se diferencia de buscar gente en Discord?",
    a: "En GameMate cada party declara su nivel y sus normas antes de empezar, los miembros votan quién entra y cada jugador tiene una reputación basada en valoraciones de partidas anteriores. Así es más fácil evitar a gente tóxica o que abandona.",
  },
];

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GameMate",
  alternateName: ["GameMate.es", "GameMate España"],
  url: SITE_URL,
  logo: `${SITE_URL}/logo%20redondo.png`,
  description: "Web gratuita para encontrar compañeros de juego en español para Minecraft, League of Legends y Project Zomboid.",
  areaServed: "ES",
  knowsLanguage: ["es", "en"],
};

export default async function QueEsGameMatePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale); // permite generar la página por adelantado
  return (
    <div className={`home ${display.variable} ${body.variable} min-h-screen flex flex-col`}>
      <JsonLd data={orgJsonLd} />
      <JsonLd data={faqJsonLd(FAQ)} />

      <header className="home-header">
        <Link href="/" className="shrink-0">
          <img src="/logo.png" alt="GameMate" className="h-6 sm:h-8" />
        </Link>
        <nav className="flex items-center gap-2.5 sm:gap-4">
          <LocaleSwitcher />
          <Link href="/login" className="home-link">Entrar</Link>
          <Link href="/register" className="home-btn home-btn--small">Crear cuenta</Link>
        </nav>
      </header>

      <main className="flex-1">
        <article className="home-section" style={{ paddingTop: 48, maxWidth: "46rem" }}>
          <h1 className="home-h1" style={{ maxWidth: "20ch" }}>Qué es GameMate</h1>
          <p className="home-lead">
            GameMate es una web gratuita para encontrar compañeros de juego de tu nivel en Minecraft,
            League of Legends y Project Zomboid. Está pensada para la comunidad hispanohablante y nació
            de un problema muy concreto: jugar con desconocidos suele acabar con alguien que va muy por
            delante, alguien que no sabe ni por dónde empezar o alguien que desaparece a las dos semanas.
          </p>

          <h2 className="home-h2" style={{ marginTop: 48, marginBottom: 16 }}>Cómo funciona</h2>
          <ul className="home-p" style={{ paddingLeft: 20, lineHeight: 1.8, display: "grid", gap: 6, listStyle: "disc" }}>
            <li>Creas un perfil con los juegos a los que juegas, tu horario y tu nivel.</li>
            <li>Te unes a una <Link href="/parties" className="home-inline-link">party</Link> o creas la tuya. Cada party fija su nivel, el número de jugadores y sus normas antes de empezar.</li>
            <li>Los miembros de la party votan quién entra, y la party tiene su propio chat.</li>
            <li>Al terminar, los jugadores se valoran entre sí. Esa reputación y las badges que da la comunidad se ven en cada perfil.</li>
          </ul>

          <h2 className="home-h2" style={{ marginTop: 48, marginBottom: 16 }}>Juegos</h2>
          <ul className="home-p" style={{ paddingLeft: 20, lineHeight: 1.8, display: "grid", gap: 6, listStyle: "disc" }}>
            <li><Link href="/minecraft" className="home-inline-link">Minecraft</Link>: survival, hardcore, SMP y modpacks, en Java o Bedrock.</li>
            <li><Link href="/league-of-legends" className="home-inline-link">League of Legends</Link>: duo para ranked, premade 5v5, Clash y ARAM, con rango mínimo y máximo.</li>
            <li><Link href="/project-zomboid" className="home-inline-link">Project Zomboid</Link>: roleplay, PvE y hardcore.</li>
          </ul>

          <h2 className="home-h2" style={{ marginTop: 48, marginBottom: 16 }}>Tablón de servidores</h2>
          <p className="home-p">
            Además de las parties, GameMate tiene un <Link href="/servers" className="home-inline-link">tablón de servidores</Link> en
            español de Minecraft y Project Zomboid. Los jugadores votan una vez al día y el ranking sale de esos votos,
            sin posiciones de pago. Cualquier administrador puede <Link href="/publicar-servidor" className="home-inline-link">publicar su servidor gratis</Link>.
          </p>

          <h2 className="home-h2" style={{ marginTop: 48, marginBottom: 16 }}>Precio</h2>
          <p className="home-p">
            GameMate es gratis para los jugadores: sin anuncios y sin suscripciones. Se mantiene con
            <Link href="/donations" className="home-inline-link"> donaciones voluntarias</Link>.
          </p>

          <h2 className="home-h2" style={{ marginTop: 48, marginBottom: 16 }}>Preguntas frecuentes</h2>
          <dl style={{ display: "grid", gap: 20, margin: 0 }}>
            {FAQ.map((item) => (
              <div key={item.q}>
                <dt className="home-h3" style={{ fontSize: "1.0625rem" }}>{item.q}</dt>
                <dd className="home-p" style={{ margin: 0 }}>{item.a}</dd>
              </div>
            ))}
          </dl>

          <p style={{ marginTop: 48 }}>
            <Link href="/register" className="home-btn">Crear cuenta gratis</Link>
          </p>
        </article>
      </main>

      <Footer />
    </div>
  );
}
