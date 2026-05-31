export default function LegalPage() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Aviso Legal</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Última actualización: mayo 2025</p>
      </div>

      <Section title="1. Datos identificativos">
        <p>En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa:</p>
        <ul>
          <li><strong>Titular:</strong> Fernando Zaragoza</li>
          <li><strong>NIF:</strong> 77197293R</li>
          <li><strong>Email:</strong> hola@gamemate.es</li>
          <li><strong>Dominio:</strong> gamemate.es</li>
        </ul>
      </Section>

      <Section title="2. Objeto y ámbito de aplicación">
        <p>
          GameMate es una plataforma gratuita de matchmaking para videojuegos que permite a los usuarios
          encontrar otros jugadores con quienes jugar online. El uso de la plataforma implica la aceptación de las presentes condiciones.
        </p>
      </Section>

      <Section title="3. Propiedad intelectual">
        <p>
          El diseño, código fuente, logotipos, textos y demás elementos de GameMate son propiedad del titular
          o cuentan con las licencias correspondientes. Queda prohibida su reproducción, distribución o
          comunicación pública sin autorización expresa, salvo para uso personal y no comercial.
        </p>
        <p>
          Los usuarios conservan la titularidad del contenido que publican (nombres de parties, mensajes, etc.)
          y otorgan a GameMate una licencia no exclusiva para mostrarlo dentro de la plataforma.
        </p>
      </Section>

      <Section title="4. Responsabilidad">
        <p>
          GameMate actúa como plataforma intermediaria. No se hace responsable de las acciones de sus usuarios,
          del contenido publicado por ellos, ni de la veracidad de los perfiles. Los usuarios son los únicos
          responsables del uso que hagan de la plataforma.
        </p>
        <p>
          GameMate no garantiza la disponibilidad continua del servicio y puede interrumpirlo temporalmente
          por mantenimiento o causas de fuerza mayor.
        </p>
      </Section>

      <Section title="5. Ley aplicable y jurisdicción">
        <p>
          Este aviso legal se rige por la legislación española. Para cualquier controversia, ambas partes
          se someten, con renuncia a cualquier otro fuero, a los juzgados y tribunales del domicilio del titular.
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
