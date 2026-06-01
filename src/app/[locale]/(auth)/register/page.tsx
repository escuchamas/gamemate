import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RegisterForm } from "./register-form";
import { GoogleButton } from "@/components/auth/google-button";
import { EmailFormToggle } from "@/components/auth/email-form-toggle";

export default async function RegisterPage() {
  const t = await getTranslations("auth.register");

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {t("subtitle")}
        </p>
      </div>

      <div className="rounded-2xl bg-[var(--card)] border border-[var(--card-border)] p-6 flex flex-col gap-3">
        <GoogleButton label="Registrarse con Google" />
        <EmailFormToggle>
          <RegisterForm />
        </EmailFormToggle>
      </div>

      <p className="text-center text-sm text-[var(--muted-foreground)]">
        {t("hasAccount")}{" "}
        <Link
          href="/login"
          className="text-orange-400 hover:text-orange-300 font-medium"
        >
          {t("loginLink")}
        </Link>
      </p>
    </div>
  );
}
