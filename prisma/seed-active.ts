/**
 * Creates demo parties in FULL / IN_GAME states so the listing looks active.
 * Run with:  npx tsx prisma/seed-active.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local") });
dotenv.config({ path: resolve(__dirname, "../.env") });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000);
const daysAgo  = (d: number) => new Date(Date.now() - d * 86_400_000);

const RULES = {
  MINECRAFT: [
    { category: "BEHAVIOR" as const,      text: "No griefear las construcciones de otros jugadores",    isRequired: true  },
    { category: "BEHAVIOR" as const,      text: "No robar de los cofres sin permiso",                   isRequired: true  },
    { category: "GAMEPLAY" as const,      text: "No usar exploits ni trampas",                          isRequired: false },
    { category: "COMMUNICATION" as const, text: "Avisar si no puedes conectarte",                       isRequired: false },
  ],
  LEAGUE_OF_LEGENDS: [
    { category: "BEHAVIOR" as const,      text: "Cero toxicidad — ni chat negativo ni flaming",         isRequired: true  },
    { category: "BEHAVIOR" as const,      text: "No rendirse sin consenso del equipo",                  isRequired: true  },
    { category: "GAMEPLAY" as const,      text: "Jugar el rol asignado y no robar carriles",            isRequired: false },
  ],
  PROJECT_ZOMBOID: [
    { category: "BEHAVIOR" as const,      text: "No matar a otros jugadores (PvP desactivado salvo acuerdo)", isRequired: true },
    { category: "BEHAVIOR" as const,      text: "No saquear la base de otros jugadores",                isRequired: true  },
    { category: "GAMEPLAY" as const,      text: "Compartir recursos cuando sea posible",                isRequired: false },
  ],
};

type GameKey = keyof typeof RULES;

const PARTIES: {
  name: string; game: GameKey; skill: string; max: number;
  status: "FULL" | "IN_GAME"; createdAt: Date;
  version?: string; modded?: boolean;
  roles?: string[]; rankMin?: string; rankMax?: string;
}[] = [
  // ── FULL ──────────────────────────────────────────────────────────────────
  { name: "Survival vanilla – equipo completo",    game: "MINECRAFT",         skill: "INTERMEDIATE", max: 4, status: "FULL",    version: "JAVA",    createdAt: hoursAgo(5) },
  { name: "Ranked Gold flex – 5v5 armado",          game: "LEAGUE_OF_LEGENDS", skill: "ADVANCED",     max: 5, status: "FULL",    roles: ["TOP","JUNGLE","MID","ADC","SUPPORT"], rankMin: "GOLD",     rankMax: "PLATINUM", createdAt: hoursAgo(3) },
  { name: "PZ roleplay – grupo cerrado",            game: "PROJECT_ZOMBOID",   skill: "INTERMEDIATE", max: 4, status: "FULL",    modded: true,       createdAt: hoursAgo(4) },
  { name: "Hardcore MC – ya somos 3",               game: "MINECRAFT",         skill: "EXPERT",       max: 3, status: "FULL",    version: "JAVA",    createdAt: hoursAgo(6) },
  { name: "Silver flex – premade armado",           game: "LEAGUE_OF_LEGENDS", skill: "BEGINNER",     max: 5, status: "FULL",    roles: ["FILL"],    rankMin: "SILVER",   rankMax: "GOLD",      createdAt: hoursAgo(2) },
  { name: "SMP estilo Hermitcraft – lleno",         game: "MINECRAFT",         skill: "ADVANCED",     max: 4, status: "FULL",    version: "JAVA",    createdAt: hoursAgo(7) },
  { name: "PZ supervivencia – 4 preparados",        game: "PROJECT_ZOMBOID",   skill: "ADVANCED",     max: 4, status: "FULL",    modded: false,      createdAt: hoursAgo(3) },
  { name: "Create mod – fábrica al completo",       game: "MINECRAFT",         skill: "ADVANCED",     max: 4, status: "FULL",    version: "JAVA",    modded: true, createdAt: hoursAgo(8) },
  { name: "Duo bot Gold – encontré mi ADC",         game: "LEAGUE_OF_LEGENDS", skill: "INTERMEDIATE", max: 2, status: "FULL",    roles: ["ADC","SUPPORT"], rankMin: "GOLD", rankMax: "PLATINUM", createdAt: hoursAgo(1) },
  { name: "PZ reto 100 días – completos",           game: "PROJECT_ZOMBOID",   skill: "INTERMEDIATE", max: 4, status: "FULL",    modded: false,      createdAt: hoursAgo(5) },
  // ── IN_GAME ───────────────────────────────────────────────────────────────
  { name: "Speedrun coop – vamos al End",           game: "MINECRAFT",         skill: "EXPERT",       max: 2, status: "IN_GAME", version: "JAVA",    createdAt: hoursAgo(11) },
  { name: "Ranked Emerald – en partida",            game: "LEAGUE_OF_LEGENDS", skill: "ADVANCED",     max: 4, status: "IN_GAME", roles: ["TOP","JUNGLE","MID","ADC"], rankMin: "EMERALD", rankMax: "DIAMOND", createdAt: hoursAgo(9) },
  { name: "PZ – limpiando Louisville",              game: "PROJECT_ZOMBOID",   skill: "EXPERT",       max: 4, status: "IN_GAME", modded: false,      createdAt: daysAgo(1) },
  { name: "Vanilla SMP – segunda semana",           game: "MINECRAFT",         skill: "INTERMEDIATE", max: 5, status: "IN_GAME", version: "JAVA",    createdAt: daysAgo(2) },
  { name: "ARAM premade – en plena partida",        game: "LEAGUE_OF_LEGENDS", skill: "BEGINNER",     max: 5, status: "IN_GAME", roles: [],           rankMin: "BRONZE",   rankMax: "GOLD",      createdAt: hoursAgo(10) },
  { name: "PZ roleplay – día 14 activo",            game: "PROJECT_ZOMBOID",   skill: "INTERMEDIATE", max: 4, status: "IN_GAME", modded: true,       createdAt: daysAgo(1) },
  { name: "RLCraft – primera noche pasada",         game: "MINECRAFT",         skill: "EXPERT",       max: 3, status: "IN_GAME", version: "JAVA",    modded: true, createdAt: hoursAgo(12) },
  { name: "Plat climb – segunda partida",           game: "LEAGUE_OF_LEGENDS", skill: "INTERMEDIATE", max: 2, status: "IN_GAME", roles: ["MID","JUNGLE"], rankMin: "PLATINUM", rankMax: "EMERALD", createdAt: hoursAgo(8) },
];

async function main() {
  const demoUsers = await prisma.user.findMany({
    where: { email: { endsWith: "@gamemate-demo.fake" } },
    select: { id: true },
  });
  if (!demoUsers.length) throw new Error("No demo users. Run seed-demo.ts first.");

  for (const p of PARTIES) {
    const creator = pick(demoUsers);
    const others  = shuffle(demoUsers.filter(u => u.id !== creator.id));
    const memberSlots = Math.min(p.max, demoUsers.length);
    const members = [creator, ...others.slice(0, memberSlots - 1)];
    const rules   = (RULES[p.game] ?? RULES.PROJECT_ZOMBOID).map(r => ({
      category: r.category, text: r.text, isDefault: true, isRequired: r.isRequired,
    }));

    await prisma.party.create({
      data: {
        name: p.name,
        game: p.game,
        skillLevel: p.skill as any,
        status: p.status,
        maxPlayers: p.max,
        language: "es",
        minecraftVersion: p.game === "MINECRAFT" ? ((p.version ?? "JAVA") as any) : undefined,
        modded: p.modded ?? false,
        lolRoles:  p.game === "LEAGUE_OF_LEGENDS" ? (p.roles ?? []) : [],
        lolRankMin: p.game === "LEAGUE_OF_LEGENDS" ? (p.rankMin as any) : undefined,
        lolRankMax: p.game === "LEAGUE_OF_LEGENDS" ? (p.rankMax as any) : undefined,
        creatorId: creator.id,
        createdAt: p.createdAt,
        rules:   { create: rules },
        members: { create: members.map((u, i) => ({ userId: u.id, role: i === 0 ? "LEADER" : "MEMBER" })) },
      },
    });
    process.stdout.write(".");
  }
  console.log(`\nCreated ${PARTIES.length} FULL/IN_GAME parties`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
