export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 prose-sm">
      <div>
        <h1 className="text-2xl font-bold text-white">Política de Privacidad</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Última actualización: mayo 2025</p>
      </div>

      <Section title="1. Responsable del tratamiento">
        <p>El responsable del tratamiento de los datos personales recogidos en GameMate es:</p>
        <ul>
          <li><strong>Nombre:</strong> Fernando Zaragoza</li>
          <li><strong>Email de contacto:</strong> hola@gamemate.es</li>
          <li><strong>Dominio:</strong> gamemate.es</li>
        </ul>
        <p className="text-[var(--muted-foreground)] text-xs">
          Si eres ciudadano de la UE y necesitas ejercer tus derechos GDPR, contacta a través del formulario de contacto o por email.
        </p>
      </Section>

      <Section title="2. Datos que recogemos">
        <p>Recogemos los siguientes datos personales:</p>
        <ul>
          <li><strong>Registro:</strong> nombre de usuario, dirección de email y contraseña (almacenada de forma cifrada con bcrypt).</li>
          <li><strong>Perfil:</strong> foto de perfil (opcional), país, idiomas, perfil de juego.</li>
          <li><strong>Actividad:</strong> parties creadas o en las que participas, mensajes en el chat de grupo, valoraciones y solicitudes de amistad.</li>
          <li><strong>Contacto:</strong> mensajes enviados a través del formulario de contacto.</li>
          <li><strong>Técnicos:</strong> dirección IP y datos del navegador recogidos automáticamente por los servidores de Vercel.</li>
        </ul>
      </Section>

      <Section title="3. Finalidad y base jurídica">
        <ul>
          <li><strong>Prestación del servicio</strong> (base: ejecución de contrato / interés legítimo): gestionar tu cuenta, parties, chat y sistema de reputación.</li>
          <li><strong>Comunicaciones transaccionales</strong> (base: ejecución de contrato): emails de verificación de cuenta, recuperación de contraseña y notificaciones del servicio. No enviamos newsletters sin consentimiento expreso.</li>
          <li><strong>Seguridad y prevención de fraude</strong> (base: interés legítimo): detectar y prevenir actividad maliciosa.</li>
          <li><strong>Mejora del servicio</strong> (base: interés legítimo): analizar el uso de la plataforma para mejorarla.</li>
        </ul>
      </Section>

      <Section title="4. Conservación de datos">
        <p>
          Conservamos tus datos mientras tu cuenta esté activa. Si eliminas tu cuenta, los datos personales se eliminan en un plazo de 30 días, salvo que la ley exija conservarlos durante más tiempo.
          Los mensajes de chat y valoraciones pueden mantenerse de forma anonimizada para preservar la coherencia del historial de otros usuarios.
        </p>
      </Section>

      <Section title="5. Destinatarios y transferencias internacionales">
        <p>Compartimos datos mínimos e imprescindibles con los siguientes proveedores:</p>
        <ul>
          <li><strong>Vercel Inc.</strong> (alojamiento) — servidores en EE.UU., cubiertos por el marco EU-US Data Privacy Framework.</li>
          <li><strong>Neon Inc.</strong> (base de datos PostgreSQL) — datos en la región eu-central-1 (Frankfurt, UE).</li>
          <li><strong>Resend Inc.</strong> (envío de emails transaccionales) — datos en EE.UU., cubiertos por cláusulas contractuales tipo.</li>
        </ul>
        <p>No vendemos ni cedemos datos a terceros con fines publicitarios.</p>
      </Section>

      <Section title="6. Tus derechos (GDPR)">
        <p>Como usuario de la UE, tienes derecho a:</p>
        <ul>
          <li><strong>Acceso:</strong> solicitar una copia de los datos que tenemos sobre ti.</li>
          <li><strong>Rectificación:</strong> corregir datos inexactos desde tu perfil o mediante solicitud.</li>
          <li><strong>Supresión ("derecho al olvido"):</strong> solicitar la eliminación de tu cuenta y datos personales.</li>
          <li><strong>Portabilidad:</strong> recibir tus datos en formato legible por máquina.</li>
          <li><strong>Oposición / limitación:</strong> oponerte a ciertos tratamientos o solicitar que los limitemos.</li>
          <li><strong>Retirar el consentimiento:</strong> en cualquier momento, sin que afecte al tratamiento previo.</li>
        </ul>
        <p>
          Para ejercer estos derechos, escríbenos a <a href="mailto:fernandomcq123@gmail.com" className="text-orange-400 hover:underline">fernandomcq123@gmail.com</a> o usa el{" "}
          <a href="/contact" className="text-orange-400 hover:underline">formulario de contacto</a>.
          Tienes derecho a presentar reclamación ante la Agencia Española de Protección de Datos (aepd.es).
        </p>
      </Section>

      <Section title="7. Seguridad">
        <p>
          Aplicamos medidas técnicas y organizativas adecuadas: cifrado HTTPS en todas las comunicaciones,
          contraseñas almacenadas con bcrypt (sin acceso en claro), acceso a base de datos restringido
          a la aplicación y accesos de administración protegidos.
        </p>
      </Section>

      <Section title="8. Cambios en esta política">
        <p>
          Podemos actualizar esta política. Los cambios relevantes se comunicarán por email o mediante aviso en la plataforma.
          La fecha de última actualización aparece al inicio de esta página.
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
