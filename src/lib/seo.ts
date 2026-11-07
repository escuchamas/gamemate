import type { Metadata } from "next";

export const SITE_URL = "https://gamemate.es";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo%20redondo.png`;

/**
 * canonical + hreflang para una ruta pública.
 * `path` sin locale, empezando por "/" (o "" para la home).
 * `esOnly`: páginas cuyo contenido solo existe en español — /en/... apunta a /es/...
 * para que Google no las trate como contenido duplicado.
 */
export function localeAlternates(
  locale: string,
  path: string,
  { esOnly = false }: { esOnly?: boolean } = {}
): Metadata["alternates"] {
  const es = `${SITE_URL}/es${path}`;
  const en = `${SITE_URL}/en${path}`;
  if (esOnly) {
    return { canonical: es, languages: { es, "x-default": es } };
  }
  return {
    canonical: locale === "en" ? en : es,
    languages: { es, en, "x-default": es },
  };
}

export const NOINDEX: Metadata["robots"] = { index: false, follow: true };
