import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getInitials } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import {
  GAME_ICONS,
  GAME_LABELS,
  SKILL_LABELS,
} from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { GameProfileAccordion } from "./game-profile-accordion";
import { ProfileImageUpload } from "./profile-image-upload";
import { ProfileTabs } from "./profile-tabs";
import { NameEditor } from "./name-editor";
import { AgeEditor } from "./age-editor";
import { Link } from "@/i18n/navigation";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string }>;
}) {
  const { game: gameParam } = await searchParams;
  const session = await auth();
  if (!session) redirect("/login");

  const t = await getTranslations("profile");

  const userId = session!.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      gameProfiles: true,
      ratingsReceived: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          rater: { select: { name: true, username: true } },
        },
      },
    },
  });

  if (!user) redirect("/login");
  const u = user!;

  const ratingCriteria = [
    "levelMatch",
    "friendliness",
    "funFactor",
    "reliability",
  ] as const;

  const avgByCriteria =
    u.ratingsReceived.length > 0
      ? ratingCriteria.reduce<Record<string, number>>((acc, key) => {
          acc[key] =
            u.ratingsReceived.reduce(
              (sum, r) => sum + r[key as keyof typeof r as "levelMatch"],
              0
            ) / u.ratingsReceived.length;
          return acc;
        }, {})
      : null;

  const defaultTab = gameParam ? "games" : "profile";

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {!u.emailVerified && (
        <div className="rounded-xl bg-orange-500/10 border border-orange-500/30 p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-orange-400">Email sin verificar</p>
            <p className="text-xs text-[var(--muted-foreground)]">Verifica tu cuenta para acceder a todas las funciones.</p>
          </div>
          <Link href="/verify-email" className="px-3 py-1.5 text-xs rounded-lg bg-orange-600 text-white hover:bg-orange-500 transition-colors flex-shrink-0">
            Verificar ahora
          </Link>
        </div>
      )}

      {/* Profile header */}
      <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-6">
        <div className="flex items-center gap-4">
          <ProfileImageUpload currentImage={u.image} name={u.name} />
          <div className="flex-1">
            <NameEditor currentName={u.name} />
            <p className="text-sm text-[var(--muted-foreground)]">@{u.username ?? "—"}</p>
            <AgeEditor currentAge={u.age ?? null} />
            <div className="flex items-center gap-2 mt-1">
              <span className="text-yellow-400">⭐</span>
              <span className="text-white font-semibold">{u.reputation.toFixed(1)}</span>
              <span className="text-xs text-[var(--muted-foreground)]">
                ({t("ratings", { count: u.reputationCount })})
              </span>
              {u.phoneVerified && <Badge variant="success">{t("phoneVerified")}</Badge>}
              {u.emailVerified && <Badge variant="success">{t("emailVerified")}</Badge>}
            </div>
          </div>
        </div>
        {u.bio && <p className="mt-4 text-sm text-[var(--muted-foreground)]">{u.bio}</p>}
      </div>

      {/* Tabs */}
      <ProfileTabs
        tabs={[
          { id: "profile", label: "Mi perfil" },
          { id: "games", label: `Perfiles de juego${u.gameProfiles.length > 0 ? ` (${u.gameProfiles.length})` : ""}` },
        ]}
        defaultTab={defaultTab}
        slots={{
          profile: (
            <div className="flex flex-col gap-4">
              {/* Reputation breakdown */}
              {avgByCriteria && (
                <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5">
                  <h2 className="font-semibold text-white mb-4">{t("reputationBreakdown")}</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {ratingCriteria.map((key) => (
                      <div key={key} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[var(--muted-foreground)]">{t(`criteria.${key}`)}</span>
                          <span className="text-sm font-semibold text-white">{(avgByCriteria[key] ?? 0).toFixed(1)}/5</span>
                        </div>
                        <div className="h-2 rounded-full bg-[var(--muted)]">
                          <div className="h-2 rounded-full bg-orange-500 transition-all" style={{ width: `${((avgByCriteria[key] ?? 0) / 5) * 100}%` }} />
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)]">{t(`criteria.${key}Desc`)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              {u.ratingsReceived.length > 0 && (
                <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5">
                  <h2 className="font-semibold text-white mb-4">{t("reviews")}</h2>
                  <div className="flex flex-col gap-3">
                    {u.ratingsReceived.map((rating) => {
                      const avg = (rating.levelMatch + rating.friendliness + rating.funFactor + rating.reliability) / 4;
                      return (
                        <div key={rating.id} className="rounded-lg bg-[var(--muted)] p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">{rating.rater.name ?? "Anónimo"}</span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={i < Math.round(avg) ? "text-yellow-400" : "text-[var(--card-border)]"}>★</span>
                              ))}
                            </div>
                          </div>
                          {rating.comment && (
                            <p className="text-xs text-[var(--muted-foreground)]">&ldquo;{rating.comment}&rdquo;</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!avgByCriteria && u.ratingsReceived.length === 0 && (
                <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-8 text-center">
                  <p className="text-3xl mb-2">⭐</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Aún no tienes valoraciones. Se mostrarán aquí cuando otros jugadores te valoren.</p>
                </div>
              )}
            </div>
          ),
          games: (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-[var(--muted-foreground)]">
                Solo necesitas completar el perfil de un juego cuando intentes unirte a una party de ese juego.
              </p>
              {(["MINECRAFT", "PROJECT_ZOMBOID", "LEAGUE_OF_LEGENDS"] as const).map((game) => {
                const existing = u.gameProfiles.find((p) => p.game === game);
                return (
                  <GameProfileAccordion
                    key={game}
                    game={game}
                    existing={existing ?? null}
                    initialOpen={gameParam === game}
                    editLabel={t("editProfile")}
                    createLabel={t("createProfile")}
                  />
                );
              })}
            </div>
          ),
        }}
      />
    </div>
  );
}
