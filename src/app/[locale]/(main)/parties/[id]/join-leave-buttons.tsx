"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { joinPartyAction, leavePartyAction, closePartyAction, startPartyAction } from "@/actions/party";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

const GAME_LABELS: Record<string, string> = {
  MINECRAFT: "Minecraft",
  PROJECT_ZOMBOID: "Project Zomboid",
  LEAGUE_OF_LEGENDS: "League of Legends",
  OTHER: "este juego",
};

interface Props {
  partyId: string;
  isMember: boolean;
  isLeader: boolean;
  canJoin?: boolean;
  isLoggedIn: boolean;
  isInGame?: boolean;
  isFull?: boolean;
  game: string;
}

export function JoinLeaveButtons({
  partyId,
  isMember,
  isLeader,
  canJoin,
  isLoggedIn,
  isInGame,
  isFull,
  game,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [incompleteProfileGame, setIncompleteProfileGame] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations("partyDetail");
  const tMilestone = useTranslations("milestone");

  const handleJoin = () => {
    setIncompleteProfileGame(null);
    startTransition(async () => {
      const result = await joinPartyAction(partyId);
      if (result.error) {
        if (result.error.startsWith("INCOMPLETE_PROFILE:")) {
          const g = result.error.split(":")[1];
          setIncompleteProfileGame(g);
        } else {
          alert(result.error);
        }
      } else {
        router.refresh();
      }
    });
  };

  const handleLeave = () => {
    if (!confirm(t("confirmLeave"))) return;
    startTransition(async () => {
      const result = await leavePartyAction(partyId);
      if (result.error) alert(result.error);
      else router.refresh();
    });
  };

  const handleClose = () => {
    if (!confirm(t("confirmClose"))) return;
    startTransition(async () => {
      const result = await closePartyAction(partyId);
      if (result.error) alert(result.error);
      else router.refresh();
    });
  };

  const handleStart = () => {
    if (!confirm("¿Confirmas que vais a empezar a jugar? La party pasará a estado \"En partida\".")) return;
    startTransition(async () => {
      const result = await startPartyAction(partyId);
      if (result.error) alert(result.error);
      else router.refresh();
    });
  };

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="px-4 py-2 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-500 transition-colors font-medium"
      >
        {t("loginToJoin")}
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {incompleteProfileGame && (
        <div className="rounded-lg bg-orange-500/10 border border-orange-500/30 px-4 py-3 flex flex-col gap-1.5">
          <p className="text-sm font-medium text-orange-300">
            Necesitas completar tu perfil de {GAME_LABELS[incompleteProfileGame] ?? incompleteProfileGame}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Los miembros de la party ven tu perfil antes de aceptarte — nivel, estilo de juego y lo que buscas. Sin esa información no pueden valorar si encajas con el grupo.
          </p>
          <Link
            href={`/profile?game=${incompleteProfileGame}`}
            className="text-xs text-orange-400 hover:text-orange-300 underline transition-colors mt-0.5 w-fit"
          >
            Completar perfil de {GAME_LABELS[incompleteProfileGame] ?? incompleteProfileGame} →
          </Link>
        </div>
      )}
      <div className="flex gap-2">
        {canJoin && (
          <Button onClick={handleJoin} loading={isPending} size="sm">
            {isInGame ? tMilestone("joinInGame") : t("joinButton")}
          </Button>
        )}
        {isMember && !isLeader && (
          <Button onClick={handleLeave} loading={isPending} size="sm" variant="danger">
            {t("leaveButton")}
          </Button>
        )}
        {isLeader && isFull && (
          <Button onClick={handleStart} loading={isPending} size="sm" variant="primary">
            🎮 ¡A jugar!
          </Button>
        )}
        {isLeader && (
          <Button onClick={handleClose} loading={isPending} size="sm" variant="secondary">
            {t("closeButton")}
          </Button>
        )}
      </div>
    </div>
  );
}
