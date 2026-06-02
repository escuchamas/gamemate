import { Link } from "@/i18n/navigation";

interface Props { params: Promise<{ locale: string }> }

export default async function SponsorshipPage({ params }: Props) {
  const { locale } = await params;
  const en = locale === "en";

  const features = en ? [
    { emoji: "👥", title: "Real audience", desc: "Active Minecraft and Project Zomboid players looking for teammates. No bots, no fake accounts." },
    { emoji: "🎯", title: "Targeted reach", desc: "Reach players by skill level, game, or language. Your message to the right audience." },
    { emoji: "🤝", title: "Honest integration", desc: "No misleading advertising. Any collaboration is presented transparently as such." },
  ] : [
    { emoji: "👥", title: "Audiencia real", desc: "Jugadores activos de Minecraft y Project Zomboid que buscan equipo. Sin bots, sin fake accounts." },
    { emoji: "🎯", title: "Alcance segmentado", desc: "Puedes llegar a jugadores por nivel, juego o idioma. Tu mensaje al público correcto." },
    { emoji: "🤝", title: "Integración honesta", desc: "No hacemos publicidad engañosa. Cualquier colaboración se presenta como tal, con transparencia." },
  ];

  const options = en ? [
    { title: "Banner on parties", desc: "Your logo visible in the parties listing. High visibility for gaming, hardware or software brands." },
    { title: "Newsletter / In-platform announcements", desc: "Direct message to active users inside the platform." },
    { title: "Content collaboration", desc: "Co-creation of tournaments, events or specific challenges for the community." },
    { title: "Custom", desc: "Have another idea? Tell us and we'll figure it out together." },
  ] : [
    { title: "Banner en parties", desc: "Tu logo visible en el listado de parties. Alta visibilidad para marcas de gaming, hardware o software." },
    { title: "Newsletter / Anuncios en plataforma", desc: "Mensaje directo a usuarios activos dentro de la plataforma." },
    { title: "Colaboración de contenido", desc: "Co-creación de torneos, eventos o retos específicos para la comunidad." },
    { title: "Personalizado", desc: "¿Tienes otra idea? Cuéntanosla y lo valoramos juntos." },
  ];

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold text-white">
          {en ? "Sponsorship" : "Patrocinio"}
        </h1>
        <p className="text-[var(--muted-foreground)] mt-2">
          {en
            ? "GameMate is an independent platform built by and for gamers. If your brand wants to reach a real gaming community, let's talk."
            : "GameMate es una plataforma independiente creada por y para gamers. Si tu marca quiere llegar a una comunidad gaming real, hablemos."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {features.map((item) => (
          <div key={item.title} className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5">
            <div className="text-3xl mb-3">{item.emoji}</div>
            <h3 className="font-semibold text-white mb-1">{item.title}</h3>
            <p className="text-sm text-[var(--muted-foreground)]">{item.desc}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          {en ? "Collaboration options" : "Opciones de colaboración"}
        </h2>
        <div className="flex flex-col gap-3">
          {options.map((opt) => (
            <div key={opt.title} className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-4 flex items-start gap-3">
              <span className="text-orange-500 mt-0.5">▸</span>
              <div>
                <p className="font-medium text-white text-sm">{opt.title}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{opt.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-orange-600/10 border border-orange-500/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-white">
            {en ? "Interested?" : "¿Interesado?"}
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">
            {en
              ? "Get in touch via the contact form and tell us your proposal."
              : "Escríbenos a través del formulario de contacto y cuéntanos tu propuesta."}
          </p>
        </div>
        <Link
          href="/contact"
          className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-500 transition-colors text-sm"
        >
          {en ? "Contact us" : "Contactar"}
        </Link>
      </div>
    </div>
  );
}
