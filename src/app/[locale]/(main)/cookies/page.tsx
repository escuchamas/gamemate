interface Props { params: Promise<{ locale: string }> }

export default async function CookiesPage({ params }: Props) {
  const { locale } = await params;
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      {locale === "en" && (
        <div className="rounded-lg bg-[var(--muted)] border border-[var(--card-border)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
          This cookie policy is published in Spanish as required by Spanish law.
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold text-white">Política de Cookies</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Última actualización: mayo 2025</p>
      </div>

      <Section title="¿Qué son las cookies?">
        <p>
          Las cookies son pequeños archivos de texto que un sitio web almacena en tu dispositivo cuando lo visitas.
          Permiten que el sitio recuerde información sobre tu visita, como tu sesión iniciada, lo que facilita
          el uso de la plataforma.
        </p>
      </Section>

      <Section title="Cookies que usamos actualmente">
        <div className="rounded-xl border border-[var(--card-border)] overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[var(--muted)] text-[var(--foreground)]">
                <th className="px-4 py-2.5 text-left font-semibold">Cookie</th>
                <th className="px-4 py-2.5 text-left font-semibold">Tipo</th>
                <th className="px-4 py-2.5 text-left font-semibold">Duración</th>
                <th className="px-4 py-2.5 text-left font-semibold">Finalidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              <tr className="bg-[var(--card)]">
                <td className="px-4 py-3 font-mono text-[var(--foreground)]">authjs.session-token</td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">Esencial</td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">30 días</td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">Mantiene tu sesión iniciada. Sin esta cookie no puedes usar la plataforma.</td>
              </tr>
              <tr className="bg-[var(--card)]">
                <td className="px-4 py-3 font-mono text-[var(--foreground)]">authjs.csrf-token</td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">Esencial</td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">Sesión</td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">Protección CSRF (seguridad en formularios). Necesaria para la seguridad.</td>
              </tr>
              <tr className="bg-[var(--card)]">
                <td className="px-4 py-3 font-mono text-[var(--foreground)]">gamemate_cookie_consent</td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">Funcional</td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">1 año</td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">Almacena tu aceptación del aviso de cookies para no mostrarlo repetidamente.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">
          Las cookies esenciales son necesarias para el funcionamiento básico de la plataforma y no requieren consentimiento según el RGPD y la Directiva ePrivacy.
        </p>
      </Section>

      <Section title="Cookies de marketing (Meta Pixel — próximamente)">
        <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 flex flex-col gap-2">
          <p className="text-sm font-medium text-amber-400">Estas cookies no están activas actualmente</p>
          <p className="text-sm text-[var(--muted-foreground)]">
            En el futuro, GameMate podrá incorporar el <strong className="text-[var(--foreground)]">Píxel de Meta (Facebook/Instagram)</strong> en la landing page con fines de analítica de campañas de marketing.
            Este píxel instalaría cookies de terceros de Meta Platforms Ireland Ltd. que permiten medir la efectividad de anuncios.
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">
            <strong className="text-[var(--foreground)]">Cuando se active:</strong> actualizaremos esta política, mostraremos un banner de consentimiento específico y te daremos la opción de aceptar o rechazar estas cookies antes de que se instalen.
            Conforme al RGPD, estas cookies requieren tu consentimiento previo, libre e informado.
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">
            Puedes consultar la política de privacidad de Meta en{" "}
            <a href="https://www.facebook.com/policy.php" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">
              facebook.com/policy.php
            </a>.
          </p>
        </div>
      </Section>

      <Section title="Cómo gestionar o eliminar las cookies">
        <p>
          Puedes configurar tu navegador para rechazar o eliminar cookies en cualquier momento.
          Ten en cuenta que deshabilitar las cookies esenciales impedirá el funcionamiento correcto de la plataforma (no podrás iniciar sesión).
        </p>
        <ul>
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Safari</a></li>
          <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Microsoft Edge</a></li>
        </ul>
      </Section>

      <Section title="Contacto">
        <p>
          Si tienes preguntas sobre el uso de cookies en GameMate, puedes escribirnos a{" "}
          <a href="mailto:soporte@gamemate.es" className="text-orange-400 hover:underline">soporte@gamemate.es</a>{" "}
          o usar el{" "}
          <a href="/contact" className="text-orange-400 hover:underline">formulario de contacto</a>.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <div className="text-sm text-[var(--muted-foreground)] flex flex-col gap-2 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5 [&_ul]:pl-4 [&_ul]:list-disc [&_strong]:text-[var(--foreground)]">
        {children}
      </div>
    </section>
  );
}
