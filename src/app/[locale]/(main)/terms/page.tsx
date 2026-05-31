export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Términos y Condiciones de Uso</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Última actualización: mayo 2025</p>
      </div>

      <Section title="1. Aceptación de los términos">
        <p>
          Al acceder o utilizar GameMate (en adelante, "la Plataforma"), disponible en <strong>gamemate.es</strong>,
          aceptas quedar vinculado por estos Términos y Condiciones. Si no estás de acuerdo con alguna parte,
          no podrás acceder al servicio.
        </p>
        <p>
          El uso continuado de la Plataforma tras la publicación de modificaciones implica la aceptación de los nuevos términos.
        </p>
      </Section>

      <Section title="2. Descripción del servicio">
        <p>
          GameMate es una plataforma gratuita de matchmaking para videojuegos que permite a los usuarios
          crear y unirse a "parties" (grupos de juego), gestionar perfiles de jugador, comunicarse con otros
          usuarios y valorar su experiencia de juego. La Plataforma actúa exclusivamente como intermediaria
          entre jugadores y no participa en las partidas ni es responsable de lo que ocurra en ellas.
        </p>
      </Section>

      <Section title="3. Registro y cuenta de usuario">
        <ul>
          <li>Para acceder a la mayoría de funciones debes crear una cuenta con email y contraseña.</li>
          <li>Debes proporcionar información veraz y mantenerla actualizada.</li>
          <li>Eres responsable de mantener la confidencialidad de tus credenciales.</li>
          <li>Debes tener al menos <strong>16 años</strong> para registrarte (edad mínima para el tratamiento de datos en España bajo el RGPD).</li>
          <li>Está prohibido crear cuentas falsas, múltiples cuentas para evadir sanciones o hacerse pasar por otra persona.</li>
        </ul>
      </Section>

      <Section title="4. Contenido del usuario">
        <p>
          <strong>Titularidad:</strong> conservas todos los derechos sobre el contenido que publicas (mensajes, descripción de perfil, nombres de parties, etc.).
        </p>
        <p>
          <strong>Licencia a GameMate:</strong> al publicar contenido en la Plataforma, nos otorgas una licencia no exclusiva, gratuita y mundial para mostrar, almacenar y transmitir dicho contenido dentro de la Plataforma con el único fin de prestar el servicio.
        </p>
        <p>
          <strong>Responsabilidad:</strong> eres el único responsable del contenido que publicas. GameMate no revisa el contenido de forma proactiva, pero se reserva el derecho a eliminarlo si infringe estos términos.
        </p>
      </Section>

      <Section title="5. Conducta prohibida">
        <p>Está terminantemente prohibido:</p>
        <ul>
          <li>Publicar contenido ilegal, amenazante, difamatorio, obsceno o que incite al odio.</li>
          <li>Acosar, intimidar o discriminar a otros usuarios.</li>
          <li>Usar la Plataforma para actividades fraudulentas o engañosas.</li>
          <li>Intentar acceder sin autorización a sistemas, cuentas o datos ajenos.</li>
          <li>Realizar scraping, crawling automatizado o extracción masiva de datos sin autorización escrita.</li>
          <li>Reproducir, copiar o redistribuir la Plataforma o cualquier parte de ella con fines comerciales sin autorización.</li>
          <li>Utilizar bots, scripts u otros medios automatizados para interactuar con la Plataforma.</li>
        </ul>
      </Section>

      <Section title="6. Propiedad intelectual">
        <p>
          El nombre <strong>GameMate</strong>, el logotipo, el diseño, el código fuente, la arquitectura de la Plataforma,
          el sistema de matchmaking y todos los elementos originales son propiedad exclusiva del titular
          y están protegidos por la legislación española e internacional de propiedad intelectual e industrial.
        </p>
        <p>
          Queda prohibida su reproducción total o parcial, distribución, comunicación pública, transformación
          o cualquier otro uso sin autorización expresa y por escrito del titular.
          Esto incluye expresamente la copia del modelo de negocio, la estructura de la Plataforma o cualquier
          elemento que constituya una imitación sustancial de GameMate.
        </p>
      </Section>

      <Section title="7. Moderación y suspensión de cuentas">
        <p>
          GameMate se reserva el derecho de suspender o eliminar cuentas, sin previo aviso ni obligación de reembolso,
          en caso de:
        </p>
        <ul>
          <li>Incumplimiento de estos Términos.</li>
          <li>Conducta que perjudique a otros usuarios o a la Plataforma.</li>
          <li>Actividad fraudulenta o sospechosa.</li>
          <li>Solicitud de autoridades competentes.</li>
        </ul>
      </Section>

      <Section title="8. Limitación de responsabilidad">
        <p>
          GameMate no es responsable de:
        </p>
        <ul>
          <li>El comportamiento de los usuarios dentro o fuera de la Plataforma.</li>
          <li>El resultado de las partidas o experiencias de juego organizadas a través de GameMate.</li>
          <li>Interrupciones del servicio por mantenimiento, fallos técnicos o causas de fuerza mayor.</li>
          <li>Pérdida de datos o contenido por fallos del sistema fuera de nuestro control razonable.</li>
          <li>Daños indirectos, incidentales o consecuentes derivados del uso de la Plataforma.</li>
        </ul>
        <p>
          El servicio se proporciona "tal cual" (as is), sin garantías de disponibilidad continua o ausencia de errores.
        </p>
      </Section>

      <Section title="9. Donaciones y patrocinio">
        <p>
          La Plataforma es gratuita para el jugador. Las donaciones voluntarias o acuerdos de patrocinio
          no otorgan ningún derecho adicional, ventaja en el matchmaking ni acceso prioritario.
          Las donaciones no son reembolsables salvo error técnico demostrable.
        </p>
      </Section>

      <Section title="10. Privacidad">
        <p>
          El tratamiento de tus datos personales se rige por nuestra{" "}
          <a href="/privacy" className="text-orange-400 hover:underline">Política de Privacidad</a>,
          que forma parte integrante de estos Términos.
        </p>
      </Section>

      <Section title="11. Modificaciones del servicio">
        <p>
          GameMate se reserva el derecho de modificar, suspender o interrumpir el servicio en cualquier momento,
          con o sin previo aviso. No seremos responsables ante ti ni ante terceros por ninguna modificación,
          suspensión o interrupción del servicio.
        </p>
      </Section>

      <Section title="12. Ley aplicable y jurisdicción">
        <p>
          Estos Términos se rigen por la legislación española. Para cualquier controversia derivada de su
          interpretación o cumplimiento, ambas partes se someten, con renuncia expresa a cualquier otro fuero,
          a los juzgados y tribunales del domicilio del titular de la Plataforma.
        </p>
      </Section>

      <Section title="13. Contacto">
        <p>
          Para cualquier consulta sobre estos Términos, puedes escribirnos a{" "}
          <a href="mailto:hola@gamemate.es" className="text-orange-400 hover:underline">hola@gamemate.es</a>{" "}
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
