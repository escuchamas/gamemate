import type { MetadataRoute } from "next";

const BASE = "https://gamemate.es";

const staticRoutes = [
  "",
  "/parties",
  "/contact",
  "/sponsorship",
  "/donations",
  "/privacy",
  "/cookies",
  "/legal",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["es", "en"];
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of staticRoutes) {
      entries.push({
        url: `${BASE}/${locale}${route}`,
        lastModified: now,
        changeFrequency: route === "" ? "weekly" : "monthly",
        priority: route === "" ? 1.0 : route === "/parties" ? 0.8 : 0.5,
      });
    }
  }

  return entries;
}
