"use client";

import { useState, useTransition, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import {
  requestJoinPartyAction,
  cancelJoinRequestAction,
} from "@/actions/party";
import { Button } from "@/components/ui/button";
import { GameProfileWizard } from "@/app/[locale]/(main)/profile/game-profile-wizard";
import type { Game } from "@/generated/prisma/client";

const GAME_LABELS: Record<string, string> = {
  MINECRAFT: "Minecraft",
  PROJECT_ZOMBOID: "Project Zomboid",
  LEAGUE_OF_LEGENDS: "League of Legends",
  OTHER: "este juego",
};

interface Props {
  partyId: string;
  hasPendingRequest: boolean;
  isInGame: boolean;
  game: string;
}

export function JoinRequestForm({ partyId, hasPendingRequest, isInGame, game }: Props) {
  const t = useTranslations("joinRequest");
  const tMilestone = useTranslations("milestone");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [incompleteGame, setIncompleteGame] = useState<Game | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Cuando la party demo "acaba de empezar", espera 4s y sugiere crear la suya
  useEffect(() => {
    if (error?.includes("acaba de empezar")) {
      const t = setTimeout(() => setShowCreateModal(true), 4000);
      return () => clearTimeout(t);
    }
  }, [error]);

  if (hasPendingRequest) {
    return (
      <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-amber-600/10 border border-amber-500/20">
        <p className="text-sm text-amber-300">{t("pendingRequest")}</p>
        <Button
          size="sm"
          variant="secondary"
          loading={isPending}
          onClick={() => {
            startTransition(async () => {
              await cancelJoinRequestAction(partyId);
              router.refresh();
            });
          }}
        >
          {t("cancelRequest")}
        </Button>
      </div>
    );
  }

  const handleSubmit = () => {
    setError(null);
    setIncompleteGame(null);
    startTransition(async () => {
      const result = await requestJoinPartyAction(partyId, message || undefined);
      if (result.error) {
        if (result.error.startsWith("INCOMPLETE_PROFILE:")) {
          setIncompleteGame(result.error.split(":")[1] as Game);
        } else {
          setError(result.error);
        }
      } else {
        router.refresh();
      }
    });
  };

  const handleProfileDone = () => {
    setIncompleteGame(null);
    // Retry join automatically after completing the profile
    startTransition(async () => {
      const result = await requestJoinPartyAction(partyId, message || undefined);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <>
      {/* Modal: sugiere crear party propia tras intentar unirse a una demo */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[9990] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-[var(--muted-foreground)] hover:text-white transition-colors text-lg leading-none"
              aria-label="Cerrar"
            >
              ✕
            </button>
            <div className="text-3xl text-center">🎮</div>
            <div className="text-center">
              <p className="text-base font-bold text-white mb-1">¿Y si creas la tuya?</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Las parties que encajan de verdad las creas tú. Tarda menos de 2 minutos.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="/parties/new"
                className="w-full px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold text-center transition-colors"
                onClick={() => setShowCreateModal(false)}
              >
                Crear mi party →
              </Link>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-full px-4 py-2 rounded-xl text-sm text-[var(--muted-foreground)] hover:text-white transition-colors"
              >
                Seguir buscando
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal with game profile wizard */}
      {incompleteGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[var(--background)] border border-[var(--card-border)] rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-lg font-bold text-white">
                  Completa tu perfil de {GAME_LABELS[incompleteGame]}
                </p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  Los miembros lo verán antes de aceptarte en la party.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIncompleteGame(null)}
                className="text-[var(--muted-foreground)] hover:text-white transition-colors ml-4 flex-shrink-0 text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <GameProfileWizard
              game={incompleteGame}
              existing={null}
              onDone={handleProfileDone}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 p-4 rounded-xl bg-orange-600/10 border border-orange-600/20">
        {error && (
          <p className="text-sm text-red-400 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
            {error}
          </p>
        )}
        {isInGame && (
          <p className="text-xs text-[var(--muted-foreground)]">
            {tMilestone("banner")}
          </p>
        )}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("messagePlaceholder")}
          maxLength={500}
          rows={2}
          className="w-full px-3 py-2 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        />
        <Button onClick={handleSubmit} loading={isPending} size="sm">
          {t("sendRequest")}
        </Button>
      </div>
    </>
  );
}
