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
    ? `<p style="margin:24px 0 0;color:#6b7280;font-size:12px;line-height:1.5">Recibes este email porque tienes cuenta en GameMate.<br><a href="${unsubscribeUrl(userId)}" style="color:#9ca3af">Darme de baja de estos emails</a></p>`
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
  const { data, error } = await resend().emails.send({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    headers,
    tags: [{ name: "type", value: opts.type }, { name: "template", value: opts.template }],
  });
  if (error) throw new Error(`Resend: ${error.message}`);
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
  if (h.newParties > 0) lines.push(`<strong>${h.newParties}</strong> parties nuevas creadas por jugadores este mes`);
  if (h.newServers > 0) lines.push(`<strong>${h.newServers}</strong> servidores nuevos en el tablón`);
  const top = h.topServers.map(
    (s) => `<a href="${SITE_URL}/es/servers/${s.id}" style="color:#fb923c">${escapeHtml(s.name)}</a> <span style="color:#9ca3af">· ${escapeHtml(s.game)}</span>`
  );
  return (lines.length ? ul(lines) : "") + (top.length ? p("Los servidores más votados ahora mismo:") + ul(top) : "");
}

export async function sendWelcomeEmail(user: Recipient) {
  const html = layout(
    `${h1(`¡Bienvenido, ${firstName(user.name)}! 👋`)}
    ${p("Ya formas parte de GameMate, el sitio para encontrar gente <strong>de tu nivel</strong> con la que jugar a Minecraft, League of Legends y Project Zomboid.")}
    ${p("Para sacarle partido en 2 minutos:")}
    ${ul([
      "<strong>Completa tu perfil gamer</strong> — juegos, horario y nivel. Así te encuentran.",
      "<strong>Únete a una party</strong> o crea la tuya con tus normas.",
      "<strong>Echa un ojo a los servidores</strong> en español y vota tus favoritos.",
    ])}
    ${cta(`${SITE_URL}/es/parties`, "Ver parties abiertas")}`,
    user.id
  );
  await send({ to: user.email, subject: "Bienvenido a GameMate 🎮 — así encuentras tu equipo", html, userId: user.id, type: "flow1", template: "welcome" });
}

/** Primer email para cuentas que ya existían antes de activar el flujo, y reactivación a los 3 meses. */
export async function sendComebackEmail(user: Recipient, h: Highlights, type: "flow1" | "reactivation") {
  const intro = type === "reactivation"
    ? "Hace unos meses que no te vemos por GameMate. La comunidad sigue jugando; esto es lo que te encontrarás si vuelves:"
    : "Hace tiempo que te registraste en GameMate y la comunidad ha ido creciendo. Esto es lo que te encontrarás si vuelves:";
  const html = layout(
    `${h1(`Hola de nuevo, ${firstName(user.name)} 🕹️`)}
    ${p(intro)}
    ${highlightsBlock(h)}
    ${p("Si no ves una party a tu medida, crea la tuya: tú decides juego, nivel y normas.")}
    ${cta(`${SITE_URL}/es/parties`, "Volver a GameMate")}`,
    user.id
  );
  await send({
    to: user.email,
    subject: type === "reactivation" ? "¿Echamos una partida? Te echamos de menos en GameMate" : "Lo nuevo en GameMate desde que te registraste",
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
    ? p("Tu perfil ya está listo, pero aún no te has unido a ninguna party. Es lo que hace que GameMate funcione: entra, elige una de tu juego y nivel, y a jugar.")
    : p("Te falta un paso: <strong>completar tu perfil gamer</strong> (juegos, horario y nivel). Sin él, nadie puede encontrarte para jugar.");
  const html = layout(
    `${h1(`${firstName(user.name)}, ¿jugamos? 🎯`)}
    ${body}
    ${p("Si no encuentras nada a tu medida, crea tu propia party: tú decides el nivel, las normas y cuánta gente entra.")}
    ${user.hasProfile ? cta(`${SITE_URL}/es/parties`, "Buscar una party") : cta(`${SITE_URL}/es/profile`, "Completar mi perfil")}`,
    user.id
  );
  await send({
    to: user.email,
    subject: user.hasProfile ? "Tu primera party te está esperando" : "Te falta un paso para encontrar equipo",
    html,
    userId: user.id,
    type: "flow2",
    template: "nudge",
  });
}

export async function sendHighlightsEmail(user: Recipient, h: Highlights, type: "flow3" | "monthly") {
  const html = layout(
    `${h1("Esto es lo que se mueve en GameMate 🔥")}
    ${p(`${firstName(user.name)}, te dejamos lo más destacado de la comunidad:`)}
    ${highlightsBlock(h)}
    ${p("¿Tienes un servidor o un grupo? Publícalo gratis y que te encuentren jugadores de tu nivel.")}
    ${cta(`${SITE_URL}/es/servers`, "Ver servidores y parties")}`,
    user.id
  );
  await send({ to: user.email, subject: "Servidores y parties destacadas en GameMate", html, userId: user.id, type, template: "highlights" });
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
