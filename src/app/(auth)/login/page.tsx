import Link from "next/link";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <Link href="/" className="text-3xl">
          🎮
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-white">Bienvenido de nuevo</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Entra en tu cuenta para encontrar compañeros de juego
        </p>
      </div>

      {/* Feedback messages */}
      {params.registered && (
        <div className="rounded-lg bg-green-600/20 border border-green-600/30 px-4 py-3 text-sm text-green-400">
          Cuenta creada correctamente. Ya puedes iniciar sesión.
        </div>
      )}
      {params.error && (
        <div className="rounded-lg bg-red-600/20 border border-red-600/30 px-4 py-3 text-sm text-red-400">
          Error al iniciar sesión. Inténtalo de nuevo.
        </div>
      )}

      {/* Form card */}
      <div className="rounded-2xl bg-[var(--card)] border border-[var(--card-border)] p-6">
        <LoginForm />
      </div>

      <p className="text-center text-sm text-[var(--muted-foreground)]">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="text-orange-400 hover:text-orange-300 font-medium">
          Regístrate gratis
        </Link>
      </p>
    </div>
  );
}
