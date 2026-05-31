"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { registerAction } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
  const [state, action, isPending] = useActionState(registerAction, {});
  const t = useTranslations("auth.register");

  const [values, setValues] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const set = (field: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [field]: e.target.value }));

  const fieldError = (field: string) =>
    state.field === field ? state.error : undefined;

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error && !state.field && (
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
          value={values.name}
          onChange={set("name")}
          error={fieldError("name")}
        />
        <Input
          name="username"
          label={t("username")}
          placeholder={t("usernamePlaceholder")}
          autoComplete="username"
          required
          hint={!fieldError("username") ? t("usernameHint") : undefined}
          value={values.username}
          onChange={set("username")}
          error={fieldError("username")}
        />
      </div>

      <Input
        name="email"
        type="email"
        label={t("email")}
        placeholder="tu@email.com"
        autoComplete="email"
        required
        value={values.email}
        onChange={set("email")}
        error={fieldError("email")}
      />

      <Input
        name="password"
        type="password"
        label={t("password")}
        placeholder="Mínimo 8 caracteres"
        autoComplete="new-password"
        required
        hint={!fieldError("password") ? t("passwordHint") : undefined}
        value={values.password}
        onChange={set("password")}
        error={fieldError("password")}
      />

      <Input
        name="confirmPassword"
        type="password"
        label={t("confirmPassword")}
        placeholder="••••••••"
        autoComplete="new-password"
        required
        value={values.confirmPassword}
        onChange={set("confirmPassword")}
        error={fieldError("confirmPassword")}
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
