"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import {
  requestJoinPartyAction,
  cancelJoinRequestAction,
} from "@/actions/party";
import { Button } from "@/components/ui/button";

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
  const [incompleteGame, setIncompleteGame] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

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
          setIncompleteGame(result.error.split(":")[1]);
        } else {
          setError(result.error);
        }
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-orange-600/10 border border-orange-600/20">
      {incompleteGame && (
        <div className="rounded-lg bg-[var(--card)] border border-orange-500/40 p-4 flex flex-col gap-2">
          <p className="text-sm font-semibold text-orange-300">
            Antes de unirte, completa tu perfil de {GAME_LABELS[incompleteGame] ?? incompleteGame}
          </p>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            Los miembros de la party ven tu perfil antes de aceptarte — tu nivel, estilo de juego y qué buscas. Sin esa información no pueden saber si encajas con el grupo.
          </p>
          <Link
            href={`/profile?game=${incompleteGame}`}
            className="text-xs font-medium text-orange-400 hover:text-orange-300 transition-colors w-fit"
          >
            Ir a completar mi perfil de {GAME_LABELS[incompleteGame] ?? incompleteGame} →
          </Link>
        </div>
      )}

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
  );
}
