"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  requestJoinPartyAction,
  cancelJoinRequestAction,
} from "@/actions/party";
import { Button } from "@/components/ui/button";

interface Props {
  partyId: string;
  hasPendingRequest: boolean;
  isInGame: boolean;
}

export function JoinRequestForm({ partyId, hasPendingRequest, isInGame }: Props) {
  const t = useTranslations("joinRequest");
  const tMilestone = useTranslations("milestone");
  const [message, setMessage] = useState("");
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
    startTransition(async () => {
      const result = await requestJoinPartyAction(partyId, message || undefined);
      if (result.error) alert(result.error);
      else router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-indigo-600/10 border border-indigo-600/20">
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
        className="w-full px-3 py-2 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
      />
      <Button onClick={handleSubmit} loading={isPending} size="sm">
        {t("sendRequest")}
      </Button>
    </div>
  );
}
