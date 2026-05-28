"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { proposeKickAction, voteKickAction } from "@/actions/party";
import { getInitials } from "@/lib/utils";

interface KickProposal {
  id: string;
  targetId: string;
  votingDeadline: Date;
  votes: { voterId: string; approve: boolean }[];
  target: { id: string; name: string | null; username: string | null };
}

interface MemberInfo {
  userId: string;
  role: string;
  user: { id: string; name: string | null; username: string | null; reputation: number };
}

interface Props {
  partyId: string;
  members: MemberInfo[];
  pendingProposals: KickProposal[];
  currentUserId: string;
  totalMembers: number;
}

export function KickVotePanel({
  partyId,
  members,
  pendingProposals,
  currentUserId,
  totalMembers,
}: Props) {
  const t = useTranslations("kickVote");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const propose = (targetId: string, targetName: string | null) => {
    if (!confirm(t("confirmPropose", { name: targetName ?? "?" }))) return;
    startTransition(async () => {
      const result = await proposeKickAction(partyId, targetId);
      if (result.error) alert(result.error);
      else router.refresh();
    });
  };

  const vote = (proposalId: string, approve: boolean) => {
    startTransition(async () => {
      const result = await voteKickAction(proposalId, approve);
      if (result.error) alert(result.error);
      else router.refresh();
    });
  };

  const kickableMembers = members.filter(
    (m) => m.role !== "LEADER" && m.userId !== currentUserId
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Propose kick section */}
      {kickableMembers.length > 0 && (
        <div className="flex flex-col gap-2">
          {kickableMembers.map((m) => {
            const hasProposal = pendingProposals.some(
              (p) => p.targetId === m.userId
            );
            if (hasProposal) return null;
            return (
              <div
                key={m.userId}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--muted)] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {getInitials(m.user.name)}
                  </div>
                  <span className="text-xs text-[var(--foreground)]">
                    {m.user.name}
                  </span>
                </div>
                <button
                  onClick={() => propose(m.userId, m.user.name)}
                  disabled={isPending}
                  className="text-xs px-2 py-1 rounded-lg border border-red-600/30 text-red-400 hover:bg-red-600/10 transition-colors disabled:opacity-50"
                >
                  {t("propose")}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Active proposals */}
      {pendingProposals.length > 0 && (
        <div className="flex flex-col gap-3">
          {pendingProposals.map((proposal) => {
            const approvals = proposal.votes.filter((v) => v.approve).length;
            const eligibleVoters = totalMembers - 1; // all except target
            const hasVoted = proposal.votes.some(
              (v) => v.voterId === currentUserId
            );
            const isTarget = proposal.targetId === currentUserId;
            const deadline = new Date(proposal.votingDeadline);
            const daysLeft = Math.max(
              0,
              Math.ceil(
                (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              )
            );

            return (
              <div
                key={proposal.id}
                className="rounded-lg bg-red-600/10 border border-red-600/20 p-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {getInitials(proposal.target.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">
                      {proposal.target.name}
                    </p>
                    <p className="text-xs text-red-400">
                      {t("votesNeeded", {
                        approved: approvals,
                        total: eligibleVoters,
                      })}
                      {" · "}
                      {daysLeft > 0
                        ? `${daysLeft}d`
                        : "⏰"}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[var(--muted-foreground)] mb-2">
                  {t("deadlineNote")}
                </p>

                {!isTarget && !hasVoted && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => vote(proposal.id, true)}
                      disabled={isPending}
                      className="flex-1 px-2 py-1.5 rounded-lg bg-red-600/20 border border-red-600/30 text-red-400 text-xs hover:bg-red-600/30 transition-colors disabled:opacity-50"
                    >
                      {t("approve")}
                    </button>
                    <button
                      onClick={() => vote(proposal.id, false)}
                      disabled={isPending}
                      className="flex-1 px-2 py-1.5 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-[var(--muted-foreground)] text-xs hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
                    >
                      {t("reject")}
                    </button>
                  </div>
                )}

                {(isTarget || hasVoted) && (
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {isTarget ? "Votación sobre tu permanencia" : t("alreadyVoted")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {kickableMembers.length === 0 && pendingProposals.length === 0 && (
        <p className="text-xs text-[var(--muted-foreground)] text-center py-2">
          {t("noPending")}
        </p>
      )}
    </div>
  );
}
