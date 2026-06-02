import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { GAME_LABELS, GAME_ICONS } from "@/lib/constants";
import { VoteButton } from "./vote-button";
import type { Game } from "@/generated/prisma/client";
import type { Metadata } from "next";

const GAME_COVERS: Partial<Record<Game, string>> = {
  MINECRAFT: "/games/biome-minecraft.webp",
  LEAGUE_OF_LEGENDS: "/games/lol.jpg",
  PROJECT_ZOMBOID: "/games/PZ.jpg",
};

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const server = await prisma.gameServer.findUnique({
    where: { id },
    select: { name: true, description: true, game: true },
  });
  if (!server) return { title: "Servidor no encontrado" };
  return {
    title: `${server.name} — Servidor de ${GAME_LABELS[server.game as Game]} en español | GameMate`,
    description: server.description.slice(0, 160),
  };
}

export default async function ServerDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const server = await prisma.gameServer.findUnique({
    where: { id },
    select: {
      id: true, name: true, description: true, game: true, ip: true,
      discordUrl: true, websiteUrl: true, modded: true, modsNote: true,
      maxPlayers: true, totalVotes: true, createdAt: true,
      creator: { select: { id: true, name: true } },
    },
  });
  if (!server) notFound();

  const votedToday = session?.user?.id
    ? !!(await prisma.serverVote.findUnique({
        where: {
          serverId_userId_date: {
            serverId: id,
            userId: session.user.id,
            date: new Date().toLocaleDateString("es-ES", {
              timeZone: "Europe/Madrid",
              year: "numeric", month: "2-digit", day: "2-digit",
            }).split("/").reverse().join("-"),
          },
        },
        select: { id: true },
      }))
    : false;

  const cover = GAME_COVERS[server.game as Game];

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <Link href="/servers" className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors">
        ← Tablón de servidores
      </Link>

      {/* Header card */}
      <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {cover ? (
                <img src={cover} alt={GAME_LABELS[server.game as Game]} className="h-8 w-14 object-cover rounded flex-shrink-0" />
              ) : (
                <span className="text-2xl">{GAME_ICONS[server.game as Game]}</span>
              )}
              <Badge variant="default">{GAME_LABELS[server.game as Game]}</Badge>
              {server.modded && <Badge variant="accent">Mods</Badge>}
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{server.name}</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Publicado por <span className="text-white">{server.creator.name ?? "Anónimo"}</span>
              {" · "}
              {new Date(server.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          {/* Vote block */}
          <VoteButton
            serverId={server.id}
            votedToday={votedToday}
            totalVotes={server.totalVotes}
            isLoggedIn={!!session}
          />
        </div>
      </div>

      {/* Description */}
      <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-5">
        <h2 className="font-semibold text-white text-sm mb-3">Sobre el servidor</h2>
        <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-line leading-relaxed">
          {server.description}
        </p>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {server.ip && (
          <InfoCard icon="🖥️" label="IP del servidor">
            <code className="text-orange-400 text-sm font-mono select-all">{server.ip}</code>
          </InfoCard>
        )}
        {server.maxPlayers && (
          <InfoCard icon="👥" label="Máximo de jugadores">
            <span className="text-white text-sm">{server.maxPlayers} jugadores</span>
          </InfoCard>
        )}
        {server.modded && server.modsNote && (
          <InfoCard icon="🔧" label="Mods">
            <span className="text-sm text-[var(--muted-foreground)]">{server.modsNote}</span>
          </InfoCard>
        )}
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-3">
        {server.discordUrl && (
          <a
            href={server.discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#7289DA] hover:bg-[#5865F2]/30 transition-colors text-sm font-medium"
          >
            <span>💬</span> Unirse al Discord
          </a>
        )}
        {server.websiteUrl && (
          <a
            href={server.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--card-border)] text-white hover:text-orange-400 transition-colors text-sm font-medium"
          >
            <span>🌐</span> Ver web
          </a>
        )}
      </div>

      {!session && (
        <p className="text-center text-sm text-[var(--muted-foreground)]">
          <Link href="/login" className="text-orange-400 hover:text-orange-300">Inicia sesión</Link>
          {" "}para votar este servidor cada día y subirlo en el ranking.
        </p>
      )}
    </div>
  );
}

function InfoCard({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <span>{icon}</span>
        <span className="text-xs text-[var(--muted-foreground)] font-medium">{label}</span>
      </div>
      {children}
    </div>
  );
}
