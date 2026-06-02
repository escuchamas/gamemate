interface Props { params: Promise<{ locale: string }> }

export default async function DonationsPage({ params }: Props) {
  const { locale } = await params;
  const en = locale === "en";

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          {en ? "Support GameMate" : "Apoya GameMate"}
        </h1>
        <p className="text-[var(--muted-foreground)] mt-2">
          {en
            ? "GameMate is free forever for players. If it helped you find your crew and you want to help keep it alive, any support is hugely appreciated."
            : "GameMate es gratis para siempre para el jugador. Si te ayuda a encontrar tu equipo y quieres contribuir a mantenerlo vivo, cualquier apoyo se agradece enormemente."}
        </p>
      </div>

      <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">💙</span>
          <div>
            <p className="font-semibold text-white">
              {en ? "One-time donation via PayPal" : "Donación puntual con PayPal"}
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              {en
                ? "No commitment. Any amount helps pay for servers and keep the platform running."
                : "Sin compromiso. Cualquier cantidad ayuda a pagar servidores y mantener la plataforma en marcha."}
            </p>
          </div>
        </div>
        <a
          href="https://paypal.me/paginasamarillas"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0070BA] text-white font-semibold hover:bg-[#005EA6] transition-colors text-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/>
          </svg>
          {en ? "Donate with PayPal" : "Donar con PayPal"}
        </a>
        <p className="text-xs text-[var(--muted-foreground)] text-center">
          {en
            ? "You'll be redirected to PayPal.me. GameMate does not store payment data."
            : "Serás redirigido a PayPal.me. GameMate no almacena datos de pago."}
        </p>
      </div>

      <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-6">
        <h2 className="font-semibold text-white mb-3">
          {en ? "What is the money used for?" : "¿En qué se usa el dinero?"}
        </h2>
        <ul className="flex flex-col gap-2">
          {(en ? [
            { emoji: "🖥️", text: "Servers and database (Neon, Vercel)" },
            { emoji: "🌐", text: "Domain — gamemate.es" },
            { emoji: "📧", text: "Transactional email service (Resend)" },
            { emoji: "🛠️", text: "Development of new features" },
            { emoji: "🚀", text: "Infrastructure to scale as the community grows" },
          ] : [
            { emoji: "🖥️", text: "Servidores y base de datos (Neon, Vercel)" },
            { emoji: "🌐", text: "Dominio — gamemate.es" },
            { emoji: "📧", text: "Servicio de emails transaccionales (Resend)" },
            { emoji: "🛠️", text: "Desarrollo de nuevas funcionalidades" },
            { emoji: "🚀", text: "Infraestructura para escalar cuando llegue más gente" },
          ]).map((item) => (
            <li key={item.text} className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <span>{item.emoji}</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-center text-sm text-[var(--muted-foreground)]">
        {en ? "Want to collaborate in another way? " : "¿Prefieres colaborar de otra forma? "}
        <a href="/sponsorship" className="text-orange-400 hover:underline">
          {en ? "Check sponsorship options" : "Mira las opciones de patrocinio"}
        </a>
      </p>
    </div>
  );
}
