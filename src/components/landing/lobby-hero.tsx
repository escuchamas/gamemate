import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { GAME_LABELS, SKILL_LABELS } from "@/lib/constants";
import { DEMO_EMAIL_DOMAIN } from "@/lib/emails";

// Panel de "sala de espera" de la portada: una party abierta de verdad, con sus
// jugadores y un hueco libre para el visitante.

type LobbyParty = {
  id: string;
  name: string;
  game: string;
  skillLevel: string;
  maxPlayers: number;
  members: { user: { name: string | null; image: string | null } }[];
};

async function pickParty(): Promise<LobbyParty | null> {
  const select = {
    id: true, name: true, game: true, skillLevel: true, maxPlayers: true,
    members: { select: { user: { select: { name: true, image: true } } }, orderBy: { joinedAt: "asc" as const }, take: 5 },
    _count: { select: { members: true } },
  };
  try {
    const parties = await prisma.party.findMany({
      where: { status: "OPEN", members: { some: {} } },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { ...select, creator: { select: { email: true } } },
    });
    // Una sala que se vea con vida: al menos 2 jugadores y algún hueco libre
    const withRoom = parties.filter((p) => p._count.members >= 2 && p._count.members < p.maxPlayers && p.maxPlayers <= 6);
    // Preferimos parties reales; si no hay, una de demo
    return withRoom.find((p) => !p.creator.email.endsWith(DEMO_EMAIL_DOMAIN)) ?? withRoom[0] ?? null;
  } catch {
    return null;
  }
}

const AVATAR_TINTS = ["#4FD1B5", "#F97316", "#A78BFA", "#F472B6", "#60A5FA"];

function initials(name: string | null) {
  return (name ?? "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";
}

export async function LobbyHero() {
  const t = await getTranslations("home.lobby");
  const party = await pickParty();

  // Sin parties abiertas: un lobby ilustrativo para que el hero nunca quede vacío
  const name = party?.name ?? t("sampleName");
  const game = party ? GAME_LABELS[party.game as keyof typeof GAME_LABELS] ?? party.game : "Minecraft";
  const skill = party?.skillLevel ?? "INTERMEDIATE";
  const level = t.has(`levels.${skill}`) ? t(`levels.${skill}`) : SKILL_LABELS[skill as keyof typeof SKILL_LABELS] ?? skill;
  const players = party?.members.map((m) => m.user) ?? [{ name: "Alex", image: null }, { name: "Marta", image: null }];
  const max = party?.maxPlayers ?? 4;
  const emptyAfterYou = Math.max(0, max - players.length - 1);

  return (
    <div className="lobby" aria-label={t("aria")}>
      <div className="lobby-head">
        <div className="min-w-0">
          <p className="lobby-title">{name}</p>
          <p className="lobby-meta">
            <span>{game}</span>
            <span className="lobby-meta-sep" aria-hidden />
            <span>{t("level", { level })}</span>
          </p>
        </div>
        <p className="lobby-count" aria-label={t("countAria", { n: players.length, max })}>
          {players.length}/{max}
        </p>
      </div>

      <ul className="lobby-slots">
        {players.map((p, i) => (
          <li key={i} className="lobby-slot lobby-slot--taken" style={{ animationDelay: `${150 + i * 220}ms` }}>
            {/* La foto va de fondo: si no carga, queda el color en vez de un icono roto */}
            <span
              className="lobby-avatar"
              style={{
                backgroundColor: AVATAR_TINTS[i % AVATAR_TINTS.length],
                ...(p.image && { backgroundImage: `url("${encodeURI(p.image)}")`, backgroundSize: "cover", backgroundPosition: "center", color: "transparent" }),
              }}
              aria-hidden
            >
              {initials(p.name)}
            </span>
            <span className="lobby-name">{p.name ?? t("player")}</span>
            <span className="lobby-ready">{t("ready")}</span>
          </li>
        ))}

        <li className="lobby-slot lobby-slot--you" style={{ animationDelay: `${150 + players.length * 220}ms` }}>
          <span className="lobby-avatar lobby-avatar--empty" aria-hidden>+</span>
          <span className="lobby-name">{t("yourSlot")}</span>
          <Link href="/register" className="lobby-join">{t("join")}</Link>
        </li>

        {emptyAfterYou > 0 && (
          <li className="lobby-slot lobby-slot--free">
            <span className="lobby-avatar lobby-avatar--free" aria-hidden />
            <span className="lobby-name">{emptyAfterYou === 1 ? t("free") : t("freeMore", { n: emptyAfterYou })}</span>
          </li>
        )}
      </ul>

      {party && (
        <Link href={`/parties/${party.id}`} className="lobby-foot">
          {t("seeParty")}
        </Link>
      )}
    </div>
  );
}
