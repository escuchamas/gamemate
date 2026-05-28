"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinPartyAction, leavePartyAction, closePartyAction } from "@/actions/party";
import { Button } from "@/components/ui/button";

interface Props {
  partyId: string;
  isMember: boolean;
  isLeader: boolean;
  canJoin: boolean;
  isLoggedIn: boolean;
}

export function JoinLeaveButtons({
  partyId,
  isMember,
  isLeader,
  canJoin,
  isLoggedIn,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleJoin = () => {
    startTransition(async () => {
      const result = await joinPartyAction(partyId);
      if (result.error) alert(result.error);
      else router.refresh();
    });
  };

  const handleLeave = () => {
    if (!confirm("¿Seguro que quieres abandonar la party?")) return;
    startTransition(async () => {
      const result = await leavePartyAction(partyId);
      if (result.error) alert(result.error);
      else router.refresh();
    });
  };

  const handleClose = () => {
    if (!confirm("¿Cerrar la party? Los miembros ya no podrán unirse.")) return;
    startTransition(async () => {
      const result = await closePartyAction(partyId);
      if (result.error) alert(result.error);
      else router.refresh();
    });
  };

  if (!isLoggedIn) {
    return (
      <a
        href="/login"
        className="px-4 py-2 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-500 transition-colors font-medium"
      >
        Entra para unirte
      </a>
    );
  }

  return (
    <div className="flex gap-2">
      {canJoin && (
        <Button onClick={handleJoin} loading={isPending} size="sm">
          Unirme
        </Button>
      )}
      {isMember && !isLeader && (
        <Button
          onClick={handleLeave}
          loading={isPending}
          size="sm"
          variant="danger"
        >
          Abandonar
        </Button>
      )}
      {isLeader && (
        <Button
          onClick={handleClose}
          loading={isPending}
          size="sm"
          variant="secondary"
        >
          Cerrar party
        </Button>
      )}
    </div>
  );
}
