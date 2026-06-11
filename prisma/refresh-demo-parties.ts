/**
 * Borra las parties demo existentes y crea un lote nuevo con los 50 usuarios.
 * Run with:  npx tsx prisma/refresh-demo-parties.ts
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DEFAULT_RULES } from "../src/lib/constants";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local") });
dotenv.config({ path: resolve(__dirname, "../.env") });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const TEMPLATES = [
  // Minecraft
  { game: "MINECRAFT", name: "Survival vanilla – mundo recién generado", skill: "INTERMEDIATE", max: 4, version: "JAVA", modded: false },
  { game: "MINECRAFT", name: "SMP estilo Hermitcraft – whitelist activo", skill: "ADVANCED", max: 6, version: "JAVA", modded: false },
  { game: "MINECRAFT", name: "Hardcore permanente – llegar al dragón", skill: "EXPERT", max: 3, version: "JAVA", modded: false },
  { game: "MINECRAFT", name: "SkyBlock desde cero – isla colaborativa", skill: "BEGINNER", max: 4, version: "JAVA", modded: false },
  { game: "MINECRAFT", name: "Create mod – fábrica colaborativa", skill: "ADVANCED", max: 4, version: "JAVA", modded: true },
  { game: "MINECRAFT", name: "Ciudad medieval – proyecto creativo", skill: "BEGINNER", max: 6, version: "JAVA", modded: false },
  { game: "MINECRAFT", name: "RLCraft – supervivencia extrema", skill: "EXPERT", max: 3, version: "JAVA", modded: true },
  { game: "MINECRAFT", name: "Vanilla 1.21 – activos mínimo 3 días/semana", skill: "INTERMEDIATE", max: 4, version: "JAVA", modded: false },
  { game: "MINECRAFT", name: "Pack ATM9 – busco gente organizada", skill: "EXPERT", max: 4, version: "JAVA", modded: true },
  { game: "MINECRAFT", name: "Survival + datapack QoL – ritmo tranquilo", skill: "BEGINNER", max: 5, version: "JAVA", modded: false },
  { game: "MINECRAFT", name: "Factions PVP – busco aliados", skill: "INTERMEDIATE", max: 5, version: "JAVA", modded: false },
  // LoL
  { game: "LEAGUE_OF_LEGENDS", name: "Subir a Platino – duo carril y apoyo", skill: "ADVANCED", max: 5, roles: ["ADC","SUPPORT"], rankMin: "GOLD", rankMax: "PLATINUM" },
  { game: "LEAGUE_OF_LEGENDS", name: "Flex relajado – buen rollo ante todo", skill: "BEGINNER", max: 5, roles: ["FILL"], rankMin: "SILVER", rankMax: "GOLD" },
  { game: "LEAGUE_OF_LEGENDS", name: "Premade ARAM 5v5 – cachondeo puro", skill: "BEGINNER", max: 5, roles: [], rankMin: "BRONZE", rankMax: "GOLD" },
  { game: "LEAGUE_OF_LEGENDS", name: "Ranked 5v5 – busco mid y jungle", skill: "INTERMEDIATE", max: 5, roles: ["MID","JUNGLE"], rankMin: "GOLD", rankMax: "EMERALD" },
  { game: "LEAGUE_OF_LEGENDS", name: "Tardes de ranked – grupo de 3-5", skill: "BEGINNER", max: 5, roles: ["FILL"], rankMin: "SILVER", rankMax: "GOLD" },
  { game: "LEAGUE_OF_LEGENDS", name: "Clash team – busco dos guerreros", skill: "INTERMEDIATE", max: 5, roles: ["ADC","SUPPORT"], rankMin: "GOLD", rankMax: "PLATINUM" },
  // PZ
  { game: "PROJECT_ZOMBOID", name: "Roleplay PZ – Supervivientes de Muldraugh", skill: "INTERMEDIATE", max: 4, modded: true },
  { game: "PROJECT_ZOMBOID", name: "Apocalipsis – configuración extrema", skill: "EXPERT", max: 4, modded: false },
  { game: "PROJECT_ZOMBOID", name: "PZ casual – aprender juntos", skill: "BEGINNER", max: 4, modded: false },
  { game: "PROJECT_ZOMBOID", name: "Supervivencia largo plazo – sin reset", skill: "ADVANCED", max: 6, modded: false },
  { game: "PROJECT_ZOMBOID", name: "Reto 100 días – misma run", skill: "INTERMEDIATE", max: 4, modded: false },
  { game: "PROJECT_ZOMBOID", name: "Base costera – estilo The Walking Dead", skill: "INTERMEDIATE", max: 4, modded: false },
];

async function main() {
  const demoUsers = await prisma.user.findMany({
    where: { email: { endsWith: "@gamemate-demo.fake" } },
    select: { id: true },
  });
  console.log(`Found ${demoUsers.length} demo users.`);

  // Borrar parties demo existentes (en cascada borra miembros, reglas, mensajes)
  const existing = await prisma.party.findMany({
    where: { creator: { email: { endsWith: "@gamemate-demo.fake" } } },
    select: { id: true },
  });

  if (existing.length) {
    const ids = existing.map(p => p.id);
    await prisma.$transaction([
      prisma.partyJoinRequest.deleteMany({ where: { partyId: { in: ids } } }),
      prisma.message.deleteMany({ where: { partyId: { in: ids } } }),
      prisma.partyRule.deleteMany({ where: { partyId: { in: ids } } }),
      prisma.partyMember.deleteMany({ where: { partyId: { in: ids } } }),
      prisma.party.deleteMany({ where: { id: { in: ids } } }),
    ]);
    console.log(`Deleted ${existing.length} old demo parties.`);
  }

  // Crear 15 parties nuevas con el pool completo
  const selected = shuffle(TEMPLATES).slice(0, 15);
  let created = 0;

  for (const tpl of selected) {
    const creator = pick(demoUsers);
    const initialSlots = randInt(1, Math.min(3, (tpl.max ?? 4) - 1));
    const otherMembers = shuffle(demoUsers.filter(u => u.id !== creator.id)).slice(0, initialSlots - 1);

    const gameKey = tpl.game as keyof typeof DEFAULT_RULES;
    const rulePool = DEFAULT_RULES[gameKey] ?? DEFAULT_RULES.OTHER;
    const requiredRules = rulePool.filter(r => r.isRequired);
    const optionalRules = shuffle(rulePool.filter(r => !r.isRequired)).slice(0, randInt(2, 3));

    await prisma.party.create({
      data: {
        name: tpl.name,
        game: tpl.game as any,
        skillLevel: tpl.skill as any,
        status: "OPEN",
        maxPlayers: tpl.max ?? 4,
        language: "es",
        minecraftVersion: tpl.game === "MINECRAFT" ? ((tpl as any).version ?? "JAVA") as any : undefined,
        modded: (tpl as any).modded ?? false,
        lolRoles: tpl.game === "LEAGUE_OF_LEGENDS" ? ((tpl as any).roles ?? []) : [],
        lolRankMin: tpl.game === "LEAGUE_OF_LEGENDS" ? ((tpl as any).rankMin as any) : undefined,
        lolRankMax: tpl.game === "LEAGUE_OF_LEGENDS" ? ((tpl as any).rankMax as any) : undefined,
        creatorId: creator.id,
        rules: {
          create: [...requiredRules, ...optionalRules].map(r => ({
            category: r.category, text: r.text, isDefault: true, isRequired: r.isRequired,
          })),
        },
        members: {
          create: [
            { userId: creator.id, role: "LEADER" },
            ...otherMembers.map(u => ({ userId: u.id, role: "MEMBER" as const })),
          ],
        },
      },
    });

    created++;
    console.log(`  ✓ [${tpl.game}] ${tpl.name}`);
  }

  console.log(`\nDone. ${created} new demo parties created with ${demoUsers.length} users in pool.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
