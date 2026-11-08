import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL as BASE } from "@/lib/seo";

// Se regenera cada hora para incluir servidores y parties nuevas
export const revalidate = 3600;

type Freq = MetadataRoute.Sitemap[number]["changeFrequency"];

// Páginas con versión en ambos idiomas
const bilingualRoutes: { path: string; priority: number; freq: Freq }[] = [
  { path: "", priority: 1.0, freq: "weekly" },
  { path: "/sponsorship", priority: 0.4, freq: "monthly" },
  { path: "/donations", priority: 0.4, freq: "monthly" },
];

// Páginas cuyo contenido solo existe en español (su canonical es /es/...)
const spanishRoutes: { path: string; priority: number; freq: Freq }[] = [
  { path: "/minecraft", priority: 0.9, freq: "daily" },
  { path: "/league-of-legends", priority: 0.9, freq: "daily" },
  { path: "/project-zomboid", priority: 0.9, freq: "daily" },
  { path: "/servers", priority: 0.8, freq: "daily" },
  { path: "/publicar-servidor", priority: 0.8, freq: "monthly" },
  { path: "/que-es-gamemate", priority: 0.7, freq: "monthly" },
  { path: "/contact", priority: 0.3, freq: "yearly" },
  { path: "/privacy", priority: 0.2, freq: "yearly" },
  { path: "/cookies", priority: 0.2, freq: "yearly" },
  { path: "/legal", priority: 0.2, freq: "yearly" },
  { path: "/terms", priority: 0.2, freq: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const r of bilingualRoutes) {
    const languages = { es: `${BASE}/es${r.path}`, en: `${BASE}/en${r.path}` };
    for (const url of Object.values(languages)) {
      entries.push({ url, lastModified: now, changeFrequency: r.freq, priority: r.priority, alternates: { languages } });
    }
  }

  for (const r of spanishRoutes) {
    entries.push({ url: `${BASE}/es${r.path}`, lastModified: now, changeFrequency: r.freq, priority: r.priority });
  }

  // Contenido dinámico: si la BD falla, el sitemap estático sigue sirviéndose
  try {
    const [servers, parties] = await Promise.all([
      prisma.gameServer.findMany({ select: { id: true, createdAt: true }, orderBy: { totalVotes: "desc" }, take: 500 }),
      prisma.party.findMany({
        where: {
          status: { in: ["OPEN", "FULL", "IN_GAME"] },
          NOT: { creator: { email: { endsWith: "@gamemate-demo.fake" } } },
        },
        select: { id: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
    ]);

    for (const s of servers) {
      entries.push({ url: `${BASE}/es/servers/${s.id}`, lastModified: s.createdAt, changeFrequency: "weekly", priority: 0.6 });
    }
    for (const p of parties) {
      entries.push({ url: `${BASE}/es/parties/${p.id}`, lastModified: p.createdAt, changeFrequency: "daily", priority: 0.5 });
    }
  } catch (e) {
    console.error("sitemap: no se pudo leer la BD", e);
  }

  return entries;
}
