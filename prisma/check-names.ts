import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local") });
dotenv.config({ path: resolve(__dirname, "../.env") });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

const CORRECT_NAMES: Record<string, string> = {
  "demo_alejandro@gamemate-demo.fake": "Sniper123",
  "demo_nerea@gamemate-demo.fake":      "Javichu_MC",
  "demo_sergio@gamemate-demo.fake":     "xXDarkWolfXx",
  "demo_lucia@gamemate-demo.fake":      "MartaGG",
  "demo_carlos@gamemate-demo.fake":     "ProKiller99",
  "demo_marta@gamemate-demo.fake":      "DaniCraft_",
  "demo_pablo@gamemate-demo.fake":      "NightStalker_",
  "demo_ana@gamemate-demo.fake":        "Alejito_GG",
  "demo_luis@gamemate-demo.fake":       "Fr4gMaster",
  "demo_sofia@gamemate-demo.fake":      "PaulaGames",
  "demo_diego@gamemate-demo.fake":      "L3g3nd4ry_",
  "demo_elena@gamemate-demo.fake":      "Carlitos99",
  "demo_ivan@gamemate-demo.fake":       "xXxViper",
  "demo_laura@gamemate-demo.fake":      "CrazyFrag_ES",
  "demo_ruben@gamemate-demo.fake":      "Ruben_MC",
};

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { endsWith: "@gamemate-demo.fake" } },
    select: { email: true, name: true },
  });

  let needsFix = false;
  for (const u of users) {
    const expected = CORRECT_NAMES[u.email];
    const ok = u.name === expected;
    console.log(`${ok ? "✓" : "✗"} ${u.email.split("@")[0].padEnd(20)} → ${u.name} ${ok ? "" : `(debería ser ${expected})`}`);
    if (!ok) needsFix = true;
  }

  if (needsFix) {
    console.log("\nCorrigiendo...");
    for (const [email, name] of Object.entries(CORRECT_NAMES)) {
      await prisma.user.update({ where: { email }, data: { name } });
    }
    console.log("Hecho.");
  } else {
    console.log("\nTodos los nombres son correctos.");
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
