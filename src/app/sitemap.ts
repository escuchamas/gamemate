import type { MetadataRoute } from "next";

const BASE = "https://gamemate.es";

const staticRoutes = [
  "",
  "/parties",
  "/servers",
  "/minecraft",
  "/league-of-legends",
  "/project-zomboid",
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
        priority: route === "" ? 1.0
          : (route === "/parties" || route === "/servers") ? 0.8
          : (route === "/minecraft" || route === "/league-of-legends" || route === "/project-zomboid") ? 0.9
          : 0.5,
      });
    }
  }

  return entries;
}
