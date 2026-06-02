"use client";

import { useState, useTransition } from "react";
import { voteServerAction } from "@/actions/servers";

interface Props {
  serverId: string;
  votedToday: boolean;
  totalVotes: number;
  isLoggedIn: boolean;
}

export function VoteButton({ serverId, votedToday, totalVotes, isLoggedIn }: Props) {
  const [voted, setVoted] = useState(votedToday);
  const [votes, setVotes] = useState(totalVotes);
  const [msg, setMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleVote = () => {
    if (!isLoggedIn) { setMsg("Inicia sesión para votar"); return; }
    if (voted) { setMsg("Ya has votado hoy"); return; }
    startTransition(async () => {
      const result = await voteServerAction(serverId);
      if (result.error) {
        setMsg(result.error);
      } else {
        setVoted(true);
        setVotes((v) => v + 1);
        setMsg("¡Voto registrado!");
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleVote}
        disabled={isPending || voted}
        className={`flex flex-col items-center gap-0.5 px-5 py-3 rounded-xl border font-bold text-sm transition-all ${
          voted
            ? "bg-orange-500/20 border-orange-500/40 text-orange-400 cursor-default"
            : "bg-[var(--muted)] border-[var(--card-border)] text-[var(--muted-foreground)] hover:bg-orange-500/10 hover:border-orange-500/40 hover:text-orange-400 active:scale-95"
        } disabled:opacity-60`}
      >
        <span className="text-lg leading-none">▲</span>
        <span className="text-lg font-bold leading-none">{votes}</span>
        <span className="text-xs font-normal opacity-80">{voted ? "Votado" : "Votar"}</span>
      </button>
      {msg && (
        <p className={`text-xs ${msg.includes("!") ? "text-green-400" : "text-[var(--muted-foreground)]"}`}>
          {msg}
        </p>
      )}
      <p className="text-xs text-[var(--muted-foreground)] text-center">1 voto/día</p>
    </div>
  );
}
