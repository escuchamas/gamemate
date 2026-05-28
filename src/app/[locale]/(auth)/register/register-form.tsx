"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { registerAction } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
  const [state, action, isPending] = useActionState(registerAction, {});
  const t = useTranslations("auth.register");

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error && (
        <div className="rounded-lg bg-red-600/20 border border-red-600/30 px-3 py-2 text-sm text-red-400">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          name="name"
          label={t("name")}
          placeholder="Tu nombre"
          autoComplete="name"
          required
        />
        <Input
          name="username"
          label={t("username")}
          placeholder={t("usernamePlaceholder")}
          autoComplete="username"
          required
          hint={t("usernameHint")}
        />
      </div>

      <Input
        name="email"
        type="email"
        label={t("email")}
        placeholder="tu@email.com"
        autoComplete="email"
        required
      />

      <Input
        name="phone"
        type="tel"
        label={t("phone")}
        placeholder="+34612345678"
        autoComplete="tel"
        required
        hint={t("phoneHint")}
      />

      <Input
        name="password"
        type="password"
        label={t("password")}
        placeholder="Mínimo 8 caracteres"
        autoComplete="new-password"
        required
        hint={t("passwordHint")}
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

      <p className="text-xs text-center text-[var(--muted-foreground)]">
        {t("terms")}
      </p>
    </form>
  );
}
