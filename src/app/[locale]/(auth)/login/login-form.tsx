"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { loginAction } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, {});
  const t = useTranslations("auth.login");

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error && (
        <div className="rounded-lg bg-red-600/20 border border-red-600/30 px-3 py-2 text-sm text-red-400">
          {t("error")}
        </div>
      )}

      <Input
        name="email"
        type="email"
        label={t("email")}
        placeholder="tu@email.com"
        autoComplete="email"
        required
      />

      <div className="flex flex-col gap-1">
        <Input
          name="password"
          type="password"
          label={t("password")}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
        <Link
          href="/forgot-password"
          className="text-xs text-[var(--muted-foreground)] hover:text-orange-400 transition-colors self-end"
        >
          {t("forgotPassword")}
        </Link>
      </div>

      <Button type="submit" loading={isPending} size="lg" className="mt-2">
        {t("submit")}
      </Button>
    </form>
  );
}
