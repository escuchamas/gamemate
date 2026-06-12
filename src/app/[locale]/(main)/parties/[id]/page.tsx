import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { GAME_LABELS as GL, SKILL_LABELS as SL } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { id, locale } = await params;
  const party = await prisma.party.findUnique({
    where: { id },
    select: { name: true, description: true, game: true, skillLevel: true, maxPlayers: true },
  });
  if (!party) return { title: "Party no encontrada" };

  const isEs = locale === "es";
  const gameLabel = GL[party.game as keyof typeof GL] ?? party.game;
  const skillLabel = SL[party.skillLevel as keyof typeof SL] ?? party.skillLevel;
  const title = isEs
    ? `${party.name} – Party de ${gameLabel} | GameMate`
    : `${party.name} – ${gameLabel} Party | GameMate`;
  const description = party.description?.slice(0, 155) ?? (
    isEs
      ? `Party de ${gameLabel} nivel ${skillLabel}. Hasta ${party.maxPlayers} jugadores. Únete en GameMate.`
      : `${gameLabel} party, ${skillLabel} level. Up to ${party.maxPlayers} players. Join on GameMate.`
  );

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://gamemate.es/${locale}/parties/${id}`,
      siteName: "GameMate",
      type: "website",
    },
    twitter: { card: "summary", title, description },
  };
}
import { Badge } from "@/components/ui/badge";
import {
  GAME_ICONS,
  GAME_LABELS,
  SKILL_LABELS,
  PARTY_STATUS_LABELS,
  RULE_CATEGORY_LABELS,
  LANGUAGE_FLAG,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { getTranslations } from "next-intl/server";
import { JoinLeaveButtons } from "./join-leave-buttons";
import { ShareButton } from "./share-button";
import { PartyChat } from "./party-chat";
import { MilestonePanel } from "./milestone-panel";
import { JoinRequestForm } from "./join-request-form";
import { JoinRequestsPanel } from "./join-requests-panel";
import { KickVotePanel } from "./kick-vote-panel";
import { resolveExpiredKickProposalsAction } from "@/actions/party";
import { RatePlayerButton } from "./rate-player-button";
import type { PartyStatus } from "@/generated/prisma/client";

interface PartyPageProps {
  params: Promise<{ id: string; locale: string }>;
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
  const t = await getTranslations("partyDetail");
  const tJoin = await getTranslations("joinRequest");
  const tKick = await getTranslations("kickVote");

  const party = await prisma.party.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, username: true } },
      members: {
        include: {
          user: {
            select: { id: true, name: true, username: true, reputation: true, image: true },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
      rules: { orderBy: [{ isRequired: "desc" }, { category: "asc" }] },
    },
  });

  if (!party) notFound();

  // Auto-resolve expired kick proposals (silence = yes after 3 days)
  await resolveExpiredKickProposalsAction(id);

  // Load pending join requests
  const joinRequests = await prisma.partyJoinRequest.findMany({
    where: { partyId: id, status: "PENDING" },
    include: {
      user: { select: { id: true, name: true, username: true, reputation: true } },
      votes: { select: { voterId: true, approve: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Load pending kick proposals
  const kickProposals = await prisma.partyKickProposal.findMany({
    where: { partyId: id, status: "PENDING" },
    include: {
      target: { select: { id: true, name: true, username: true } },
      votes: { select: { voterId: true, approve: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const isMember = session
    ? party.members.some((m) => m.userId === session.user.id)
    : false;

  // Ratings already given by the current user in this party
  const myRatings = session && isMember
    ? await prisma.rating.findMany({
        where: { raterId: session.user.id, partyId: id },
        select: { ratedId: true, overallRating: true, levelMatch: true, friendliness: true, funFactor: true, reliability: true, comment: true },
      })
    : [];
  const ratingByUser = Object.fromEntries(myRatings.map((r) => [r.ratedId, r]));
  const isLeader = session ? party.creatorId === session.user.id : false;
  const hasPendingRequest = session
    ? joinRequests.some((r) => r.userId === session.user.id)
    : false;
  const canRequestJoin =
    session &&
    !isMember &&
    !hasPendingRequest &&
    (party.status === "OPEN" || party.status === "IN_GAME") &&
    party.members.length < party.maxPlayers;

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
              👥 {party.members.length}/{party.maxPlayers}
            </Badge>
            <Badge variant="default">{LANGUAGE_FLAG[party.language] ?? party.language.toUpperCase()}</Badge>
            {party.modded && (
              <Badge variant="accent">{t("modded")}</Badge>
            )}
            {(party.minAge || party.maxAge) && (
              <Badge variant="default">
                🎂 {party.minAge && party.maxAge
                  ? `${party.minAge}–${party.maxAge} años`
                  : party.minAge
                  ? `+${party.minAge} años`
                  : `≤${party.maxAge} años`}
              </Badge>
            )}
            {party.modTags.length > 0 &&
              party.modTags.map((tag) => (
                <Badge key={tag} variant="default">
                  {tag}
                </Badge>
              ))}
          </div>

          {party.serverInfo && (
            <div className="rounded-lg bg-[var(--muted)] px-3 py-2 text-sm mb-4">
              <span className="text-[var(--muted-foreground)]">
                {t("server")}:{" "}
              </span>
              <span className="text-white font-mono text-xs">
                {party.serverInfo}
              </span>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-[var(--card-border)] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="text-xs text-[var(--muted-foreground)]">
                {formatDate(party.createdAt)}
              </p>
              <ShareButton partyId={party.id} partyName={party.name} />
            </div>
            <JoinLeaveButtons
              partyId={party.id}
              isMember={isMember}
              isLeader={isLeader}
              canJoin={false}
              isLoggedIn={!!session}
              isInGame={party.status === "IN_GAME"}
              isFull={party.status === "FULL"}
              game={party.game}
            />
          </div>
        </div>

        {/* Milestone panel — visible when IN_GAME */}
        {party.status === "IN_GAME" && (
          <MilestonePanel
            partyId={party.id}
            game={party.game}
            currentMilestone={party.currentMilestone}
            isLeader={isLeader}
          />
        )}

        {/* Rules */}
        <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5">
          <h2 className="font-semibold text-white mb-4">{t("rules")}</h2>
          {Object.keys(rulesByCategory).length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              {t("noRules")}
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {Object.entries(rulesByCategory).map(([category, rules]) => (
                <div key={category}>
                  <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2">
                    {RULE_CATEGORY_LABELS[
                      category as keyof typeof RULE_CATEGORY_LABELS
                    ]}
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
            {t("requiredLegend")} &nbsp;·&nbsp; {t("optionalLegend")}
          </p>
        </div>

        {/* Chat */}
        {isMember && session && (
          <PartyChat
            partyId={party.id}
            userId={session.user.id}
            userName={session.user.name ?? "Anónimo"}
          />
        )}

        {/* Join request form — for non-members */}
        {session && !isMember && (party.status === "OPEN" || party.status === "IN_GAME") && (
          <JoinRequestForm
            partyId={party.id}
            hasPendingRequest={hasPendingRequest}
            isInGame={party.status === "IN_GAME"}
            game={party.game}
          />
        )}

        {!session && (party.status === "OPEN" || party.status === "IN_GAME") && (
          <div className="rounded-xl bg-orange-600/10 border border-orange-600/20 p-5 text-center">
            <p className="text-sm text-[var(--muted-foreground)]">
              {t("chatJoinFirst")}
            </p>
          </div>
        )}
      </div>

      {/* Sidebar — Members + Join requests */}
      <div className="flex flex-col gap-4">
        {/* Kick vote panel — visible to members */}
        {isMember && session && (
          <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              {tKick("title")}
              {kickProposals.length > 0 && (
                <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded-full">
                  {kickProposals.length}
                </span>
              )}
            </h2>
            <KickVotePanel
              partyId={party.id}
              members={party.members}
              pendingProposals={kickProposals}
              currentUserId={session.user.id}
              totalMembers={party.members.length}
            />
          </div>
        )}

        {/* Join requests panel — visible to members */}
        {isMember && joinRequests.length > 0 && session && (
          <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              {tJoin("title")}
              <span className="text-xs bg-orange-600 text-white px-1.5 py-0.5 rounded-full">
                {joinRequests.length}
              </span>
            </h2>
            <JoinRequestsPanel
              requests={joinRequests}
              totalMembers={party.members.length}
              currentUserId={session.user.id}
            />
          </div>
        )}

        <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5">
          <h2 className="font-semibold text-white mb-4">
            {t("members")} ({party.members.length}/{party.maxPlayers})
          </h2>
          <div className="flex flex-col gap-3">
            {party.members.map((member) => (
              <div key={member.id} className="flex flex-col">
                <div className="flex items-center gap-3">
                  <Avatar image={member.user.image} name={member.user.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {member.user.name}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      @{member.user.username ?? "—"} · ⭐{" "}
                      {member.user.reputation.toFixed(1)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {member.role === "LEADER" && (
                      <Badge variant="warning">Líder</Badge>
                    )}
                    {isMember && session && member.user.id !== session.user.id && (
                      <RatePlayerButton
                        ratedId={member.user.id}
                        ratedName={member.user.name ?? "este jugador"}
                        partyId={party.id}
                        existingRating={ratingByUser[member.user.id] ?? null}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {Array.from({
            length: party.maxPlayers - party.members.length,
          }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 mt-3 opacity-30">
              <div className="w-9 h-9 rounded-full bg-[var(--muted)] border-2 border-dashed border-[var(--card-border)] flex items-center justify-center text-[var(--muted-foreground)] text-sm">
                ?
              </div>
              <span className="text-sm text-[var(--muted-foreground)]">
                {t("freeSlot")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
