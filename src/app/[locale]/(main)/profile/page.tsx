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
import { GameProfileForm } from "./game-profile-form";

export default async function ProfilePage() {
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

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Profile header */}
      <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
            {getInitials(u.name)}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{u.name}</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              @{u.username ?? "—"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-yellow-400">⭐</span>
              <span className="text-white font-semibold">
                {u.reputation.toFixed(1)}
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">
                ({t("ratings", { count: u.reputationCount })})
              </span>
              {u.phoneVerified && (
                <Badge variant="success">{t("phoneVerified")}</Badge>
              )}
              {u.emailVerified && (
                <Badge variant="success">{t("emailVerified")}</Badge>
              )}
            </div>
          </div>
        </div>
        {u.bio && (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            {u.bio}
          </p>
        )}
      </div>

      {/* Reputation breakdown */}
      {avgByCriteria && (
        <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5">
          <h2 className="font-semibold text-white mb-4">
            {t("reputationBreakdown")}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {ratingCriteria.map((key) => (
              <div key={key} className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {t(`criteria.${key}`)}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {(avgByCriteria[key] ?? 0).toFixed(1)}/5
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--muted)]">
                  <div
                    className="h-2 rounded-full bg-indigo-500 transition-all"
                    style={{
                      width: `${((avgByCriteria[key] ?? 0) / 5) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {t(`criteria.${key}Desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent reviews */}
      {u.ratingsReceived.length > 0 && (
        <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5">
          <h2 className="font-semibold text-white mb-4">{t("reviews")}</h2>
          <div className="flex flex-col gap-3">
            {u.ratingsReceived.map((rating) => {
              const avg =
                (rating.levelMatch +
                  rating.friendliness +
                  rating.funFactor +
                  rating.reliability) /
                4;
              return (
                <div
                  key={rating.id}
                  className="rounded-lg bg-[var(--muted)] p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">
                      {rating.rater.name ?? "Anónimo"}
                    </span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={
                            i < Math.round(avg)
                              ? "text-yellow-400"
                              : "text-[var(--card-border)]"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  {rating.comment && (
                    <p className="text-xs text-[var(--muted-foreground)]">
                      &ldquo;{rating.comment}&rdquo;
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Game profiles */}
      <div className="flex flex-col gap-4">
        <h2 className="font-semibold text-white">{t("gameProfiles")}</h2>

        {u.gameProfiles.map((profile) => (
          <div
            key={profile.id}
            className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{GAME_ICONS[profile.game]}</span>
              <h3 className="font-semibold text-white">
                {GAME_LABELS[profile.game]}
              </h3>
              <Badge variant="primary">{SKILL_LABELS[profile.skillLevel]}</Badge>
              {profile.modded && <Badge variant="accent">Mods</Badge>}
            </div>

            {profile.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {profile.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full text-xs bg-indigo-600/20 text-indigo-300 border border-indigo-600/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {profile.notes && (
              <p className="text-sm text-[var(--muted-foreground)]">
                {profile.notes}
              </p>
            )}
          </div>
        ))}

        {(["MINECRAFT", "PROJECT_ZOMBOID"] as const).map((game) => {
          const existing = u.gameProfiles.find((p) => p.game === game);
          return (
            <div
              key={game}
              className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{GAME_ICONS[game]}</span>
                <h3 className="font-medium text-white">
                  {existing ? t("editProfile") : t("createProfile")}{" "}
                  {GAME_LABELS[game]}
                </h3>
              </div>
              <GameProfileForm game={game} existing={existing ?? null} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
