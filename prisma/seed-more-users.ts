/**
 * Adds 35 more demo users to the pool (total: 50).
 * Run with:  npx tsx prisma/seed-more-users.ts
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local") });
dotenv.config({ path: resolve(__dirname, "../.env") });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

const NEW_USERS = [
  // Males
  { name: "PaquitoPro_",   email: "demo_paquito@gamemate-demo.fake",    reputation: 4.4 },
  { name: "xXx_D4rk_xXx", email: "demo_xdark@gamemate-demo.fake",      reputation: 4.1 },
  { name: "BruhMoment_ES", email: "demo_bruh@gamemate-demo.fake",       reputation: 4.6 },
  { name: "N00bSlayer_",   email: "demo_noobslayer@gamemate-demo.fake", reputation: 4.3 },
  { name: "NachoCraft_",   email: "demo_nacho@gamemate-demo.fake",      reputation: 4.7 },
  { name: "Espartano99",   email: "demo_espartano@gamemate-demo.fake",  reputation: 4.5 },
  { name: "Vladimix_",     email: "demo_vladi@gamemate-demo.fake",      reputation: 4.8 },
  { name: "TriggeredES",   email: "demo_triggered@gamemate-demo.fake",  reputation: 4.2 },
  { name: "MapacheGG",     email: "demo_mapache@gamemate-demo.fake",    reputation: 4.9 },
  { name: "1nf3rn4l_",     email: "demo_infernal@gamemate-demo.fake",   reputation: 4.0 },
  { name: "GodModeON",     email: "demo_godmode@gamemate-demo.fake",    reputation: 4.6 },
  { name: "B3ast_ES",      email: "demo_beast@gamemate-demo.fake",      reputation: 4.3 },
  { name: "JoseluFPS",     email: "demo_joselu@gamemate-demo.fake",     reputation: 4.5 },
  { name: "IcyBlade_ES",   email: "demo_icyblade@gamemate-demo.fake",   reputation: 4.7 },
  { name: "NoCap_GG",      email: "demo_nocap@gamemate-demo.fake",      reputation: 4.4 },
  { name: "AbueloCraft",   email: "demo_abuelo@gamemate-demo.fake",     reputation: 5.0 },
  { name: "Kr4tos_PZ",     email: "demo_kratos@gamemate-demo.fake",     reputation: 4.8 },
  { name: "HardFlank_",    email: "demo_hardflank@gamemate-demo.fake",  reputation: 4.2 },
  { name: "MelonGamer",    email: "demo_melon@gamemate-demo.fake",      reputation: 4.6 },
  { name: "XtremeFrag",    email: "demo_xtreme@gamemate-demo.fake",     reputation: 4.3 },
  { name: "PacoGG",        email: "demo_pacogg@gamemate-demo.fake",     reputation: 4.1 },
  { name: "TurboGamin_",   email: "demo_turbo@gamemate-demo.fake",      reputation: 4.5 },
  { name: "JuanitoGG",     email: "demo_juanito@gamemate-demo.fake",    reputation: 4.7 },
  { name: "Miguelito_MC",  email: "demo_miguelito@gamemate-demo.fake",  reputation: 4.4 },
  { name: "Dani_Shotgun",  email: "demo_dani2@gamemate-demo.fake",      reputation: 4.8 },
  { name: "QuantumFrag",   email: "demo_quantum@gamemate-demo.fake",    reputation: 4.6 },
  { name: "ShadowLurk_",   email: "demo_shadow@gamemate-demo.fake",     reputation: 4.2 },
  { name: "DeathRider_",   email: "demo_death@gamemate-demo.fake",      reputation: 4.9 },
  { name: "KingCobra_",    email: "demo_king@gamemate-demo.fake",       reputation: 4.3 },
  { name: "Fr4gM4ster2",   email: "demo_fragmaster2@gamemate-demo.fake",reputation: 4.7 },
  // Females (~5 of 35 = 14%, total ~13%)
  { name: "Luci4_GG",      email: "demo_luci@gamemate-demo.fake",       reputation: 4.9 },
  { name: "NoaGames_",     email: "demo_noa@gamemate-demo.fake",        reputation: 4.6 },
  { name: "AndreaFPS",     email: "demo_andrea@gamemate-demo.fake",     reputation: 4.8 },
  { name: "IsaGamer_",     email: "demo_isa@gamemate-demo.fake",        reputation: 4.5 },
  { name: "ValentinaGG",   email: "demo_valentina@gamemate-demo.fake",  reputation: 4.7 },
];

async function main() {
  console.log(`Adding ${NEW_USERS.length} more demo users...`);

  let created = 0;
  let skipped = 0;

  for (const u of NEW_USERS) {
    const result = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        image: null,
        reputation: u.reputation,
        reputationCount: Math.floor(Math.random() * 15) + 2,
        country: "es",
        language: "es",
        spokenLangs: ["es"],
      },
      select: { id: true, name: true, email: true },
    });

    const wasNew = !(await prisma.user.findFirst({
      where: { email: u.email, createdAt: { lte: new Date(Date.now() - 5000) } },
      select: { id: true },
    }));

    console.log(`  ${u.name.padEnd(16)} → ${result.id}`);
    created++;
  }

  const total = await prisma.user.count({
    where: { email: { endsWith: "@gamemate-demo.fake" } },
  });

  console.log(`\nDone. Total demo users in DB: ${total}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
