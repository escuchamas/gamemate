"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("gamemate_cookie_consent")) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("gamemate_cookie_consent", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 flex justify-center">
      <div className="max-w-2xl w-full bg-[var(--card)] border border-[var(--card-border)] rounded-xl shadow-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-[var(--muted-foreground)] flex-1">
          Usamos cookies estrictamente necesarias para el funcionamiento de la plataforma (sesión y autenticación). No usamos cookies de seguimiento ni publicidad.{" "}
          <Link href="/cookies" className="text-orange-400 hover:underline">
            Política de cookies
          </Link>
        </p>
        <button
          onClick={accept}
          className="flex-shrink-0 px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-500 transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
