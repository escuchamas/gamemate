import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LoginForm } from "./login-form";
import { GoogleButton } from "@/components/auth/google-button";
import { EmailFormToggle } from "@/components/auth/email-form-toggle";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; error?: string }>;
}) {
  const params = await searchParams;
  const t = await getTranslations("auth.login");

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <Link href="/" className="text-3xl">
          🎮
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-white">{t("title")}</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {t("subtitle")}
        </p>
      </div>

      {params.registered && (
        <div className="rounded-lg bg-green-600/20 border border-green-600/30 px-4 py-3 text-sm text-green-400">
          {t("registered")}
        </div>
      )}
      {params.error && (
        <div className="rounded-lg bg-red-600/20 border border-red-600/30 px-4 py-3 text-sm text-red-400">
          {params.error === "OAuthAccountNotLinked"
            ? "Este email ya está registrado con contraseña. Usa el formulario de email."
            : t("error")}
        </div>
      )}

      <div className="rounded-2xl bg-[var(--card)] border border-[var(--card-border)] p-6 flex flex-col gap-3">
        <GoogleButton label="Continuar con Google" />
        <EmailFormToggle>
          <LoginForm />
        </EmailFormToggle>
      </div>

      <p className="text-center text-sm text-[var(--muted-foreground)]">
        {t("noAccount")}{" "}
        <Link
          href="/register"
          className="text-orange-400 hover:text-orange-300 font-medium"
        >
          {t("registerLink")}
        </Link>
      </p>
    </div>
  );
}
