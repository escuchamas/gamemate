import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { SuggestionForm } from "./suggestion-form";
import { VoteButton } from "./vote-button";

const CATEGORY_LABELS: Record<string, string> = {
  NEW_GAME: "🎮 Nuevo juego",
  FEATURE: "✨ Nueva función",
  DESIGN: "🎨 Diseño",
  OTHER: "💡 Otra idea",
};

const STATUS_VARIANT: Record<string, "success" | "warning" | "default" | "danger"> = {
  OPEN: "default",
  IN_REVIEW: "warning",
  IMPLEMENTED: "success",
  REJECTED: "danger",
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Abierta",
  IN_REVIEW: "En revisión",
  IMPLEMENTED: "Implementada ✓",
  REJECTED: "Rechazada",
};

export default async function SuggestionsPage() {
  const session = await auth();

  const suggestions = await prisma.suggestion.findMany({
    orderBy: [{ voteCount: "desc" }, { createdAt: "desc" }],
    include: {
      user: { select: { name: true, image: true } },
      votes: session ? { where: { userId: session.user.id }, select: { id: true } } : false,
    },
  });

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Buzón de sugerencias</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Propón ideas para mejorar GameMate. Las más votadas se implementan primero.
        </p>
      </div>

      {session && <SuggestionForm />}

      {suggestions.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted-foreground)]">
          <p className="text-4xl mb-3">💡</p>
          <p className="font-medium text-white mb-1">Aún no hay sugerencias</p>
          <p className="text-sm">¡Sé el primero en proponer algo!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {suggestions.map((s) => {
            const hasVoted = session ? s.votes.length > 0 : false;
            return (
              <div key={s.id} className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5 flex gap-4">
                {/* Vote button */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <VoteButton
                    suggestionId={s.id}
                    hasVoted={hasVoted}
                    isLoggedIn={!!session}
                  />
                  <span className="text-sm font-bold text-white">{s.voteCount}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-white">{s.title}</h3>
                    <Badge variant={STATUS_VARIANT[s.status]}>{STATUS_LABELS[s.status]}</Badge>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)] mb-3">{s.description}</p>
                  <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    <span className="px-2 py-0.5 rounded-full bg-[var(--muted)] text-xs">
                      {CATEGORY_LABELS[s.category]}
                    </span>
                    <span>·</span>
                    <Avatar image={s.user.image} name={s.user.name} size="sm" className="w-4 h-4 text-[8px]" />
                    <span>{s.user.name}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
