/**
 * Seed de servidores REALES — extraídos de directorios públicos.
 * Fuentes: minecraft-mp.com, servidoresdeminecraft.es, trackyserver.com/pz
 * Run with:  npx tsx prisma/seed-servers.ts
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local") });
dotenv.config({ path: resolve(__dirname, "../.env") });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

const SERVERS = [
  // ── Minecraft Spain ──────────────────────────────────────────────────────────
  {
    game: "MINECRAFT",
    name: "Supercraft",
    description: "Uno de los servidores más conocidos de España. Semi-premium, compatible con Java 1.8-1.21 y Bedrock. Modos: Survival, Facciones, SkyBlock, SkyWars, Parkour, Creativo y Vanilla. Comunidad española y latinoamericana activa.",
    ip: "mc.supercraft.es",
    discordUrl: null,
    websiteUrl: "https://supercraft.es",
    modded: false,
    maxPlayers: 2000,
    totalVotes: 312,
  },
  {
    game: "MINECRAFT",
    name: "Obsilion Network",
    description: "Servidor español con enfoque en survival, vanilla y PvP 1vs1. Compatible Java y Bedrock (1.16-1.21). Comunidad española activa, administración cercana y eventos regulares.",
    ip: "obsilion.es",
    discordUrl: null,
    websiteUrl: "https://obsilion.es",
    modded: false,
    maxPlayers: 1000,
    totalVotes: 198,
  },
  {
    game: "MINECRAFT",
    name: "DEATHZONE Network",
    description: "Red española con survival, SkyBlock, facciones, RPG y Prison. Java y Bedrock compatibles (1.7-1.21). Semi-premium. Lleva años activa con una comunidad fiel.",
    ip: "deathzone.net",
    discordUrl: null,
    websiteUrl: "https://deathzone.net",
    modded: false,
    maxPlayers: 1000,
    totalVotes: 145,
  },
  {
    game: "MINECRAFT",
    name: "Arefy Network",
    description: "Red en español activa desde enero de 2014. Prison, Survival, SkyWars, Eggwars y SkyBlock. Semi-premium, versión 1.21. Una de las más antiguas y estables del panorama hispano.",
    ip: "arefy.net",
    discordUrl: null,
    websiteUrl: "https://arefy.net",
    modded: false,
    maxPlayers: 1000,
    totalVotes: 167,
  },
  {
    game: "MINECRAFT",
    name: "GeoBlock",
    description: "Considerado por muchos el mejor servidor de SkyBlock en español. Lleva más de 5 años operativo, versión 1.21. Semi-premium. Actualizado y optimizado regularmente por su equipo.",
    ip: "geoblock.es",
    discordUrl: null,
    websiteUrl: "https://geoblock.es",
    modded: false,
    maxPlayers: 120,
    totalVotes: 134,
  },
  {
    game: "MINECRAFT",
    name: "MithrandirCraft",
    description: "Servidor supervivencia español en activo desde la primavera de 2012. Uno de los más veteranos del panorama hispano. Comunidad consolidada y sin resets de mapa.",
    ip: "mithcraft.es",
    discordUrl: null,
    websiteUrl: "https://mithcraft.es",
    modded: false,
    maxPlayers: 500,
    totalVotes: 89,
  },
  {
    game: "MINECRAFT",
    name: "Edoras Minecraft",
    description: "Servidor de supervivencia vanilla para la comunidad española. Enfocado en jugadores que buscan una experiencia clásica y sin complicaciones. Ambiente familiar.",
    ip: "server.edoras.es",
    discordUrl: null,
    websiteUrl: null,
    modded: false,
    maxPlayers: null,
    totalVotes: 56,
  },
  {
    game: "MINECRAFT",
    name: "ElMaletinMagico Network",
    description: "Supervivencia Earth con ciudades, naciones y economía entre jugadores. Mapa del mundo real en Minecraft con política y diplomacia entre facciones. Única experiencia en español.",
    ip: "elmaletinmagico.com",
    discordUrl: null,
    websiteUrl: "https://elmaletinmagico.com",
    modded: false,
    maxPlayers: null,
    totalVotes: 103,
  },
  {
    game: "MINECRAFT",
    name: "MeeTion Network",
    description: "Gran red hispana con más de 280 jugadores activos simultáneos. Modos: Facciones, RPG, Survival, Towny, Vanilla, KitPVP, Parkour y más. Compatible Java 1.16-1.21 y Bedrock. Originaria de Perú, comunidad panlatina.",
    ip: null,
    discordUrl: null,
    websiteUrl: "https://meetion.net",
    modded: false,
    maxPlayers: 2000,
    totalVotes: 241,
  },
  {
    game: "MINECRAFT",
    name: "MINELATINO Network",
    description: "Red sin-premium enfocada en América Latina. Java y Bedrock compatibles. SkyBlock, Vanilla, Survival, Creativo y varios modos PvP. Más de 100 jugadores activos simultáneos.",
    ip: "play.minelatino.com",
    discordUrl: null,
    websiteUrl: "https://minelatino.com",
    modded: false,
    maxPlayers: 9999,
    totalVotes: 178,
  },

  // ── Project Zomboid ──────────────────────────────────────────────────────────
  {
    game: "PROJECT_ZOMBOID",
    name: "MEMENTO MORI",
    description: "Servidor PvE argentino en Build 42. Config equilibrada: ratio de tiempo 2h real = 1 día en juego. Sistema de expansión de zonas seguras para facciones y eventos regulares organizados por la administración. Ambiente relajado y comunidad activa.",
    ip: "190.57.245.52:30045",
    discordUrl: null,
    websiteUrl: null,
    modded: false,
    maxPlayers: 60,
    totalVotes: 71,
  },
  {
    game: "PROJECT_ZOMBOID",
    name: "NosferaDomain",
    description: "Servidor hispano de Project Zomboid Build 42 con roleplay obligatorio. Mods auxiliares para mejorar la inmersión. Mapas Echo Creek y Muldraugh, KY. Comunidad seria que valora el RP.",
    ip: null,
    discordUrl: null,
    websiteUrl: null,
    modded: true,
    modsNote: "Mods auxiliares de roleplay e inmersión",
    maxPlayers: 64,
    totalVotes: 44,
  },
  {
    game: "PROJECT_ZOMBOID",
    name: "[LATAM] PvEvP Supervivencia Extrema",
    description: "Servidor latinoamericano de PZ con temporadas temáticas. Modalidad PvEvP: combates entre jugadores permitidos pero los zombis son el enemigo principal. Configuración de supervivencia extrema.",
    ip: null,
    discordUrl: "https://discord.gg/uadcZVE7C5",
    websiteUrl: null,
    modded: true,
    maxPlayers: 30,
    totalVotes: 58,
  },
  {
    game: "PROJECT_ZOMBOID",
    name: "BlackOut En La Mazmorra",
    description: "Servidor PZ hispano con reset de mapa, vehículos y camiones funcionales, mecánicas de invierno real y staff activo 24/7. Sorpresas con hordas dinámicas, lag mínimo y gameplay inmersivo. Comunidad española y latinoamericana.",
    ip: null,
    discordUrl: "https://discord.gg/Bx4e6faEyQ",
    websiteUrl: null,
    modded: false,
    maxPlayers: null,
    totalVotes: 83,
  },
];

async function main() {
  // Borrar servidores demo anteriores (los inventados)
  const deleted = await prisma.gameServer.deleteMany({});
  console.log(`Deleted ${deleted.count} old servers.`);

  const creator = await prisma.user.findFirst({
    where: { email: { endsWith: "@gamemate-demo.fake" } },
    select: { id: true },
  });
  if (!creator) {
    console.error("No demo users found. Run seed-demo.ts first.");
    process.exit(1);
  }

  console.log(`Seeding ${SERVERS.length} real servers...`);
  for (const s of SERVERS) {
    await prisma.gameServer.create({
      data: {
        game: s.game as any,
        name: s.name,
        description: s.description,
        ip: s.ip ?? null,
        discordUrl: s.discordUrl ?? null,
        websiteUrl: s.websiteUrl ?? null,
        modded: s.modded,
        modsNote: (s as any).modsNote ?? null,
        maxPlayers: s.maxPlayers ?? null,
        totalVotes: s.totalVotes,
        language: "es",
        creatorId: creator.id,
      },
    });
    console.log(`  ✓ ${s.name}`);
  }

  console.log(`\nDone. ${SERVERS.length} real servers created.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
