"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { resetPasswordAction } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, isPending] = useActionState(
    resetPasswordAction.bind(null, token),
    {}
  );
  const t = useTranslations("auth.resetPassword");

  if (state.success) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-2xl">✅</p>
        <p className="text-sm text-[var(--muted-foreground)]">{t("success")}</p>
        <Link href="/login" className="text-sm text-orange-400 hover:text-orange-300 transition-colors">
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  if (state.error === "invalid_token") {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-2xl">⚠️</p>
        <p className="text-sm text-[var(--muted-foreground)]">{t("invalidToken")}</p>
        <Link href="/forgot-password" className="text-sm text-orange-400 hover:text-orange-300 transition-colors">
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error && state.error !== "invalid_token" && (
        <div className="rounded-lg bg-red-600/20 border border-red-600/30 px-3 py-2 text-sm text-red-400">
          {state.error}
        </div>
      )}
      <Input
        name="password"
        type="password"
        label={t("password")}
        placeholder="••••••••"
        autoComplete="new-password"
        required
      />
      <Input
        name="confirmPassword"
        type="password"
        label={t("confirmPassword")}
        placeholder="••••••••"
        autoComplete="new-password"
        required
      />
      <Button type="submit" loading={isPending} size="lg" className="mt-2">
        {t("submit")}
      </Button>
    </form>
  );
}
