/**
 * Seed de servidores demo — 20 servidores españoles realistas.
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
  // ── Minecraft ────────────────────────────────────────────────────────────────
  {
    game: "MINECRAFT",
    name: "CraftEspaña SMP",
    description: "SMP español con más de 2 años de historia. Jugamos en survival vanilla con datapacks de calidad de vida. Comunidad activa de unas 40 personas, sesiones organizadas los fines de semana. Buscamos jugadores constantes que quieran construir juntos a largo plazo. Sin drama, sin toxicidad.",
    ip: "play.craftespana.es",
    discordUrl: "https://discord.gg/craftespana",
    websiteUrl: "https://craftespana.es",
    modded: false,
    maxPlayers: 60,
    totalVotes: 147,
  },
  {
    game: "MINECRAFT",
    name: "HispaCraft Network",
    description: "Servidor de minijuegos en castellano con BedWars, SkyWars, SkyBlock y survival. Llevamos operativos desde 2020. Versión 1.21 Java. Picos de 150 jugadores en fin de semana. Comunidad familiar, admins activos y Discord con más de 3000 miembros.",
    ip: "play.hispacraft.net",
    discordUrl: "https://discord.gg/hispacraft",
    websiteUrl: "https://hispacraft.net",
    modded: false,
    maxPlayers: 200,
    totalVotes: 312,
  },
  {
    game: "MINECRAFT",
    name: "IbéricaSMP – Hardcore Rotativo",
    description: "Servidor hardcore con temporadas. Cada temporada dura hasta que muere el último superviviente o llegamos al End. La comunidad vota las reglas de cada temporada. Actualmente en T4. Config vanilla con datapack de death counter. Solo 10 plazas por temporada.",
    ip: "iberica-smp.es",
    discordUrl: "https://discord.gg/iberica-smp",
    websiteUrl: null,
    modded: false,
    maxPlayers: 10,
    totalVotes: 89,
  },
  {
    game: "MINECRAFT",
    name: "TierraCraft – Survival + Economía",
    description: "Servidor survival con economía de jugador, plots privados, clanes y eventos semanales. Jugamos en 1.21 con plugins de protección y economía. Nada de P2W, todo se consigue jugando. Lleva activo desde 2019 sin resetear el mapa.",
    ip: "play.tierracraft.es",
    discordUrl: "https://discord.gg/tierracraft",
    websiteUrl: "https://tierracraft.es",
    modded: false,
    maxPlayers: 100,
    totalVotes: 203,
  },
  {
    game: "MINECRAFT",
    name: "PixelBlocks ES – Create + Mekanism",
    description: "Servidor modded centrado en tecnología. Pack propio con Create, Mekanism, Applied Energistics 2 y Refined Storage. Actualizado a 1.20.1 con Forge. Tenemos wiki propia y canal de soporte técnico. Buscamos jugadores que quieran especializarse en una rama industrial.",
    ip: "pixelblocks.es:25566",
    discordUrl: "https://discord.gg/pixelblocks",
    websiteUrl: "https://pixelblocks.es",
    modded: true,
    modsNote: "Create, Mekanism, AE2, Refined Storage, Farmer's Delight, Immersive Engineering",
    maxPlayers: 30,
    totalVotes: 76,
  },
  {
    game: "MINECRAFT",
    name: "VanillaPlus Comunidad",
    description: "Survival vanilla con datapacks ligeros (xp botting, afk fish, armor statues). Mapa de 4 años sin reset. La gente ya tiene bases establecidas pero hay zonas vírgenes. Ambiente familiar, media de edad 20+. Sesiones libres, sin horario obligatorio.",
    ip: "vanillaplus.comunidad.es",
    discordUrl: "https://discord.gg/vanillaplus-es",
    websiteUrl: null,
    modded: false,
    maxPlayers: 25,
    totalVotes: 54,
  },
  {
    game: "MINECRAFT",
    name: "SkyBlock Hispano 2024",
    description: "Servidor de SkyBlock con progresión personalizada, isla cooperativa y mercado de jugadores. Versión 1.21. Actualizaciones constantes, equipo de desarrollo activo. Lleva 1 año y medio operativo. Modo isla solo o cooperativa hasta 4 jugadores.",
    ip: "sb.hispano-craft.com",
    discordUrl: "https://discord.gg/skyblock-hispano",
    websiteUrl: "https://hispano-craft.com",
    modded: false,
    maxPlayers: 150,
    totalVotes: 128,
  },
  {
    game: "MINECRAFT",
    name: "RoleMC – Roleplay Medieval",
    description: "Servidor de roleplay medieval con lore propio, razas, clases, sistema de reputación y eventos de GM. Plug-ins de RP custom. Mapa lore-friendly de 10.000x10.000. Buscamos jugadores comprometidos con el RP, no griefers ni trolls. Aplicación previa obligatoria.",
    ip: null,
    discordUrl: "https://discord.gg/rolemc-es",
    websiteUrl: "https://rolemc.es",
    modded: false,
    maxPlayers: 80,
    totalVotes: 167,
  },

  // ── Project Zomboid ──────────────────────────────────────────────────────────
  {
    game: "PROJECT_ZOMBOID",
    name: "Supervivientes ES – Roleplay",
    description: "Servidor de Project Zomboid con roleplay ligero. Cada jugador elige un personaje con trasfondo. Tenemos sistema de facciones, economía de trueque y eventos semanales de la administración. Config equilibrada (zombis normales, loot moderado). Llevamos 8 meses activos con el mismo mapa.",
    ip: "pz.supervivientes-es.com:16261",
    discordUrl: "https://discord.gg/supervivientes-es",
    websiteUrl: "https://supervivientes-es.com",
    modded: true,
    modsNote: "Brita's Weapon Pack, Authentic Z, ORGM, Hydrocraft, Braven's cars",
    maxPlayers: 32,
    totalVotes: 94,
  },
  {
    game: "PROJECT_ZOMBOID",
    name: "KnoxEvent_ES Hardcore",
    description: "Servidor PZ hardcore en español. Config difícil: zombis sprinters, loot escaso, permadeath real (si mueres, pierdes el personaje). Mapa lore fiel al canon del juego. Empezamos en los primeros días del brote. Sin mods que rompan el equilibrio. Buscamos jugadores que hayan sobrevivido más de un mes en singleplayer.",
    ip: "knox.pz-es.net:16261",
    discordUrl: "https://discord.gg/knoxevent-es",
    websiteUrl: null,
    modded: false,
    maxPlayers: 16,
    totalVotes: 61,
  },
  {
    game: "PROJECT_ZOMBOID",
    name: "ZomboidES – Servidor Casual",
    description: "Servidor PZ para jugar relajado. Config amigable para principiantes: zombis lentos, loot abundante, no permadeath. Ideal si acabas de comprar el juego y quieres aprender con gente. Admins que ayudan a los nuevos. Llevamos 2 años activos.",
    ip: "casual.zomboid-es.com:16261",
    discordUrl: "https://discord.gg/zomboides",
    websiteUrl: "https://zomboid-es.com",
    modded: false,
    maxPlayers: 20,
    totalVotes: 43,
  },
  {
    game: "PROJECT_ZOMBOID",
    name: "Muldraugh Survivors – RP Inmersivo",
    description: "RP inmersivo de alto nivel en Project Zomboid. Tenemos whitelist con entrevista previa. Sistema de narrativa dirigida por GMs, eventos de historia y consecuencias permanentes. Config custom con mods de inmersión. Solo jugadores que se toman el roleplay en serio.",
    ip: null,
    discordUrl: "https://discord.gg/muldraugh-rp",
    websiteUrl: "https://muldraugh-rp.es",
    modded: true,
    modsNote: "Authentic Z, Filibuster Rhymes Vehicles, ContraGun, Asmods, MoreBuildingMaterials",
    maxPlayers: 12,
    totalVotes: 112,
  },

  // ── League of Legends ────────────────────────────────────────────────────────
  {
    game: "LEAGUE_OF_LEGENDS",
    name: "LoL España Ranked Hub",
    description: "Comunidad española de League of Legends con más de 5000 miembros en Discord. Tenemos canales por rango (Iron a Master), búsqueda de duo, torneos mensuales, análisis de partidas y coaches voluntarios. Sin toxicidad, moderación activa. Todos los rangos son bienvenidos.",
    ip: null,
    discordUrl: "https://discord.gg/lol-espana",
    websiteUrl: null,
    modded: false,
    maxPlayers: null,
    totalVotes: 445,
  },
  {
    game: "LEAGUE_OF_LEGENDS",
    name: "Hispano League – Climb Together",
    description: "Comunidad para subir elo en español. Enfoque en mejorar: tenemos VOD reviews, sesiones de duo organizado por rango, y un canal de análisis post-partida. Silver a Diamante bienvenidos. Ambiente sano, críticas constructivas.",
    ip: null,
    discordUrl: "https://discord.gg/hispano-league",
    websiteUrl: null,
    modded: false,
    maxPlayers: null,
    totalVotes: 198,
  },
  {
    game: "LEAGUE_OF_LEGENDS",
    name: "Iberia Clash Team – 5v5",
    description: "Buscamos jugadores para equipos de Clash. Organizamos teams cada semana de Clash y hacemos scrim entre nosotros. Gold+ preferiblemente. Buscamos gente con disponibilidad los fines de semana (sábado por la tarde). Tenemos sistema de puntos interno.",
    ip: null,
    discordUrl: "https://discord.gg/iberia-clash",
    websiteUrl: null,
    modded: false,
    maxPlayers: null,
    totalVotes: 87,
  },
  {
    game: "LEAGUE_OF_LEGENDS",
    name: "Only ADC/Support ES",
    description: "Comunidad centrada en el bot lane en español. Análisis de la meta, matchups, tier lists actualizadas semanalmente y búsqueda de duo bot carril. También organizamos partidas donde todos juegan bot en distintos roles. Plata-Esmeralda principalmente.",
    ip: null,
    discordUrl: "https://discord.gg/only-botlane-es",
    websiteUrl: null,
    modded: false,
    maxPlayers: null,
    totalVotes: 134,
  },
  {
    game: "MINECRAFT",
    name: "Fractura – Anarquía Survival",
    description: "Servidor de anarquía española. Sin reglas (excepto no hacer crash del servidor). Mapa activo desde 2021. Las bases tienen más de 30.000 bloques del spawn. Comunidad de veteranos, no es para gente nueva. Si sabes lo que es la anarquía, eres bienvenido.",
    ip: "fractura.anarchy.gg",
    discordUrl: "https://discord.gg/fractura-mc",
    websiteUrl: null,
    modded: false,
    maxPlayers: 50,
    totalVotes: 256,
  },
  {
    game: "PROJECT_ZOMBOID",
    name: "PZ Sandbox ES – Config Personalizada",
    description: "Servidor PZ con config equilibrada y personalizable según votación de la comunidad cada mes. Actualmente: zombis 1.5x velocidad, loot algo escaso, día largo. Mods de vehículos y armas. Ambiente relajado con gente de 18+. Sesiones activas sobre todo por las noches.",
    ip: "sandbox.pz-hispano.es:16261",
    discordUrl: "https://discord.gg/pz-sandbox-es",
    websiteUrl: null,
    modded: true,
    modsNote: "Filibuster Rhymes, Brita's Weapon Pack, Hydrocraft lite, Vehicle Stories",
    maxPlayers: 24,
    totalVotes: 71,
  },
  {
    game: "MINECRAFT",
    name: "ModpackES – All The Mods 9",
    description: "Servidor ATM9 en español. Progresión por ramas (magia, tecnología, exploración). Cada jugador elige una especialización. Tenemos wiki en español para el pack. Whitelisted. Solicitud por Discord. Buscamos gente que quiera llegar al endgame del pack.",
    ip: "atm9.modpackes.com",
    discordUrl: "https://discord.gg/modpackes",
    websiteUrl: "https://modpackes.com",
    modded: true,
    modsNote: "All The Mods 9 (ATM9) — Forge 1.20.1",
    maxPlayers: 20,
    totalVotes: 99,
  },
  {
    game: "LEAGUE_OF_LEGENDS",
    name: "Bronze/Silver Escape Room",
    description: "Comunidad de rankeds para elo bajo. Nada de burlas, todo el mundo está intentando mejorar. Tenemos mentores voluntarios de plata-oro que revisan partidas y dan consejos. Si estás en Bronze o Silver y quieres salir con ayuda real, este es tu sitio.",
    ip: null,
    discordUrl: "https://discord.gg/escape-elo-es",
    websiteUrl: null,
    modded: false,
    maxPlayers: null,
    totalVotes: 176,
  },
];

async function main() {
  console.log(`Seeding ${SERVERS.length} game servers...`);

  // Use any demo user as creator
  const creator = await prisma.user.findFirst({
    where: { email: { endsWith: "@gamemate-demo.fake" } },
    select: { id: true },
  });

  if (!creator) {
    console.error("No demo users found. Run seed-demo.ts first.");
    process.exit(1);
  }

  let created = 0;
  for (const s of SERVERS) {
    await prisma.gameServer.create({
      data: {
        game: s.game as any,
        name: s.name,
        description: s.description,
        ip: s.ip ?? null,
        discordUrl: s.discordUrl,
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
    created++;
  }

  console.log(`\nCreated ${created} servers.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
