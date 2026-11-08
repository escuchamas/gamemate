import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorizedCron } from "@/lib/cron";
import { GAME_LABELS } from "@/lib/constants";
import type { Game } from "@/generated/prisma/client";
import {
  DEMO_EMAIL_DOMAIN,
  resend,
  sendAdminReport,
  sendComebackEmail,
  sendHighlightsEmail,
  sendNudgeEmail,
  sendWelcomeEmail,
  type Highlights,
} from "@/lib/emails";

// Se ejecuta una vez al día, pero cada usuario recibe muy pocos emails:
// ver el flujo descrito en src/lib/emails.ts.

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Plan gratuito de Resend: 100 emails/día. Dejamos margen para los transaccionales.
const MAX_PER_RUN = 40;
const MAX_OPEN_CHECKS = 60;
const DAY = 24 * 60 * 60 * 1000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const realUser = { NOT: { email: { endsWith: DEMO_EMAIL_DOMAIN } } };

export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const ago = (days: number) => new Date(now - days * DAY);
  const sent: Record<string, number> = {};
  const errors: string[] = [];
  let budget = MAX_PER_RUN;

  async function attempt(type: string, fn: () => Promise<void>) {
    if (budget <= 0) return;
    budget--;
    try {
      await fn();
      sent[type] = (sent[type] ?? 0) + 1;
    } catch (e) {
      errors.push(`${type}: ${e instanceof Error ? e.message : e}`);
    }
    await sleep(300); // límite de peticiones de Resend
  }

  // 1. Actualizar aperturas de los emails del último mes (requiere open tracking en el dominio de Resend)
  const pendingOpens = await prisma.emailLog.findMany({
    where: { userId: { not: null }, resendId: { not: null }, openedAt: null, sentAt: { gte: ago(30) } },
    select: { id: true, resendId: true },
    orderBy: { sentAt: "desc" },
    take: MAX_OPEN_CHECKS,
  });
  let opensFound = 0;
  for (const log of pendingOpens) {
    try {
      const { data } = await resend().emails.get(log.resendId!);
      if (data && ["opened", "clicked"].includes(data.last_event)) {
        await prisma.emailLog.update({ where: { id: log.id }, data: { openedAt: new Date() } });
        opensFound++;
      }
    } catch {
      /* se reintenta mañana */
    }
    await sleep(250);
  }

  // 2. Informe semanal para el admin (lunes, hora de Madrid)
  const madridDay = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", weekday: "short" }).format(new Date());
  if (madridDay === "Mon" && !(await prisma.emailLog.count({ where: { type: "admin_report", sentAt: { gte: ago(6) } } }))) {
    const weekAgo = ago(7);
    const [newUsers, totalRealUsers, verifiedUsers, newRealParties, newServers, activeUsers7d, emailsSent, emailsOpened, optOuts] =
      await Promise.all([
        prisma.user.findMany({ where: { ...realUser, createdAt: { gte: weekAgo } }, select: { name: true, email: true, createdAt: true }, orderBy: { createdAt: "desc" } }),
        prisma.user.count({ where: realUser }),
        prisma.user.count({ where: { ...realUser, emailVerified: { not: null } } }),
        prisma.party.count({ where: { createdAt: { gte: weekAgo }, creator: realUser } }),
        prisma.gameServer.count({ where: { createdAt: { gte: weekAgo } } }),
        prisma.user.count({ where: { ...realUser, lastSeenAt: { gte: weekAgo } } }),
        prisma.emailLog.count({ where: { userId: { not: null }, sentAt: { gte: weekAgo } } }),
        prisma.emailLog.count({ where: { userId: { not: null }, sentAt: { gte: weekAgo }, openedAt: { not: null } } }),
        prisma.user.count({ where: { ...realUser, emailOptOut: true } }),
      ]);
    await attempt("admin_report", () =>
      sendAdminReport({ newUsers, totalRealUsers, verifiedUsers, newRealParties, newServers, activeUsers7d, emailsSent, emailsOpened, optOuts })
    );
  }

  // 3. Emails a usuarios
  const users = await prisma.user.findMany({
    where: { ...realUser, emailVerified: { not: null }, emailOptOut: false, banned: false },
    select: {
      id: true, email: true, name: true, createdAt: true, lastSeenAt: true,
      gamerProfile: { select: { id: true } },
      _count: { select: { partyMembers: true } },
      emailLogs: { select: { type: true, sentAt: true, openedAt: true }, orderBy: { sentAt: "desc" } },
    },
    orderBy: { createdAt: "asc" },
    take: 2000,
  });

  let highlights: Highlights | null = null;
  async function getHighlights(): Promise<Highlights> {
    if (highlights) return highlights;
    const [newParties, newServers, topServers] = await Promise.all([
      prisma.party.count({ where: { createdAt: { gte: ago(30) }, creator: realUser } }),
      prisma.gameServer.count({ where: { createdAt: { gte: ago(30) } } }),
      prisma.gameServer.findMany({ orderBy: { totalVotes: "desc" }, take: 3, select: { id: true, name: true, game: true } }),
    ]);
    highlights = { newParties, newServers, topServers: topServers.map((s) => ({ ...s, game: GAME_LABELS[s.game as Game] ?? s.game })) };
    return highlights;
  }

  for (const u of users) {
    if (budget <= 0) break;
    const logs = u.emailLogs;
    const last = (type: string) => logs.find((l) => l.type === type);
    const flow1 = last("flow1");
    const flow2 = last("flow2");
    const flow3 = last("flow3");
    const lastEmail = logs[0];
    const daysSince = (d: Date) => (now - d.getTime()) / DAY;
    const recipient = { id: u.id, email: u.email, name: u.name };

    // Paso 1: bienvenida (cuenta reciente) o "vuelve" (cuenta antigua)
    if (!flow1) {
      if (daysSince(u.createdAt) <= 7) await attempt("welcome", () => sendWelcomeEmail(recipient));
      else await attempt("comeback", async () => sendComebackEmail(recipient, await getHighlights(), "flow1"));
      continue;
    }

    // Paso 2 (desde el día 7): solo si le falta el perfil o no se ha unido a ninguna party
    const needsNudge = !u.gamerProfile || u._count.partyMembers === 0;
    if (!flow3 && !flow2 && needsNudge && daysSince(flow1.sentAt) >= 7) {
      await attempt("nudge", () => sendNudgeEmail({ ...recipient, hasProfile: !!u.gamerProfile }));
      continue;
    }

    // Paso 3 (desde el día 14, y 7 días después del anterior): novedades
    if (!flow3) {
      if (daysSince(flow1.sentAt) >= 14 && daysSince(lastEmail.sentAt) >= 7) {
        await attempt("highlights", async () => sendHighlightsEmail(recipient, await getHighlights(), "flow3"));
      }
      continue;
    }

    // Fin del flujo. Reactivación: 3 meses sin entrar y 3 meses sin recibir nada. Un solo email por racha.
    const lastActivity = u.lastSeenAt && u.lastSeenAt > u.createdAt ? u.lastSeenAt : u.createdAt;
    const reactivatedAlready = logs.some((l) => l.type === "reactivation" && l.sentAt > lastActivity);
    if (daysSince(lastActivity) >= 90 && daysSince(lastEmail.sentAt) >= 90 && !reactivatedAlready) {
      await attempt("reactivation", async () => sendComebackEmail(recipient, await getHighlights(), "reactivation"));
      continue;
    }

    // Mensual: solo si ha abierto alguno de sus 3 últimos emails o ha vuelto a la web desde entonces
    const recent = logs.slice(0, 3);
    const oldestRecent = recent[recent.length - 1];
    const engaged = recent.some((l) => l.openedAt) || (!!u.lastSeenAt && u.lastSeenAt > oldestRecent.sentAt);
    if (engaged && daysSince(lastEmail.sentAt) >= 30) {
      await attempt("monthly", async () => sendHighlightsEmail(recipient, await getHighlights(), "monthly"));
    }
  }

  if (errors.length) console.error("cron/emails:", errors);
  return NextResponse.json({ ok: true, sent, opensFound, errors: errors.length, budgetLeft: budget });
}
