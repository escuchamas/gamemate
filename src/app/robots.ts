import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Regla general
      {
        userAgent: "*",
        allow: ["/es/", "/en/", "/es", "/en", "/llms.txt"],
        disallow: ["/admin/", "/api/", "/es/profile", "/en/profile"],
      },
      // Crawlers de IA — acceso completo a páginas públicas
      {
        userAgent: "GPTBot",
        allow: ["/es/", "/en/", "/llms.txt"],
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/es/", "/en/", "/llms.txt"],
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/es/", "/en/", "/llms.txt"],
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: "GoogleOther",
        allow: ["/es/", "/en/", "/llms.txt"],
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: "https://gamemate.es/sitemap.xml",
  };
}
