"use client";

import { useActionState } from "react";
import { sendContactMessageAction } from "@/actions/contact";

interface Props {
  defaultName?: string;
  defaultEmail?: string;
}

export function ContactForm({ defaultName = "", defaultEmail = "" }: Props) {
  const [state, action, pending] = useActionState(sendContactMessageAction, {});

  if (state.success) {
    return (
      <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-10 text-center flex flex-col items-center gap-3">
        <span className="text-4xl">📨</span>
        <p className="font-semibold text-white">Mensaje enviado</p>
        <p className="text-sm text-[var(--muted-foreground)]">
          Hemos recibido tu mensaje. Te responderemos por email en cuanto podamos.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5 flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[var(--muted-foreground)] font-medium">Nombre *</label>
          <input
            name="name"
            defaultValue={defaultName}
            placeholder="Tu nombre"
            maxLength={100}
            required
            className="bg-[var(--muted)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[var(--muted-foreground)] font-medium">Email *</label>
          <input
            name="email"
            type="email"
            defaultValue={defaultEmail}
            placeholder="tu@email.com"
            required
            className="bg-[var(--muted)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-[var(--muted-foreground)] font-medium">Categoría *</label>
        <select
          name="category"
          className="w-full bg-[var(--muted)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
        >
          <option value="GENERAL">💬 Consulta general</option>
          <option value="BUG">🐛 Reportar un problema</option>
          <option value="QUESTION">❓ Pregunta</option>
          <option value="OTHER">📝 Otro</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-[var(--muted-foreground)] font-medium">Asunto</label>
        <input
          name="subject"
          placeholder="Asunto (opcional)"
          maxLength={150}
          className="bg-[var(--muted)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-[var(--muted-foreground)] font-medium">Mensaje *</label>
        <textarea
          name="message"
          placeholder="Escribe tu mensaje aquí..."
          maxLength={3000}
          required
          rows={5}
          className="w-full bg-[var(--muted)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
        />
      </div>

      {state.error && <p className="text-xs text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-500 transition-colors disabled:opacity-50"
      >
        {pending ? "Enviando..." : "Enviar mensaje"}
      </button>
    </form>
  );
}
