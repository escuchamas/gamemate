import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./src/i18n/routing";

const intl = createMiddleware(routing);

// Cookie de sesión de Auth.js (con prefijo __Secure- en https; puede ir troceada en .0, .1…)
const hasSessionCookie = (req: NextRequest) =>
  req.cookies.getAll().some(({ name }) => /^(__Secure-)?authjs\.session-token(\.\d+)?$/.test(name));

export default function middleware(req: NextRequest) {
  // La portada se sirve ya generada (sin leer la sesión), así que quien ya ha
  // iniciado sesión se redirige aquí a sus parties, como hacía antes la página.
  const home = req.nextUrl.pathname.match(/^\/(es|en)\/?$/);
  if (home && hasSessionCookie(req)) {
    return NextResponse.redirect(new URL(`/${home[1]}/parties`, req.url));
  }
  return intl(req);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
