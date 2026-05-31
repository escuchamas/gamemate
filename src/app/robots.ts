import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/es/", "/en/", "/es", "/en"],
        disallow: ["/admin/", "/api/", "/es/profile", "/en/profile"],
      },
    ],
    sitemap: "https://gamemate.es/sitemap.xml",
  };
}
