import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

// Comprueba que la llamada a una tarea programada viene de Vercel Cron.
// Si CRON_SECRET no está configurado se rechaza todo: antes, sin el secreto,
// cualquiera podía ejecutar la tarea enviando "Bearer undefined".
export function isAuthorizedCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  return expected.length === given.length && timingSafeEqual(expected, given);
}
