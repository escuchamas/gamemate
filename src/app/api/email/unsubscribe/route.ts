import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/emails";

export const dynamic = "force-dynamic";

// GET muestra la confirmación (los escáneres de enlaces del correo no deben dar de baja a nadie);
// POST da de baja: lo usan el botón de la página y la baja en un clic de Gmail/Outlook.

function page(title: string, body: string, status = 200) {
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} · GameMate</title></head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0f0f13;color:#e8e8f0;font-family:-apple-system,Segoe UI,Roboto,sans-serif;padding:16px">
<div style="max-width:420px;width:100%;background:#16161d;border:1px solid #1f1f2a;border-radius:12px;padding:28px;text-align:center">
<p style="font-size:20px;font-weight:700;margin:0 0 16px">🎮 GameMate</p>
<h1 style="font-size:18px;margin:0 0 12px">${title}</h1>${body}
<p style="margin:20px 0 0"><a href="/es" style="color:#fb923c">Volver a GameMate</a></p>
</div></body></html>`;
  return new NextResponse(html, { status, headers: { "content-type": "text/html; charset=utf-8" } });
}

function params(req: NextRequest) {
  const u = req.nextUrl.searchParams.get("u") ?? "";
  const t = req.nextUrl.searchParams.get("t") ?? "";
  return { u, t, valid: !!u && !!t && verifyUnsubscribeToken(u, t) };
}

export async function GET(req: NextRequest) {
  const { u, t, valid } = params(req);
  if (!valid) return page("Enlace no válido", `<p style="color:#9ca3af">Este enlace de baja no es válido o está incompleto.</p>`, 400);
  return page(
    "¿Dejar de recibir emails?",
    `<p style="color:#9ca3af;line-height:1.6;margin:0 0 20px">Dejarás de recibir los emails de bienvenida, recordatorios y novedades. Los emails necesarios para tu cuenta (verificación, contraseña) seguirán llegando.</p>
<form method="post" action="/api/email/unsubscribe?u=${encodeURIComponent(u)}&t=${encodeURIComponent(t)}">
<button type="submit" style="background:#ea580c;color:#fff;border:0;padding:12px 24px;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer">Darme de baja</button>
</form>`
  );
}

export async function POST(req: NextRequest) {
  const { u, valid } = params(req);
  if (!valid) return page("Enlace no válido", `<p style="color:#9ca3af">Este enlace de baja no es válido o está incompleto.</p>`, 400);
  const res = await prisma.user.updateMany({ where: { id: u }, data: { emailOptOut: true } });
  if (!res.count) return page("Cuenta no encontrada", `<p style="color:#9ca3af">No hemos encontrado esta cuenta.</p>`, 404);
  return page("Listo, te has dado de baja", `<p style="color:#9ca3af;line-height:1.6">No te enviaremos más emails automáticos. ¡Nos vemos en la partida!</p>`);
}
