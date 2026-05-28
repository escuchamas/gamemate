"use client";

import { useActionState } from "react";
import { registerAction } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
  const [state, action, isPending] = useActionState(registerAction, {});

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
          label="Nombre"
          placeholder="Tu nombre"
          autoComplete="name"
          required
        />
        <Input
          name="username"
          label="Usuario"
          placeholder="gamer123"
          autoComplete="username"
          required
          hint="Solo letras, números y _"
        />
      </div>

      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="tu@email.com"
        autoComplete="email"
        required
      />

      <Input
        name="phone"
        type="tel"
        label="Teléfono (opcional)"
        placeholder="+34612345678"
        autoComplete="tel"
        hint="Formato internacional. Permite verificación extra de seguridad."
      />

      <Input
        name="password"
        type="password"
        label="Contraseña"
        placeholder="Mínimo 8 caracteres"
        autoComplete="new-password"
        required
        hint="Al menos 8 caracteres, una mayúscula y un número"
      />

      <Input
        name="confirmPassword"
        type="password"
        label="Repetir contraseña"
        placeholder="••••••••"
        autoComplete="new-password"
        required
      />

      <Button type="submit" loading={isPending} size="lg" className="mt-2">
        Crear cuenta
      </Button>

      <p className="text-xs text-center text-[var(--muted-foreground)]">
        Al registrarte aceptas no hacer ningún tipo de acoso o comportamiento
        tóxico. Los usuarios con malas conductas serán bloqueados.
      </p>
    </form>
  );
}
