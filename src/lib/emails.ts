import { createHmac, timingSafeEqual } from "crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo";

// Emails automáticos. Los transaccionales (verificación, reset de contraseña…) siguen en src/actions.
//
// Flujo por usuario (como mucho 3 emails en 3 semanas):
//   flow1  día 0   → bienvenida (cuenta nueva) o "vuelve" (cuenta antigua)
//   flow2  día 7   → recordatorio, solo si le falta perfil o no se ha unido a ninguna party
//   flow3  día 14+ → novedades (servidores y parties)
// Después: "monthly" (novedades, máx. 1 cada 30 días) solo si ha abierto alguno de sus
// últimos emails o ha vuelto a la web desde entonces. Si no, no se le envía nada más…
// …salvo "reactivation": un único email tras 3 meses sin entrar (uno por cada racha de inactividad).

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "fernandomcq123@gmail.com";
export const DEMO_EMAIL_DOMAIN = "@gamemate-demo.fake";
const FROM = process.env.EMAIL_FROM ?? "GameMate <noreply@gamemate.es>";

export type EmailType = "flow1" | "flow2" | "flow3" | "monthly" | "reactivation" | "admin_report";
export type EmailTemplate = "welcome" | "comeback" | "nudge" | "highlights" | "admin_report";

// ─── Baja ─────────────────────────────────────────────────────────────────────

function sign(userId: string): string {
  return createHmac("sha256", process.env.AUTH_SECRET ?? "")
    .update(`unsubscribe:${userId}`)
    .digest("base64url");
}

export function verifyUnsubscribeToken(userId: string, token: string): boolean {
  const expected = Buffer.from(sign(userId));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function unsubscribeUrl(userId: string): string {
  return `${SITE_URL}/api/email/unsubscribe?u=${encodeURIComponent(userId)}&t=${sign(userId)}`;
}

// ─── Plantilla ────────────────────────────────────────────────────────────────

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#ea580c;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">${label}</a>`;
}

function layout(body: string, userId?: string): string {
  const footer = userId
    ? `<p style="margin:24px 0 0;color:#6b7280;font-size:12px;line-height:1.5">Recibes este email porque tienes cuenta en GameMate. ¿Demasiado spam de habilidades?<br><a href="${unsubscribeUrl(userId)}" style="color:#9ca3af">Darme de baja (ff, sin rencores)</a></p>`
    : "";
  return `<!doctype html><html lang="es"><body style="margin:0;padding:24px;background:#0b0b0f">
<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;padding:28px;background:#0f0f13;color:#e8e8f0;border-radius:12px;border:1px solid #1f1f2a">
  <p style="margin:0 0 20px;font-size:20px;font-weight:700;color:#fff">🎮 GameMate</p>
  ${body}
  ${footer}
</div></body></html>`;
}

const p = (text: string) => `<p style="margin:0 0 14px;line-height:1.6;font-size:15px">${text}</p>`;
const h1 = (text: string) => `<h1 style="margin:0 0 16px;font-size:22px;color:#fff">${text}</h1>`;
const ul = (items: string[]) =>
  `<ul style="margin:0 0 18px;padding-left:20px;line-height:1.8;font-size:15px">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
const cta = (href: string, label: string) => `<p style="margin:0 0 8px">${button(href, label)}</p>`;

// ─── Envío ────────────────────────────────────────────────────────────────────

let resendClient: Resend | null = null;
export function resend(): Resend {
  resendClient ??= new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

async function send(opts: {
  to: string;
  subject: string;
  html: string;
  userId?: string;
  type: EmailType;
  template: EmailTemplate;
}) {
  const headers: Record<string, string> = {};
  if (opts.userId) {
    // Baja en un clic desde Gmail/Outlook (RFC 8058)
    headers["List-Unsubscribe"] = `<${unsubscribeUrl(opts.userId)}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }
  // Modo prueba (scripts locales): asunto marcado y sin registrar el envío
  const test = process.env.EMAIL_TEST_MODE === "1";
  if (test && process.env.EMAIL_PREVIEW_DIR) {
    // Vista previa: guarda el HTML en vez de enviarlo
    const { writeFileSync } = await import("fs");
    writeFileSync(`${process.env.EMAIL_PREVIEW_DIR}/${opts.template}-${opts.type}-${Date.now()}.html`, `<!-- ${opts.subject} -->
${opts.html}`);
    return;
  }
  const { data, error } = await resend().emails.send({
    from: FROM,
    to: opts.to,
    subject: test ? `[PRUEBA] ${opts.subject}` : opts.subject,
    html: opts.html,
    headers,
    tags: [{ name: "type", value: opts.type }, { name: "template", value: opts.template }],
  });
  if (error) throw new Error(`Resend: ${error.message}`);
  if (test) return;
  await prisma.emailLog.create({
    data: { userId: opts.userId ?? null, type: opts.type, template: opts.template, resendId: data?.id ?? null },
  });
}

function firstName(name: string | null): string {
  return escapeHtml((name ?? "").trim().split(/\s+/)[0] || "jugador");
}

// ─── Emails a usuarios ────────────────────────────────────────────────────────

type Recipient = { id: string; email: string; name: string | null };

export type Highlights = {
  newParties: number; // parties reales en los últimos 30 días
  newServers: number;
  topServers: { id: string; name: string; game: string }[];
};

function highlightsBlock(h: Highlights): string {
  const lines: string[] = [];
  if (h.newParties > 0) lines.push(`<strong>${h.newParties}</strong> parties nuevas este mes (más que diamantes en un chunk con suerte 💎)`);
  if (h.newServers > 0) lines.push(`<strong>${h.newServers}</strong> servidores nuevos en el tablón, recién crafteados`);
  const top = h.topServers.map(
    (s) => `<a href="${SITE_URL}/es/servers/${s.id}" style="color:#fb923c">${escapeHtml(s.name)}</a> <span style="color:#9ca3af">· ${escapeHtml(s.game)}</span>`
  );
  return (lines.length ? ul(lines) : "") + (top.length ? p("El top del tablón ahora mismo (los que van <em>fed</em> de votos):") + ul(top) : "");
}

export async function sendWelcomeEmail(user: Recipient) {
  const html = layout(
    `${h1(`¡Bienvenido a la party, ${firstName(user.name)}! 🎮`)}
    ${p("Acabas de spawnear en GameMate. Aquí se viene a encontrar gente <strong>de tu nivel</strong> para Minecraft, LoL y Project Zomboid: ni smurfs que te humillan, ni compañeros que confunden un creeper con una mascota.")}
    ${p("Tu misión de tutorial (dura menos que una partida de ARAM):")}
    ${ul([
      "<strong>Completa tu perfil gamer</strong> — juegos, horario y nivel. Es tu ward: sin él no te ve nadie.",
      "<strong>Únete a una party</strong> o crea la tuya con tus normas. Tú eres el shotcaller.",
      "<strong>Pásate por los servidores</strong> en español y vota a tus favoritos. Gratis, sin pay-to-win.",
    ])}
    ${p("GLHF 🫡")}
    ${cta(`${SITE_URL}/es/parties`, "Buscar mi primera party")}`,
    user.id
  );
  await send({ to: user.email, subject: "Has spawneado en GameMate 🎮 (tutorial incluido)", html, userId: user.id, type: "flow1", template: "welcome" });
}

/** Primer email para cuentas que ya existían antes de activar el flujo, y reactivación a los 3 meses. */
export async function sendComebackEmail(user: Recipient, h: Highlights, type: "flow1" | "reactivation") {
  const intro = type === "reactivation"
    ? "Llevas tanto tiempo AFK que ya íbamos a pedir remake. Tranqui, no te hemos reportado: tu cuenta sigue aquí y la comunidad sigue jugando. Esto es lo que te estás perdiendo:"
    : "Te registraste en GameMate hace tiempo y desde entonces esto ha subido de nivel más rápido que un granjero de XP. Esto es lo que te espera si vuelves:";
  const html = layout(
    `${h1(type === "reactivation" ? `${firstName(user.name)}, ¿sigues ahí? 👀` : `${firstName(user.name)}, el respawn ya está listo ⏳`)}
    ${p(intro)}
    ${highlightsBlock(h)}
    ${p("¿No ves una party a tu medida? Créala tú: eliges juego, nivel y normas. Nada de inteos, nada de ff al 15.")}
    ${cta(`${SITE_URL}/es/parties`, "Hacer respawn")}`,
    user.id
  );
  await send({
    to: user.email,
    subject: type === "reactivation" ? "Llevas AFK 3 meses… ¿pedimos remake? 🕹️" : "Tu respawn en GameMate está listo ⏳",
    html,
    userId: user.id,
    type,
    template: "comeback",
  });
}

/** Bienvenida justo al verificar la cuenta. Nunca lanza: si falla, el cron diario la reintenta. */
export async function trySendWelcome(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, emailOptOut: true, emailLogs: { where: { type: "flow1" }, select: { id: true }, take: 1 } },
    });
    if (!user || user.emailOptOut || user.emailLogs.length || user.email.endsWith(DEMO_EMAIL_DOMAIN)) return;
    await sendWelcomeEmail(user);
  } catch (e) {
    console.error("welcome email:", e);
  }
}

export async function sendNudgeEmail(user: Recipient & { hasProfile: boolean }) {
  const body = user.hasProfile
    ? p("Tienes el perfil listo pero sigues en la base comprando items desde hace una semana. Las parties no se unen solas: entra, elige una de tu juego y nivel, y sal a la grieta (o a la mina).")
    : p("Te falta completar tu <strong>perfil gamer</strong> (juegos, horario y nivel). Ahora mismo eres como un jungla que no gankea: existir, existes, pero nadie te ve.")
  const html = layout(
    `${h1(`${firstName(user.name)}, ¿jugamos o qué? 🎯`)}
    ${body}
    ${p("¿Nada te convence? Crea tu propia party: tú pones el nivel, las normas y cuánta gente entra. Si alguien tiltea, fuera.")}
    ${user.hasProfile ? cta(`${SITE_URL}/es/parties`, "Salir de la base") : cta(`${SITE_URL}/es/profile`, "Completar mi perfil")}`,
    user.id
  );
  await send({
    to: user.email,
    subject: user.hasProfile ? "Llevas una semana en la base comprando items 🛒" : "Eres un jungla que no gankea (todavía) 🌲",
    html,
    userId: user.id,
    type: "flow2",
    template: "nudge",
  });
}

export async function sendHighlightsEmail(user: Recipient, h: Highlights, type: "flow3" | "monthly") {
  const html = layout(
    `${h1("Parche de novedades de GameMate 📜")}
    ${p(`${firstName(user.name)}, aquí van las notas del parche (sin nerfeos, prometido):`)}
    ${highlightsBlock(h)}
    ${p("¿Tienes servidor o un grupo que necesita gente? Publícalo gratis y deja que te encuentren jugadores de tu elo… o de tu nivel de redstone.")}
    ${cta(`${SITE_URL}/es/servers`, "Ver servidores y parties")}`,
    user.id
  );
  await send({ to: user.email, subject: "Notas del parche: lo nuevo en GameMate 📜", html, userId: user.id, type, template: "highlights" });
}

// ─── Informe para el admin ────────────────────────────────────────────────────

export type AdminReport = {
  newUsers: { name: string | null; email: string; createdAt: Date }[];
  totalRealUsers: number;
  verifiedUsers: number;
  newRealParties: number;
  newServers: number;
  activeUsers7d: number;
  emailsSent: number;
  emailsOpened: number;
  optOuts: number;
};

export async function sendAdminReport(r: AdminReport) {
  const row = (k: string, v: string | number) =>
    `<tr><td style="padding:6px 0;color:#9ca3af">${k}</td><td style="padding:6px 0;text-align:right;font-weight:600;color:#fff">${v}</td></tr>`;
  const users = r.newUsers.length
    ? ul(r.newUsers.map((u) => `${escapeHtml(u.name ?? "—")} <span style="color:#9ca3af">· ${escapeHtml(u.email)}</span>`))
    : p('<span style="color:#9ca3af">Ningún registro nuevo esta semana.</span>');
  const html = layout(
    `${h1("Informe semanal")}
    <table style="width:100%;border-collapse:collapse;font-size:15px;margin:0 0 18px">
      ${row("Usuarios nuevos (7 días)", r.newUsers.length)}
      ${row("Usuarios activos (7 días)", r.activeUsers7d)}
      ${row("Usuarios reales en total", `${r.totalRealUsers} (${r.verifiedUsers} verificados)`)}
      ${row("Parties nuevas reales", r.newRealParties)}
      ${row("Servidores nuevos", r.newServers)}
      ${row("Emails a usuarios (7 días)", `${r.emailsSent} enviados · ${r.emailsOpened} abiertos`)}
      ${row("Bajas de emails (total)", r.optOuts)}
    </table>
    <p style="margin:0 0 8px;font-weight:600">Registros nuevos</p>
    ${users}
    ${cta(`${SITE_URL}/es/admin`, "Abrir el panel")}`
  );
  await send({ to: ADMIN_EMAIL, subject: `📊 GameMate — ${r.newUsers.length} registros nuevos esta semana`, html, type: "admin_report", template: "admin_report" });
}
