"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { signOutAction } from "@/actions/auth";
import { Avatar } from "@/components/ui/avatar";
import { LocaleSwitcher } from "./locale-switcher";

interface Props {
  isLoggedIn: boolean;
  userName: string | null;
  userImage: string | null;
  isAdmin: boolean;
  pendingFriendRequests: number;
  unreadNotifications: number;
  locale: string;
}

export function MobileMenu({
  isLoggedIn,
  userName,
  userImage,
  isAdmin,
  pendingFriendRequests,
  unreadNotifications,
  locale,
}: Props) {
  const [open, setOpen] = useState(false);

  // Close on route change / scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      {/* Hamburger button — only on mobile */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="sm:hidden flex flex-col justify-center items-center gap-1.5 w-9 h-9 rounded-lg hover:bg-[var(--muted)] transition-colors"
        aria-label="Abrir menú"
      >
        <span className="block w-5 h-0.5 bg-[var(--foreground)] rounded-full" />
        <span className="block w-5 h-0.5 bg-[var(--foreground)] rounded-full" />
        <span className="block w-5 h-0.5 bg-[var(--foreground)] rounded-full" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[9998]"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={close}
        />
      )}

      {/* Drawer — no sm:hidden, already off-screen via transform when closed */}
      <div
        className={`mobile-drawer fixed top-0 left-0 z-[9999] h-full w-72 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-[#1e1e2e]">
          <div className="flex items-center gap-2">
            <img src="/apple-icon.png" alt="GameMate" className="h-7 w-7 rounded-full" />
            <span className="font-bold text-white text-base">GameMate</span>
          </div>
          <button
            type="button"
            onClick={close}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white transition-colors text-lg"
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto">
          <NavLink href="/parties" onClick={close}>🎮 Parties</NavLink>

          {isLoggedIn && (
            <>
              <NavLink href="/parties/new" onClick={close}>✨ Crear party</NavLink>
              <NavLink href="/history" onClick={close}>📋 Historial</NavLink>
              <NavLink href="/friends" onClick={close} badge={pendingFriendRequests}>
                👥 Amigos
              </NavLink>
              <NavLink href="/notifications" onClick={close} badge={unreadNotifications}>
                🔔 Notificaciones
              </NavLink>
            </>
          )}

          <NavLink href="/suggestions" onClick={close}>💡 Peticiones</NavLink>
          <NavLink href="/contact" onClick={close}>✉️ Contacto</NavLink>

          {isAdmin && (
            <NavLink href="/admin" onClick={close}>
              <span className="text-orange-400">⚙️ Admin</span>
            </NavLink>
          )}
        </nav>

        {/* Bottom: locale + profile / auth */}
        <div className="px-3 py-4 flex flex-col gap-2 border-t border-[#1e1e2e]">
          <div className="px-1 pb-1">
            <LocaleSwitcher />
          </div>

          {isLoggedIn ? (
            <>
              <Link
                href="/profile"
                onClick={close}
                className="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors bg-[#1c1c2e]"
              >
                <Avatar image={userImage} name={userName} size="sm" />
                <span className="text-sm font-medium text-white">{userName}</span>
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full px-3 py-2.5 text-sm rounded-xl text-gray-400 hover:text-white transition-colors text-left border border-[#1e1e2e]"
                >
                  Cerrar sesión
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={close}
                className="w-full px-3 py-2.5 text-sm rounded-xl text-center text-gray-400 hover:text-white transition-colors border border-[#1e1e2e]"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                onClick={close}
                className="w-full px-3 py-2.5 text-sm rounded-xl text-center bg-orange-600 text-white hover:bg-orange-500 transition-colors font-medium"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function NavLink({
  href,
  onClick,
  badge,
  children,
}: {
  href: string;
  onClick: () => void;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="relative flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-colors font-medium"
    >
      {children}
      {badge != null && badge > 0 && (
        <span className="ml-auto w-5 h-5 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}
