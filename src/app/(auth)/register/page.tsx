import Link from "next/link";
import { RegisterForm } from "./register-form";
import { GoogleButton } from "@/components/auth/google-button";
import { EmailFormToggle } from "@/components/auth/email-form-toggle";

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <Link href="/" className="text-3xl">
          🎮
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-white">Crea tu cuenta</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Únete a la comunidad y encuentra compañeros de tu nivel
        </p>
      </div>

      <div className="rounded-2xl bg-[var(--card)] border border-[var(--card-border)] p-6 flex flex-col gap-3">
        <GoogleButton label="Registrarse con Google" />
        <EmailFormToggle>
          <RegisterForm />
        </EmailFormToggle>
      </div>

      <p className="text-center text-sm text-[var(--muted-foreground)]">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
