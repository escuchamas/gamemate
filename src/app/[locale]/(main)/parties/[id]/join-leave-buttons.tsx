"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { joinPartyAction, leavePartyAction, closePartyAction } from "@/actions/party";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

interface Props {
  partyId: string;
  isMember: boolean;
  isLeader: boolean;
  canJoin?: boolean;
  isLoggedIn: boolean;
  isInGame?: boolean;
}

export function JoinLeaveButtons({
  partyId,
  isMember,
  isLeader,
  canJoin,
  isLoggedIn,
  isInGame,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("partyDetail");
  const tMilestone = useTranslations("milestone");

  const handleJoin = () => {
    startTransition(async () => {
      const result = await joinPartyAction(partyId);
      if (result.error) alert(result.error);
      else router.refresh();
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

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors font-medium"
      >
        {t("loginToJoin")}
      </Link>
    );
  }

  return (
    <div className="flex gap-2">
      {canJoin && (
        <Button onClick={handleJoin} loading={isPending} size="sm">
          {isInGame ? tMilestone("joinInGame") : t("joinButton")}
        </Button>
      )}
      {isMember && !isLeader && (
        <Button
          onClick={handleLeave}
          loading={isPending}
          size="sm"
          variant="danger"
        >
          {t("leaveButton")}
        </Button>
      )}
      {isLeader && (
        <Button
          onClick={handleClose}
          loading={isPending}
          size="sm"
          variant="secondary"
        >
          {t("closeButton")}
        </Button>
      )}
    </div>
  );
}
