"use client";

import { useActionState, useState, useTransition } from "react";
import { verifyEmailAction, resendEmailVerificationAction } from "@/actions/auth";

export default function VerifyEmailPage() {
  const [state, action, isPending] = useActionState(verifyEmailAction, {});
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [resendPending, startResend] = useTransition();

  const handleResend = () => {
    startResend(async () => {
      const result = await resendEmailVerificationAction();
      setResendMsg(result.success ?? result.error ?? null);
    });
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-8 flex flex-col gap-6">
        <div className="text-center">
          <div className="text-4xl mb-3">📧</div>
          <h1 className="text-xl font-bold text-white mb-2">Verifica tu email</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Te hemos enviado un código de 6 dígitos. Revisa tu bandeja de entrada.
          </p>
        </div>

        <form action={action} className="flex flex-col gap-4">
          <input
            name="code"
            type="text"
            inputMode="numeric"
            placeholder="000000"
            maxLength={6}
            required
            className="w-full bg-[var(--muted)] border border-[var(--card-border)] rounded-lg px-4 py-3 text-2xl font-bold text-white text-center tracking-widest placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          {state.error && (
            <p className="text-sm text-red-400 text-center">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-500 transition-colors disabled:opacity-50"
          >
            {isPending ? "Verificando..." : "Verificar cuenta"}
          </button>
        </form>

        <div className="text-center">
          <p className="text-xs text-[var(--muted-foreground)] mb-2">¿No has recibido el email?</p>
          <button
            onClick={handleResend}
            disabled={resendPending}
            className="text-sm text-orange-400 hover:underline disabled:opacity-50"
          >
            {resendPending ? "Enviando..." : "Reenviar código"}
          </button>
          {resendMsg && <p className="text-xs text-[var(--muted-foreground)] mt-1">{resendMsg}</p>}
        </div>
      </div>
    </div>
  );
}
