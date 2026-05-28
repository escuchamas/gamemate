"use client";

import { useTransition } from "react";
import { voteSuggestionAction } from "@/actions/suggestions";
import { useRouter } from "next/navigation";

interface Props {
  suggestionId: string;
  hasVoted: boolean;
  isLoggedIn: boolean;
}

export function VoteButton({ suggestionId, hasVoted, isLoggedIn }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleVote = () => {
    if (!isLoggedIn) { router.push("/login"); return; }
    startTransition(async () => {
      await voteSuggestionAction(suggestionId);
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleVote}
      disabled={isPending}
      title={hasVoted ? "Quitar voto" : "Votar"}
      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors disabled:opacity-50 ${
        hasVoted
          ? "bg-orange-600 text-white"
          : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-orange-600/20 hover:text-orange-400"
      }`}
    >
      ▲
    </button>
  );
}
