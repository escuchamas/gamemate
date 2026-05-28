import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
  const t = await getTranslations("auth.register");

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

      <div className="rounded-2xl bg-[var(--card)] border border-[var(--card-border)] p-6">
        <RegisterForm />
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
