import { Link } from "@/i18n/navigation";

export function Footer() {
  return (
    <footer className="border-t border-[var(--card-border)] bg-[var(--background)] mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <img src="/icon.png" alt="GameMate" className="h-7 w-7 rounded-full" />
              <span className="font-semibold text-white">GameMate</span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">
              Encuentra tu equipo de juego ideal. Gratis para siempre para el jugador.
            </p>
          </div>

          {/* Links principales */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider mb-1">
              Plataforma
            </p>
            <Link href="/contact" className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors">
              Contacto
            </Link>
            <Link href="/sponsorship" className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors">
              Patrocinio
            </Link>
            <Link href="/donations" className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors">
              Donaciones
            </Link>
            <Link href="/suggestions" className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors">
              Peticiones
            </Link>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider mb-1">
              Legal
            </p>
            <Link href="/terms" className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors">
              Términos y condiciones
            </Link>
            <Link href="/privacy" className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors">
              Política de privacidad
            </Link>
            <Link href="/cookies" className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors">
              Política de cookies
            </Link>
            <Link href="/legal" className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors">
              Aviso legal
            </Link>
          </div>
        </div>

        <div className="border-t border-[var(--card-border)] mt-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[var(--muted-foreground)]">
            © {new Date().getFullYear()} GameMate. Todos los derechos reservados.
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Hecho con ❤️ para gamers de verdad
          </p>
        </div>
      </div>
    </footer>
  );
}
