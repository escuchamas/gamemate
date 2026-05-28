"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { voteJoinRequestAction } from "@/actions/party";
import { getInitials } from "@/lib/utils";

interface JoinRequest {
  id: string;
  message: string | null;
  votes: { voterId: string; approve: boolean }[];
  user: { id: string; name: string | null; username: string | null; reputation: number };
}

interface Props {
  requests: JoinRequest[];
  totalMembers: number;
  currentUserId: string;
}

export function JoinRequestsPanel({ requests, totalMembers, currentUserId }: Props) {
  const t = useTranslations("joinRequest");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (requests.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-[var(--muted-foreground)]">
        {t("noRequests")}
      </div>
    );
  }

  const vote = (requestId: string, approve: boolean) => {
    startTransition(async () => {
      const result = await voteJoinRequestAction(requestId, approve);
      if (result.error) alert(result.error);
      else router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {requests.map((req) => {
        const approvals = req.votes.filter((v) => v.approve).length;
        const hasVoted = req.votes.some((v) => v.voterId === currentUserId);

        return (
          <div
            key={req.id}
            className="rounded-lg bg-[var(--muted)] border border-[var(--card-border)] p-3"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {getInitials(req.user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {req.user.name}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  @{req.user.username ?? "—"} · ⭐ {req.user.reputation.toFixed(1)}
                </p>
              </div>
              <span className="text-xs text-[var(--muted-foreground)] flex-shrink-0">
                {t("votesNeeded", { approved: approvals, total: totalMembers })}
              </span>
            </div>

            {req.message && (
              <p className="text-xs text-[var(--muted-foreground)] italic mb-2 pl-11">
                &ldquo;{req.message}&rdquo;
              </p>
            )}

            {!hasVoted && (
              <div className="flex gap-2 pl-11">
                <button
                  onClick={() => vote(req.id, true)}
                  disabled={isPending}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-green-600/20 border border-green-600/30 text-green-400 text-xs hover:bg-green-600/30 transition-colors disabled:opacity-50"
                >
                  {t("approve")}
                </button>
                <button
                  onClick={() => vote(req.id, false)}
                  disabled={isPending}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-600/30 text-red-400 text-xs hover:bg-red-600/30 transition-colors disabled:opacity-50"
                >
                  {t("reject")}
                </button>
              </div>
            )}

            {hasVoted && (
              <p className="text-xs text-[var(--muted-foreground)] pl-11">
                ✓ Ya has votado ({approvals}/{totalMembers})
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
