import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GAME_LABELS, GAME_ICONS } from "@/lib/constants";
import type { Metadata } from "next";
import type { Game } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Servidores de Minecraft y Project Zomboid en español | GameMate",
  description:
    "Encuentra los mejores servidores de Minecraft y Project Zomboid en español. Supervivencia, roleplay, hardcore y más. Comunidad verificada y activa.",
};

const GAME_LOGOS: Partial<Record<Game, string>> = {
  LEAGUE_OF_LEGENDS: "/games/lol.png",
  PROJECT_ZOMBOID: "/games/pz.png",
};

const GAME_COVERS: Partial<Record<Game, string>> = {
  MINECRAFT: "/games/biome-minecraft.webp",
};

const GAME_FILTER_VALUES = [
  { value: "", label: "🎮 Todos los juegos" },
  { value: "MINECRAFT", label: "⛏️ Minecraft" },
  { value: "PROJECT_ZOMBOID", label: "🧟 Project Zomboid" },
  { value: "LEAGUE_OF_LEGENDS", label: "⚔️ League of Legends" },
];

interface Props {
  searchParams: Promise<{ game?: string; sort?: string }>;
}

export default async function ServersPage({ searchParams }: Props) {
  const params = await searchParams;
  const session = await auth();

  const where = params.game && ["MINECRAFT", "PROJECT_ZOMBOID", "LEAGUE_OF_LEGENDS", "OTHER"].includes(params.game)
    ? { game: params.game as Game }
    : {};

  const orderBy = params.sort === "new"
    ? { createdAt: "desc" as const }
    : { totalVotes: "desc" as const };

  const servers = await prisma.gameServer.findMany({
    where,
    orderBy,
    take: 60,
    select: {
      id: true, name: true, description: true, game: true, ip: true,
      discordUrl: true, websiteUrl: true, modded: true, maxPlayers: true,
      totalVotes: true, createdAt: true,
      creator: { select: { name: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Tablón de servidores</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
            Servidores permanentes buscando jugadores. Vota cada día para subirlos en el ranking.
          </p>
        </div>
        {session && (
          <Link href="/servers/new">
            <Button size="sm">+ Publicar servidor</Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {GAME_FILTER_VALUES.map(({ value, label }) => (
          <Link
            key={value}
            href={`/servers${value ? `?game=${value}` : ""}${params.sort ? `${value ? "&" : "?"}sort=${params.sort}` : ""}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              (params.game ?? "") === value
                ? "bg-orange-600 text-white"
                : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-white"
            }`}
          >
            {label}
          </Link>
        ))}
        <div className="ml-auto flex gap-1">
          <Link
            href={`/servers${params.game ? `?game=${params.game}` : ""}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !params.sort || params.sort === "votes"
                ? "bg-[var(--card)] text-white border border-[var(--card-border)]"
                : "text-[var(--muted-foreground)] hover:text-white"
            }`}
          >
            🏆 Más votos
          </Link>
          <Link
            href={`/servers?${params.game ? `game=${params.game}&` : ""}sort=new`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              params.sort === "new"
                ? "bg-[var(--card)] text-white border border-[var(--card-border)]"
                : "text-[var(--muted-foreground)] hover:text-white"
            }`}
          >
            🆕 Nuevos
          </Link>
        </div>
      </div>

      <p className="text-sm text-[var(--muted-foreground)] -mt-2">
        {servers.length} {servers.length === 1 ? "servidor" : "servidores"}
      </p>

      {servers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🖥️</p>
          <p className="font-medium text-white mb-1">Aún no hay servidores aquí</p>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Sé el primero en publicar el tuyo.
          </p>
          {session && (
            <Link href="/servers/new">
              <Button>Publicar servidor</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {servers.map((s) => {
            const cover = GAME_COVERS[s.game as Game];
            const logo = GAME_LOGOS[s.game as Game];
            return (
              <Link key={s.id} href={`/servers/${s.id}`} className="block group">
                <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] overflow-hidden hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/5 h-full flex flex-col">
                  {/* Cover or header */}
                  {cover ? (
                    <div className="relative h-24 w-full overflow-hidden flex-shrink-0">
                      <img src={cover} alt={GAME_LABELS[s.game as Game]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 px-4 py-2 flex items-end justify-between gap-2">
                        <h3 className="font-semibold text-sm text-white truncate group-hover:text-orange-300 transition-colors">
                          {s.name}
                        </h3>
                        <VoteCount votes={s.totalVotes} />
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 pt-4 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {logo ? (
                          <img src={logo} alt={GAME_LABELS[s.game as Game]} className="h-6 w-6 object-contain flex-shrink-0" />
                        ) : (
                          <span className="text-xl flex-shrink-0">{GAME_ICONS[s.game as Game]}</span>
                        )}
                        <h3 className="font-semibold text-sm text-white truncate group-hover:text-orange-300 transition-colors">
                          {s.name}
                        </h3>
                      </div>
                      <VoteCount votes={s.totalVotes} />
                    </div>
                  )}

                  <div className="px-4 pb-4 pt-3 flex flex-col gap-3 flex-1">
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">{s.description}</p>

                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="default">{GAME_LABELS[s.game as Game]}</Badge>
                      {s.modded && <Badge variant="accent">Mods</Badge>}
                      {s.maxPlayers && <Badge variant="default">Hasta {s.maxPlayers} jugadores</Badge>}
                      {s.ip && <Badge variant="default">🖥️ IP pública</Badge>}
                    </div>

                    <div className="flex items-center gap-2 mt-auto text-xs text-[var(--muted-foreground)]">
                      {s.discordUrl && (
                        <span className="flex items-center gap-1">
                          <span>💬</span> Discord
                        </span>
                      )}
                      {s.websiteUrl && (
                        <span className="flex items-center gap-1">
                          <span>🌐</span> Web
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!session && (
        <p className="text-center text-sm text-[var(--muted-foreground)]">
          <Link href="/register" className="text-orange-400 hover:text-orange-300">Regístrate</Link>
          {" "}para publicar tu servidor y votar cada día.
        </p>
      )}
    </div>
  );
}

function VoteCount({ votes }: { votes: number }) {
  return (
    <span className="flex items-center gap-1 text-xs font-semibold text-orange-400 flex-shrink-0 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
      ▲ {votes}
    </span>
  );
}
