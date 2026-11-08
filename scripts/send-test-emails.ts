// Envía una prueba de cada email automático a ADMIN_EMAIL (no escribe en la BD).
// Uso: npx tsx --env-file=.env scripts/send-test-emails.ts
// Con EMAIL_PREVIEW_DIR=<carpeta> solo guarda el HTML de cada email, sin enviar.
process.env.EMAIL_TEST_MODE = "1";
process.env.EMAIL_FROM = "GameMate <noreply@gamemate.es>";

async function main() {
  const m = await import("../src/lib/emails");
  const to = { id: "prueba", email: m.ADMIN_EMAIL, name: "Fernando" };
  const h = {
    newParties: 4,
    newServers: 2,
    topServers: [
      { id: "x", name: "Supercraft", game: "Minecraft" },
      { id: "y", name: "MEMENTO MORI", game: "Project Zomboid" },
      { id: "z", name: "Obsilion", game: "Minecraft" },
    ],
  };
  const steps: [string, () => Promise<void>][] = [
    ["bienvenida", () => m.sendWelcomeEmail(to)],
    ["vuelve (cuentas antiguas)", () => m.sendComebackEmail(to, h, "flow1")],
    ["recordatorio sin perfil", () => m.sendNudgeEmail({ ...to, hasProfile: false })],
    ["recordatorio sin party", () => m.sendNudgeEmail({ ...to, hasProfile: true })],
    ["novedades", () => m.sendHighlightsEmail(to, h, "flow3")],
    ["reactivación 3 meses", () => m.sendComebackEmail(to, h, "reactivation")],
  ];
  for (const [name, fn] of steps) {
    await fn();
    console.log("enviado:", name);
    await new Promise((r) => setTimeout(r, 600));
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
