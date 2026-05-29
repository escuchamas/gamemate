import { getTranslations } from "next-intl/server";
import { ForgotPasswordForm } from "./forgot-password-form";

export default async function ForgotPasswordPage() {
  const t = await getTranslations("auth.forgotPassword");

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">{t("subtitle")}</p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
