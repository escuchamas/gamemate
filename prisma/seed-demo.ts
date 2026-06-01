/**
 * Demo seed — creates fake users + parties to make the platform look active.
 * Run with:  npx tsx prisma/seed-demo.ts
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local") });
dotenv.config({ path: resolve(__dirname, "../.env") });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

const demoUsers = [
  { name: "Sniper123",     email: "demo_alejandro@gamemate-demo.fake",  image: null, reputation: 4.8, country: "es" },
  { name: "Javichu_MC",   email: "demo_nerea@gamemate-demo.fake",       image: null, reputation: 4.9, country: "es" },
  { name: "xXDarkWolfXx", email: "demo_sergio@gamemate-demo.fake",      image: null, reputation: 4.5, country: "es" },
  { name: "MartaGG",      email: "demo_lucia@gamemate-demo.fake",       image: null, reputation: 5.0, country: "es" },
  { name: "ProKiller99",  email: "demo_carlos@gamemate-demo.fake",      image: null, reputation: 4.7, country: "es" },
  { name: "DaniCraft_",   email: "demo_marta@gamemate-demo.fake",       image: null, reputation: 4.6, country: "es" },
  { name: "NightStalker_",email: "demo_pablo@gamemate-demo.fake",       image: null, reputation: 4.4, country: "es" },
  { name: "Alejito_GG",   email: "demo_ana@gamemate-demo.fake",         image: null, reputation: 4.8, country: "es" },
  { name: "Fr4gMaster",   email: "demo_luis@gamemate-demo.fake",        image: null, reputation: 4.3, country: "es" },
  { name: "PaulaGames",   email: "demo_sofia@gamemate-demo.fake",       image: null, reputation: 4.9, country: "es" },
  { name: "L3g3nd4ry_",   email: "demo_diego@gamemate-demo.fake",       image: null, reputation: 4.6, country: "es" },
  { name: "Carlitos99",   email: "demo_elena@gamemate-demo.fake",       image: null, reputation: 5.0, country: "es" },
  { name: "xXxViper",     email: "demo_ivan@gamemate-demo.fake",        image: null, reputation: 4.7, country: "es" },
  { name: "CrazyFrag_ES", email: "demo_laura@gamemate-demo.fake",       image: null, reputation: 4.5, country: "es" },
  { name: "Ruben_MC",     email: "demo_ruben@gamemate-demo.fake",       image: null, reputation: 4.2, country: "es" },
];

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000);

async function main() {
  console.log("Creating demo users...");

  const created = await Promise.all(
    demoUsers.map((u) =>
      prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          name: u.name,
          email: u.email,
          image: u.image,
          reputation: u.reputation,
          reputationCount: Math.floor(Math.random() * 12) + 3,
          country: u.country,
          language: "es",
          spokenLangs: ["es"],
        },
      })
    )
  );

  const [alejandro, nerea, sergio, lucia, carlos, marta, pablo, ana, luis, sofia, diego, elena, ivan, laura, ruben] = created;

  console.log("Creating demo parties...");

  // ── 1. Minecraft Survival ────────────────────────────────────────────────────
  const p1 = await prisma.party.upsert({
    where: { id: "demo-party-mc-survival-01" },
    update: {},
    create: {
      id: "demo-party-mc-survival-01",
      name: "Survival vanilla – mundo recién generado",
      description: "Empezamos un mundo nuevo desde cero. Queremos hacer granjas, explorar y construir una base comunitaria. Sin mods, pura vanilla. Buscamos jugadores constantes que no desaparezcan a la semana.",
      game: "MINECRAFT",
      skillLevel: "INTERMEDIATE",
      status: "OPEN",
      maxPlayers: 4,
      language: "es",
      minecraftVersion: "JAVA",
      modded: false,
      creatorId: alejandro.id,
      createdAt: daysAgo(3),
      updatedAt: daysAgo(1),
    },
  });
  await upsertMembers(p1.id, [
    { userId: alejandro.id, role: "LEADER" as const, joinedAt: daysAgo(3) },
    { userId: nerea.id,     role: "MEMBER" as const, joinedAt: daysAgo(2) },
    { userId: sergio.id,    role: "MEMBER" as const, joinedAt: daysAgo(1) },
  ]);

  // ── 2. LoL Gold duo ─────────────────────────────────────────────────────────
  const p2 = await prisma.party.upsert({
    where: { id: "demo-party-lol-gold-01" },
    update: {},
    create: {
      id: "demo-party-lol-gold-01",
      name: "Subir a Platino – duo carril y apoyo",
      description: "Estamos en Gold II y queremos subir a Plat antes de que acabe la temporada. Buscamos ADC o Support serio, que juegue bien en equipo y no flameé. Mic no obligatorio pero bienvenido.",
      game: "LEAGUE_OF_LEGENDS",
      skillLevel: "ADVANCED",
      status: "OPEN",
      maxPlayers: 5,
      language: "es",
      lolRoles: ["ADC", "SUPPORT"],
      lolRankMin: "GOLD",
      lolRankMax: "PLATINUM",
      creatorId: carlos.id,
      createdAt: daysAgo(5),
      updatedAt: daysAgo(1),
    },
  });
  await upsertMembers(p2.id, [
    { userId: carlos.id,  role: "LEADER" as const, joinedAt: daysAgo(5) },
    { userId: marta.id,   role: "MEMBER" as const, joinedAt: daysAgo(4) },
    { userId: pablo.id,   role: "MEMBER" as const, joinedAt: daysAgo(3) },
    { userId: ana.id,     role: "MEMBER" as const, joinedAt: daysAgo(2) },
  ]);

  // ── 3. Project Zomboid Roleplay ──────────────────────────────────────────────
  const p3 = await prisma.party.upsert({
    where: { id: "demo-party-pz-roleplay-01" },
    update: {},
    create: {
      id: "demo-party-pz-roleplay-01",
      name: "Roleplay PZ – Supervivientes de Muldraugh",
      description: "Servidor privado con reglas de roleplay ligero. Cada jugador elige un rol (médico, mecánico, cocinero...) y convivimos en la misma base. Sin trampas, sin metagaming. Configuración con mods de zombis más lentos y más loot.",
      game: "PROJECT_ZOMBOID",
      skillLevel: "INTERMEDIATE",
      status: "OPEN",
      maxPlayers: 4,
      language: "es",
      modded: true,
      creatorId: lucia.id,
      createdAt: daysAgo(2),
      updatedAt: daysAgo(0),
    },
  });
  await upsertMembers(p3.id, [
    { userId: lucia.id,  role: "LEADER" as const, joinedAt: daysAgo(2) },
    { userId: luis.id,   role: "MEMBER" as const, joinedAt: daysAgo(1) },
    { userId: sofia.id,  role: "MEMBER" as const, joinedAt: daysAgo(1) },
  ]);

  // ── 4. Minecraft Hardcore ────────────────────────────────────────────────────
  const p4 = await prisma.party.upsert({
    where: { id: "demo-party-mc-hardcore-01" },
    update: {},
    create: {
      id: "demo-party-mc-hardcore-01",
      name: "Hardcore permanente – sin muertes permitidas",
      description: "Mundo hardcore real: si mueres, te vas. Buscamos jugadores con experiencia en hardcore que sepan gestionar recursos y no tomen riesgos tontos. El objetivo es llegar al End y matar al dragón.",
      game: "MINECRAFT",
      skillLevel: "EXPERT",
      status: "OPEN",
      maxPlayers: 3,
      language: "es",
      minecraftVersion: "JAVA",
      modded: false,
      creatorId: diego.id,
      createdAt: daysAgo(1),
      updatedAt: daysAgo(0),
    },
  });
  await upsertMembers(p4.id, [
    { userId: diego.id,  role: "LEADER" as const, joinedAt: daysAgo(1) },
    { userId: elena.id,  role: "MEMBER" as const, joinedAt: daysAgo(0) },
  ]);

  // ── 5. LoL Silver relajado ───────────────────────────────────────────────────
  const p5 = await prisma.party.upsert({
    where: { id: "demo-party-lol-silver-01" },
    update: {},
    create: {
      id: "demo-party-lol-silver-01",
      name: "Flex relajado Silver – buen rollo ante todo",
      description: "Partidas de flex sin presión. Somos un grupo de amigos que jugamos por las tardes y buscamos gente con actitud positiva. No importa el resultado, lo importante es pasarlo bien. Cualquier rol bienvenido.",
      game: "LEAGUE_OF_LEGENDS",
      skillLevel: "BEGINNER",
      status: "OPEN",
      maxPlayers: 5,
      language: "es",
      lolRoles: ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"],
      lolRankMin: "SILVER",
      lolRankMax: "GOLD",
      creatorId: ivan.id,
      createdAt: daysAgo(4),
      updatedAt: daysAgo(2),
    },
  });
  await upsertMembers(p5.id, [
    { userId: ivan.id,   role: "LEADER" as const, joinedAt: daysAgo(4) },
    { userId: laura.id,  role: "MEMBER" as const, joinedAt: daysAgo(3) },
    { userId: ruben.id,  role: "MEMBER" as const, joinedAt: daysAgo(3) },
    { userId: sergio.id, role: "MEMBER" as const, joinedAt: daysAgo(2) },
  ]);

  // ── 6. Project Zomboid supervivencia extrema ─────────────────────────────────
  const p6 = await prisma.party.upsert({
    where: { id: "demo-party-pz-hardcore-01" },
    update: {},
    create: {
      id: "demo-party-pz-hardcore-01",
      name: "PZ Apocalipsis – configuración extrema",
      description: "Config de max dificultad: zombis rápidos, sprinters nocturnos, loot escaso. Nada de mods que faciliten el juego. Buscamos jugadores que ya hayan sobrevivido más de 30 días en singleplayer. Discord obligatorio.",
      game: "PROJECT_ZOMBOID",
      skillLevel: "EXPERT",
      status: "OPEN",
      maxPlayers: 4,
      language: "es",
      modded: false,
      creatorId: nerea.id,
      createdAt: daysAgo(6),
      updatedAt: daysAgo(2),
    },
  });
  await upsertMembers(p6.id, [
    { userId: nerea.id,  role: "LEADER" as const, joinedAt: daysAgo(6) },
    { userId: pablo.id,  role: "MEMBER" as const, joinedAt: daysAgo(5) },
    { userId: laura.id,  role: "MEMBER" as const, joinedAt: daysAgo(4) },
    { userId: ruben.id,  role: "MEMBER" as const, joinedAt: daysAgo(3) },
  ]);

  // ── 7. Minecraft creative build ──────────────────────────────────────────────
  const p7 = await prisma.party.upsert({
    where: { id: "demo-party-mc-creative-01" },
    update: {},
    create: {
      id: "demo-party-mc-creative-01",
      name: "Megabuild creativo – ciudad medieval",
      description: "Proyecto de construcción a largo plazo: ciudad medieval con castillo, mercado, casas de aldeanos y catedral. Cada jugador se encarga de un barrio. Bienvenidos todos los niveles, solo necesitas ganas de construir y paciencia.",
      game: "MINECRAFT",
      skillLevel: "BEGINNER",
      status: "OPEN",
      maxPlayers: 6,
      language: "es",
      minecraftVersion: "JAVA",
      modded: false,
      creatorId: marta.id,
      createdAt: daysAgo(7),
      updatedAt: daysAgo(1),
    },
  });
  await upsertMembers(p7.id, [
    { userId: marta.id,     role: "LEADER" as const, joinedAt: daysAgo(7) },
    { userId: alejandro.id, role: "MEMBER" as const, joinedAt: daysAgo(6) },
    { userId: elena.id,     role: "MEMBER" as const, joinedAt: daysAgo(5) },
  ]);

  console.log("Done! Created 7 demo parties with members.");
}

async function upsertMembers(
  partyId: string,
  members: { userId: string; role: "LEADER" | "MEMBER"; joinedAt: Date }[]
) {
  for (const m of members) {
    await prisma.partyMember.upsert({
      where: { partyId_userId: { partyId, userId: m.userId } },
      update: {},
      create: { partyId, userId: m.userId, role: m.role, joinedAt: m.joinedAt },
    });
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
