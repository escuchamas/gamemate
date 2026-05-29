"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { forgotPasswordAction } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function ForgotPasswordForm() {
  const [state, action, isPending] = useActionState(forgotPasswordAction, {});
  const t = useTranslations("auth.forgotPassword");

  if (state.success) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-2xl">📬</p>
        <p className="text-sm text-[var(--muted-foreground)]">{t("success")}</p>
        <Link href="/login" className="text-sm text-orange-400 hover:text-orange-300 transition-colors">
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <Input
        name="email"
        type="email"
        label={t("email")}
        placeholder="tu@email.com"
        autoComplete="email"
        required
      />
      <Button type="submit" loading={isPending} size="lg" className="mt-2">
        {t("submit")}
      </Button>
      <Link
        href="/login"
        className="text-center text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
      >
        {t("backToLogin")}
      </Link>
    </form>
  );
}
