import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import {
  GAME_ICONS,
  GAME_LABELS,
  SKILL_LABELS,
  PARTY_STATUS_LABELS,
  RULE_CATEGORY_LABELS,
} from "@/lib/constants";
import { formatDate, getInitials } from "@/lib/utils";
import { JoinLeaveButtons } from "./join-leave-buttons";
import { PartyChat } from "./party-chat";
import type { PartyStatus } from "@/generated/prisma/client";

interface PartyPageProps {
  params: Promise<{ id: string }>;
}

const statusVariant: Record<
  PartyStatus,
  "success" | "warning" | "danger" | "default"
> = {
  OPEN: "success",
  FULL: "warning",
  IN_GAME: "accent" as any,
  CLOSED: "danger",
};

export default async function PartyPage({ params }: PartyPageProps) {
  const { id } = await params;
  const session = await auth();

  const party = await prisma.party.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, username: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, username: true, reputation: true } },
        },
        orderBy: { joinedAt: "asc" },
      },
      rules: { orderBy: [{ isRequired: "desc" }, { category: "asc" }] },
    },
  });

  if (!party) notFound();

  const isMember = session
    ? party.members.some((m) => m.userId === session.user.id)
    : false;
  const isLeader = session ? party.creatorId === session.user.id : false;
  const canJoin =
    session && !isMember && party.status === "OPEN";

  const rulesByCategory = party.rules.reduce<
    Record<string, typeof party.rules>
  >((acc, rule) => {
    if (!acc[rule.category]) acc[rule.category] = [];
    acc[rule.category].push(rule);
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main column */}
      <div className="lg:col-span-2 flex flex-col gap-5">
        {/* Header */}
        <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{GAME_ICONS[party.game]}</span>
              <div>
                <h1 className="text-xl font-bold text-white">{party.name}</h1>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {GAME_LABELS[party.game]} · {SKILL_LABELS[party.skillLevel]}
                </p>
              </div>
            </div>
            <Badge variant={statusVariant[party.status]}>
              {PARTY_STATUS_LABELS[party.status]}
            </Badge>
          </div>

          {party.description && (
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              {party.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="default">
              👥 {party.members.length}/{party.maxPlayers} jugadores
            </Badge>
            <Badge variant="default">{party.language.toUpperCase()}</Badge>
            {party.modded && <Badge variant="accent">Mods</Badge>}
            {party.modsNote && (
              <Badge variant="default">{party.modsNote}</Badge>
            )}
          </div>

          {party.serverInfo && (
            <div className="rounded-lg bg-[var(--muted)] px-3 py-2 text-sm">
              <span className="text-[var(--muted-foreground)]">Servidor: </span>
              <span className="text-white font-mono text-xs">{party.serverInfo}</span>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-[var(--card-border)] flex items-center justify-between">
            <p className="text-xs text-[var(--muted-foreground)]">
              Creada por{" "}
              <span className="text-[var(--foreground)]">
                {party.creator.name}
              </span>{" "}
              · {formatDate(party.createdAt)}
            </p>
            <JoinLeaveButtons
              partyId={party.id}
              isMember={isMember}
              isLeader={isLeader}
              canJoin={!!canJoin}
              isLoggedIn={!!session}
              game={party.game}
            />
          </div>
        </div>

        {/* Rules */}
        <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5">
          <h2 className="font-semibold text-white mb-4">Normas de la party</h2>
          {Object.keys(rulesByCategory).length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              No hay normas definidas.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {Object.entries(rulesByCategory).map(([category, rules]) => (
                <div key={category}>
                  <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2">
                    {RULE_CATEGORY_LABELS[category as keyof typeof RULE_CATEGORY_LABELS]}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {rules.map((rule) => (
                      <div key={rule.id} className="flex items-start gap-2">
                        <span className="text-xs mt-0.5">
                          {rule.isRequired ? "🔴" : "🔵"}
                        </span>
                        <span className="text-sm text-[var(--foreground)]">
                          {rule.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-[var(--muted-foreground)] mt-4">
            🔴 Obligatoria &nbsp;·&nbsp; 🔵 Opcional acordada
          </p>
        </div>

        {/* Chat (solo para miembros) */}
        {isMember && session && (
          <PartyChat
            partyId={party.id}
            userId={session.user.id}
            userName={session.user.name ?? "Anónimo"}
          />
        )}

        {!isMember && party.status === "OPEN" && (
          <div className="rounded-xl bg-orange-600/10 border border-orange-600/20 p-5 text-center">
            <p className="text-sm text-[var(--muted-foreground)] mb-2">
              Únete a la party para acceder al chat del grupo
            </p>
          </div>
        )}
      </div>

      {/* Sidebar — Members */}
      <div className="flex flex-col gap-4">
        <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5">
          <h2 className="font-semibold text-white mb-4">
            Miembros ({party.members.length}/{party.maxPlayers})
          </h2>
          <div className="flex flex-col gap-3">
            {party.members.map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {getInitials(member.user.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {member.user.name}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    @{member.user.username ?? "—"} · ⭐{" "}
                    {member.user.reputation.toFixed(1)}
                  </p>
                </div>
                {member.role === "LEADER" && (
                  <Badge variant="warning">Líder</Badge>
                )}
              </div>
            ))}
          </div>

          {/* Slots vacíos */}
          {Array.from({
            length: party.maxPlayers - party.members.length,
          }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 mt-3 opacity-30"
            >
              <div className="w-9 h-9 rounded-full bg-[var(--muted)] border-2 border-dashed border-[var(--card-border)] flex items-center justify-center text-[var(--muted-foreground)] text-sm">
                ?
              </div>
              <span className="text-sm text-[var(--muted-foreground)]">
                Slot libre
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
