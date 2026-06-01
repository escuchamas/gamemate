import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_RULES } from "@/lib/constants";

export const dynamic = "force-dynamic";

const DEMO_EMAIL_DOMAIN = "@gamemate-demo.fake";

// ─── Franja horaria española (UTC+1, horario de invierno) ─────────────────────
// El cron corre en UTC. Calculamos la hora local española para determinar
// cuántas parties activas debe haber según la franja del día.
function spanishHour(): number {
  const now = new Date();
  const offset = 1; // UTC+1 (invierno); en verano sería 2, pero UTC+1 da una aproximación válida
  return (now.getUTCHours() + offset) % 24;
}

function targetActiveParties(): number {
  const h = spanishHour();
  // Madrugada 00-10 → poca actividad
  if (h >= 0 && h < 10) return randInt(6, 9);
  // Mañana 10-14 → actividad baja
  if (h >= 10 && h < 14) return randInt(9, 12);
  // Tarde 14-18 → actividad media
  if (h >= 14 && h < 18) return randInt(11, 14);
  // Prime time 18-24 → alta actividad
  return randInt(13, 16);
}

// ─── Pool de templates ─────────────────────────────────────────────────────────

const MINECRAFT_PARTIES = [
  { name: "Survival vanilla – mundo recién generado",       desc: "Empezamos desde cero. Granjas, exploración y base comunitaria. Sin mods, pura vanilla. Buscamos jugadores constantes.", skill: "INTERMEDIATE", max: 4, version: "JAVA",    modded: false },
  { name: "SMP estilo Hermitcraft – whitelist activo",      desc: "Servidor privado con normas tipo Hermitcraft. Builds épicas, economía de diamantes y eventos de comunidad. Mic recomendado.", skill: "ADVANCED",     max: 6, version: "JAVA",    modded: false },
  { name: "Hardcore permanente – llegar al dragón",         desc: "Si mueres, fuera. Objetivo: matar al Ender Dragon sin bajas. Buscamos gente con experiencia en hardcore.", skill: "EXPERT",       max: 3, version: "JAVA",    modded: false },
  { name: "SkyBlock desde cero – isla colaborativa",        desc: "Empezamos con el árbol y el bloque de arena. Nos organizamos por roles. Paciencia necesaria.", skill: "BEGINNER",     max: 4, version: "JAVA",    modded: false },
  { name: "Create mod – fábrica colaborativa",              desc: "Servidor con Create y sus addons. Queremos hacer una megafábrica automatizada. Conocimiento del mod es obligatorio.", skill: "ADVANCED",     max: 4, version: "JAVA",    modded: true  },
  { name: "Ciudad medieval – proyecto creativo",            desc: "Construcción a largo plazo de una ciudad medieval completa. Cada jugador gestiona un barrio. Todos los niveles bienvenidos.", skill: "BEGINNER",     max: 6, version: "JAVA",    modded: false },
  { name: "RLCraft – supervivencia extrema",                desc: "El modpack más difícil. Nada de quejarse si morís al minuto uno. Buscamos gente curtida.", skill: "EXPERT",       max: 3, version: "JAVA",    modded: true  },
  { name: "Vanilla 1.21 – activos mínimo 3 días/semana",   desc: "Mundo survival normal pero buscamos gente que juegue de verdad. Sin desaparecer a la semana.", skill: "INTERMEDIATE", max: 4, version: "JAVA",    modded: false },
  { name: "Bedrock con amigos – aventura relajada",         desc: "Partida en Bedrock para pasar el rato. Sin presión, sin metas concretas. Cualquier nivel.", skill: "BEGINNER",     max: 5, version: "BEDROCK", modded: false },
  { name: "Mods de magia – Botania y Astral Sorcery",       desc: "Pack centrado en magia: Botania, Astral Sorcery y Apotheosis. Queremos llegar al endgame mágico.", skill: "ADVANCED",     max: 4, version: "JAVA",    modded: true  },
  { name: "Nether update challenge – solo Nether",          desc: "Vivimos en el Nether. Sin salir hasta completar todos los logros del Nether. Reto puro.", skill: "ADVANCED",     max: 3, version: "JAVA",    modded: false },
  { name: "Pack ATM9 – busco gente organizada",             desc: "All The Mods 9. Nos dividimos las ramas de progresión. Buscamos alguien que lleve AE2 o RF.", skill: "EXPERT",       max: 4, version: "JAVA",    modded: true  },
  { name: "Creativo libre – sin restricciones",             desc: "Modo creativo, haz lo que quieras. Compartimos ideas y nos ayudamos con técnicas de construcción.", skill: "BEGINNER",     max: 8, version: "JAVA",    modded: false },
  { name: "Survival + datapack QoL – ritmo tranquilo",      desc: "Vanilla con datapacks de calidad de vida. Sin prisa, sin metas forzadas.", skill: "BEGINNER",     max: 5, version: "JAVA",    modded: false },
  { name: "Hardcore SMP – segunda temporada",               desc: "Segunda temporada de nuestro hardcore. Quedamos 2, buscamos 1-2 más.", skill: "EXPERT",       max: 4, version: "JAVA",    modded: false },
  { name: "Tekkit Classic – nostalgia total",               desc: "Sí, Tekkit Classic. Queremos revivir la experiencia de 2013. Reactores nucleares y cables BC.", skill: "INTERMEDIATE", max: 4, version: "JAVA",    modded: true  },
  { name: "Survival en servidor dedicado – 24/7",           desc: "Servidor propio, siempre encendido. Distintas zonas para cada jugador.", skill: "INTERMEDIATE", max: 6, version: "JAVA",    modded: false },
  { name: "Build challenge semanal",                        desc: "Cada semana un tema diferente para construir. Nos juntamos a votar y compartir.", skill: "BEGINNER",     max: 10,version: "JAVA",    modded: false },
  { name: "Servidor RPG – aventura personalizada",          desc: "Mapa de aventura con historia propia. Roles asignados (mago, guerrero, arquero). Mic obligatorio.", skill: "INTERMEDIATE", max: 4, version: "JAVA",    modded: true  },
  { name: "Speedrun cooperation – busco parcero",           desc: "Speedrun any% cooperativo. Nos dividimos los roles: uno caza, otro mina, otro busca el portal.", skill: "EXPERT",       max: 2, version: "JAVA",    modded: false },
  { name: "Minecraft diario – jugamos todas las tardes",    desc: "Grupo de gente que juega cada tarde. Buscamos una persona más para completar el equipo habitual.", skill: "INTERMEDIATE", max: 4, version: "JAVA",    modded: false },
  { name: "Void world – solo plataformas flotantes",        desc: "Mundo vacío, solo hay plataformas. Tenemos que conectarlas y crear un archipiélago volador.", skill: "INTERMEDIATE", max: 4, version: "JAVA",    modded: false },
  { name: "Mods industriales – IE + Mekanism",              desc: "Pack industrial. Queremos llegar al reactor de fusión de Mekanism.", skill: "EXPERT",       max: 4, version: "JAVA",    modded: true  },
  { name: "Factions PVP – busco aliados",                   desc: "Servidor de facciones con PVP activo. Mi facción somos 2, buscamos 2-3 más.", skill: "INTERMEDIATE", max: 5, version: "JAVA",    modded: false },
  { name: "Pack de supervivencia 1.20 – tranquilo",         desc: "Solo survival clásico con gente maja. Horario flexible.", skill: "BEGINNER",     max: 4, version: "JAVA",    modded: false },
  { name: "One-block challenge – todos en el mismo bloque", desc: "Empezamos en un solo bloque y lo vamos expandiendo. Trabajo en equipo imprescindible.", skill: "INTERMEDIATE", max: 4, version: "JAVA",    modded: true  },
  { name: "Modpack Vault Hunters – temporada 3",            desc: "Vault Hunters 3. Cada uno en su vault, compartimos la base exterior.", skill: "ADVANCED",     max: 4, version: "JAVA",    modded: true  },
  { name: "Survival ultrahard – una vida, cero ayuda",      desc: "UHC cooperativo. Una vida, sin regen natural. El objetivo es llegar a la Wither.", skill: "EXPERT",       max: 3, version: "JAVA",    modded: false },
  { name: "Minijuegos custom – BedWars casero",             desc: "Hacemos nuestro propio BedWars con comandos. Necesitamos gente para probar mapas nuevos.", skill: "BEGINNER",     max: 8, version: "JAVA",    modded: false },
  { name: "Servidor anarquía suavizado",                    desc: "Casi anarquía pero sin griefing en spawn. El resto es libre.", skill: "ADVANCED",     max: 8, version: "JAVA",    modded: false },
  { name: "Minecraft familiar – tarde del sábado",          desc: "Partida familiar, sin agresividad ni PVP. Construimos juntos. Menores bienvenidos.", skill: "BEGINNER",     max: 5, version: "BEDROCK", modded: false },
  { name: "SMP con roles asignados – explorador/minero",    desc: "Cada jugador tiene un rol fijo (constructor, minero, cocinero...). Coordinación total.", skill: "INTERMEDIATE", max: 5, version: "JAVA",    modded: false },
  { name: "Pack Enigmatica 6 – busco equipo",               desc: "Enigmatica 6 con progresión por quest. Buscamos gente que conozca el pack.", skill: "ADVANCED",     max: 4, version: "JAVA",    modded: true  },
  { name: "Reto sin morir de hambre",                       desc: "Solo podemos comer lo que cultivamos nosotros mismos. ¿Llegamos al dragón?", skill: "ADVANCED",     max: 3, version: "JAVA",    modded: false },
];

const LOL_PARTIES = [
  { name: "Subir a Platino – duo carril y apoyo",      desc: "Gold II buscamos ADC o Support serio para subir a Plat. Buen ambiente, sin flaming.", skill: "ADVANCED",     max: 5, roles: ["ADC","SUPPORT"],         rankMin: "GOLD",     rankMax: "PLATINUM"  },
  { name: "Flex relajado – buen rollo ante todo",      desc: "Partidas de flex sin presión. Lo importante es pasarlo bien. Cualquier rol.", skill: "BEGINNER",     max: 5, roles: ["TOP","JUNGLE","MID","ADC","SUPPORT"], rankMin: "SILVER", rankMax: "GOLD" },
  { name: "Premade ARAM 5v5 – cachondeo puro",         desc: "ARAM en premade. Combos absurdos, comps imposibles, risas garantizadas.", skill: "BEGINNER",     max: 5, roles: [],                        rankMin: "BRONZE",   rankMax: "GOLD"      },
  { name: "Tryouts jungla para subir de Plata",        desc: "Silver III, necesito jungle main que sepa hacer objetivos. Soy top con muñeco propio.", skill: "BEGINNER",     max: 2, roles: ["JUNGLE"],                rankMin: "SILVER",   rankMax: "GOLD"      },
  { name: "Ranked 5v5 – busco mid y jungle",           desc: "Tenemos top, ADC y support. Buscamos mid y jungla activos.", skill: "INTERMEDIATE", max: 5, roles: ["MID","JUNGLE"],           rankMin: "GOLD",     rankMax: "EMERALD"   },
  { name: "Duos para Diamante – top + jungle",         desc: "Dos top mains buscando jungle y mid para push a Diamante. Discord activo.", skill: "ADVANCED",     max: 4, roles: ["JUNGLE","MID"],           rankMin: "PLATINUM", rankMax: "DIAMOND"   },
  { name: "Normals para practicar nuevos muñecos",     desc: "Solo normals para probar champs sin presión. Cualquier rank.", skill: "BEGINNER",     max: 5, roles: ["TOP","JUNGLE","MID","ADC","SUPPORT"], rankMin: "IRON", rankMax: "GOLD" },
  { name: "Support main buscando ADC estable",         desc: "Support Gold IV buscando ADC para duo carril. Estilo pasivo-agresivo.", skill: "INTERMEDIATE", max: 2, roles: ["ADC"],                    rankMin: "SILVER",   rankMax: "GOLD"      },
  { name: "Jungle diff – busco mid que snowbolee",     desc: "Jungla de objetivos busca mid que sepa cerrar partidas. Plat+.", skill: "INTERMEDIATE", max: 2, roles: ["MID"],                    rankMin: "PLATINUM", rankMax: "EMERALD"   },
  { name: "Tardes de ranked – grupo de 3-5",           desc: "Grupo para jugar por las tardes. Sin presión pero con ganas de mejorar.", skill: "BEGINNER",     max: 5, roles: ["TOP","JUNGLE","MID","ADC","SUPPORT"], rankMin: "SILVER", rankMax: "GOLD" },
  { name: "Clash team – busco dos guerreros",          desc: "Tenemos top, jungla y mid. Buscamos ADC y support para Clash.", skill: "INTERMEDIATE", max: 5, roles: ["ADC","SUPPORT"],         rankMin: "GOLD",     rankMax: "PLATINUM"  },
  { name: "ADC main – busco support que aguante",      desc: "ADC Plat I harto de supports que abandonan. Busco alguien constante.", skill: "INTERMEDIATE", max: 2, roles: ["SUPPORT"],               rankMin: "GOLD",     rankMax: "EMERALD"   },
  { name: "Ranked flex nocturno – horario 22h+",       desc: "Jugamos de noche, 22:00 a 01:00. Buscamos gente con ese horario.", skill: "BEGINNER",     max: 5, roles: ["TOP","JUNGLE","MID","ADC","SUPPORT"], rankMin: "SILVER", rankMax: "PLATINUM" },
  { name: "Master+ – buscando 5to para premade",       desc: "Cuatro jugadores Master buscando 5to. Mínimo Diamante.", skill: "EXPERT",       max: 5, roles: ["FILL"],                  rankMin: "DIAMOND",  rankMax: "MASTER"    },
  { name: "Silver promos – busco duo motivado",        desc: "Silver I en promos a Gold. Quiero duo también en promos. Cualquier rol.", skill: "BEGINNER",     max: 2, roles: ["FILL"],                  rankMin: "SILVER",   rankMax: "GOLD"      },
  { name: "Jungle/support – macrotraining",            desc: "Queremos mejorar el macro. Análisis de partidas + práctica. Plat-Emerald.", skill: "ADVANCED",     max: 2, roles: ["JUNGLE","SUPPORT"],       rankMin: "PLATINUM", rankMax: "EMERALD"   },
  { name: "Partidas de normals – sin presión",         desc: "Nada de ranked, solo normals para desconectar. Cualquier rank.", skill: "BEGINNER",     max: 5, roles: ["FILL"],                  rankMin: "IRON",     rankMax: "CHALLENGER"},
  { name: "Ranked – formamos equipo serio",            desc: "Buscamos personas comprometidas. Objetivo: Esmeralda antes de fin de temporada.", skill: "INTERMEDIATE", max: 5, roles: ["TOP","JUNGLE","MID","ADC","SUPPORT"], rankMin: "GOLD", rankMax: "EMERALD" },
  { name: "Plata maldita – necesito salir ya",         desc: "Llevo 3 temporadas en Silver. Este año sí. Busco duo paciente.", skill: "BEGINNER",     max: 2, roles: ["FILL"],                  rankMin: "SILVER",   rankMax: "GOLD"      },
  { name: "Jungle main buscando top",                  desc: "Cambio camps de jungle a cambio de consejos de cómo splitpushear.", skill: "INTERMEDIATE", max: 2, roles: ["TOP"],                   rankMin: "SILVER",   rankMax: "PLATINUM"  },
  { name: "Ranked intensivo – finde largo",            desc: "Tenemos el fin de semana libre. Buscamos gente con disponibilidad similar.", skill: "INTERMEDIATE", max: 5, roles: ["FILL"],                  rankMin: "GOLD",     rankMax: "EMERALD"   },
  { name: "Soloq duo – comunicación es clave",         desc: "Busco duo que llame antes de hacer algo. Mid o jungla.", skill: "INTERMEDIATE", max: 2, roles: ["MID","JUNGLE"],           rankMin: "GOLD",     rankMax: "PLATINUM"  },
  { name: "Emerald climb – buscamos top lane",         desc: "Somos tres Emerald subiendo juntos. Falta un top.", skill: "ADVANCED",     max: 4, roles: ["TOP"],                   rankMin: "PLATINUM", rankMax: "EMERALD"   },
  { name: "ARAM para calentar – luego ranked",         desc: "2-3 ARAM para calentar y luego ranked. ¿Te apuntas?", skill: "BEGINNER",     max: 5, roles: ["FILL"],                  rankMin: "SILVER",   rankMax: "GOLD"      },
  { name: "Top lane diff – ¿maineas Darius?",          desc: "Buscamos top con Darius/Garen/Malphite para comp de frontline.", skill: "INTERMEDIATE", max: 2, roles: ["TOP"],                   rankMin: "SILVER",   rankMax: "PLATINUM"  },
  { name: "Five premade – busco el quinto",            desc: "Somos cuatro amigos que jugamos juntos. Buscamos el quinto estable.", skill: "BEGINNER",     max: 5, roles: ["FILL"],                  rankMin: "SILVER",   rankMax: "GOLD"      },
  { name: "ADC + support – bot diff prometido",        desc: "Duo bot que quiere destrozar la bot lane rival. Comunicacion constante.", skill: "INTERMEDIATE", max: 2, roles: ["ADC","SUPPORT"],         rankMin: "GOLD",     rankMax: "PLATINUM"  },
  { name: "Ranked serio – no buscamos challengers",    desc: "Gente normal con ganas de subir. Sin ego, con actitud. Plata-Oro.", skill: "BEGINNER",     max: 5, roles: ["FILL"],                  rankMin: "SILVER",   rankMax: "GOLD"      },
  { name: "Jungle main – busco gente que pingue",      desc: "Solo quiero un equipo que pingue cuando sigo el objetivo. Es poco pedir.", skill: "INTERMEDIATE", max: 5, roles: ["TOP","MID","ADC","SUPPORT"], rankMin: "GOLD", rankMax: "EMERALD" },
  { name: "Pre-season ranked – últimos empujones",     desc: "Aprovechamos antes del reset. Subamos lo más posible.", skill: "INTERMEDIATE", max: 5, roles: ["FILL"],                  rankMin: "GOLD",     rankMax: "PLATINUM"  },
  { name: "Support encantado con el ADC correcto",     desc: "Support que escala bien busca ADC que sepa aprovechar los setups.", skill: "ADVANCED",     max: 2, roles: ["ADC"],                   rankMin: "PLATINUM", rankMax: "DIAMOND"   },
  { name: "Chill ranked – sin presión, con cabeza",    desc: "Queremos ganar pero sin dramas. Buen ambiente, críticas constructivas.", skill: "INTERMEDIATE", max: 5, roles: ["FILL"],                  rankMin: "SILVER",   rankMax: "PLATINUM"  },
  { name: "Mid main busca jungle para sinergias",      desc: "Mid que lleva assassins busca jungle que haga early ganks. Vamos a snowbolear.", skill: "ADVANCED",     max: 2, roles: ["JUNGLE"],                rankMin: "PLATINUM", rankMax: "EMERALD"   },
];

const PZ_PARTIES = [
  { name: "Roleplay PZ – Supervivientes de Muldraugh",  desc: "Roleplay ligero. Cada uno elige un rol: médico, mecánico... Base compartida sin metagaming.", skill: "INTERMEDIATE", max: 4, modded: true  },
  { name: "Apocalipsis – configuración extrema",         desc: "Max dificultad: zombis rápidos, sprinters nocturnos, loot escaso. 30 días mínimos de experiencia.", skill: "EXPERT",       max: 4, modded: false },
  { name: "PZ casual – aprender juntos",                 desc: "Nuevos en Project Zomboid que queremos aprender. Sin presión, con paciencia.", skill: "BEGINNER",     max: 4, modded: false },
  { name: "Supervivencia largo plazo – sin reset",       desc: "Queremos un servidor que dure meses. Jugadores comprometidos, sin abandonar a la semana.", skill: "ADVANCED",     max: 6, modded: false },
  { name: "Reto 100 días – misma run",                   desc: "Llegar a los 100 días sin morir nadie. Config media. Grabamos para YouTube.", skill: "INTERMEDIATE", max: 4, modded: false },
  { name: "Mods de calidad de vida + lore-friendly",     desc: "Mods que mejoran la experiencia sin romper el equilibrio.", skill: "INTERMEDIATE", max: 4, modded: true  },
  { name: "Base costera – estilo The Walking Dead",      desc: "Buscamos una mansión frente al mar. Agricultura, pesca y gestión de recursos.", skill: "INTERMEDIATE", max: 4, modded: false },
  { name: "PZ Hardcore – settings de máximo dolor",      desc: "Permadeath estricto, zombis sprinters, apagón desde el día 1.", skill: "EXPERT",       max: 3, modded: false },
  { name: "Base underground – túneles y bunkers",        desc: "Construimos todo bajo tierra. Entradas camufladas, generador oculto.", skill: "ADVANCED",     max: 4, modded: false },
  { name: "Sobrevivir el primer mes – misión básica",    desc: "Objetivo: sobrevivir 30 días todos juntos. Config vanilla normal.", skill: "BEGINNER",     max: 4, modded: false },
  { name: "PZ + mods de armas – full militar",           desc: "Arsenal completo de mods militares. Queremos limpiar Louisville.", skill: "ADVANCED",     max: 4, modded: true  },
  { name: "Farming-only challenge",                      desc: "Reto: sobrevivir solo con lo que cultivamos. Sin loot de tiendas ni casas.", skill: "ADVANCED",     max: 3, modded: false },
  { name: "PZ RPG – servidor con lore propio",           desc: "Historia de fondo propia. Cada jugador es un personaje con backstory. Discord activo.", skill: "INTERMEDIATE", max: 5, modded: true  },
  { name: "Aprender mecánicas de vehículos",             desc: "Sesión para aprender a reparar coches y camiones correctamente.", skill: "BEGINNER",     max: 4, modded: false },
  { name: "Survivor group – Riverside run",              desc: "Empezamos en Riverside. Roles organizados y vamos ciudad a ciudad.", skill: "INTERMEDIATE", max: 4, modded: false },
  { name: "Infection roleplay – ¿quién está infectado?", desc: "Todos podemos estar infectados. Tensión social máxima. Reglas propias.", skill: "ADVANCED",     max: 5, modded: false },
  { name: "PZ sin mods – vanilla puro",                  desc: "Solo jugamos vanilla. Zomboid como fue pensado.", skill: "INTERMEDIATE", max: 4, modded: false },
  { name: "Reto sin electricidad – apagón permanente",   desc: "Empezamos con el apagón en el día 1. Sin electricidad en toda la run.", skill: "ADVANCED",     max: 3, modded: false },
  { name: "PZ fines de semana – grupo estable",          desc: "Nos juntamos los fines de semana para avanzar la run. Buscamos el cuarto miembro.", skill: "BEGINNER",     max: 4, modded: false },
  { name: "Louisville endgame – limpiar la ciudad",      desc: "Tenemos base establecida y queremos ir a limpiar Louisville.", skill: "EXPERT",       max: 4, modded: false },
  { name: "PZ + mods de animales y granja ampliada",     desc: "Mods de granjas ampliadas. Queremos un rancho autosuficiente.", skill: "INTERMEDIATE", max: 4, modded: true  },
  { name: "Supervivencia en el bosque – off-grid",       desc: "Nada de ciudades. Nos instalamos en el bosque y vivimos de la naturaleza.", skill: "INTERMEDIATE", max: 4, modded: false },
  { name: "PZ beginner friendly – explicamos todo",      desc: "Si acabas de comprar el juego, este es tu sitio. Te explicamos mecánicas.", skill: "BEGINNER",     max: 4, modded: false },
  { name: "Reto: solo cuerpo a cuerpo",                  desc: "Sin armas de fuego en toda la run. Solo cuerpo a cuerpo y sigilo.", skill: "ADVANCED",     max: 3, modded: false },
  { name: "Coop diario – sesiones de 1-2 horas",        desc: "Jugamos 1-2 horas cada día. Buscamos alguien con disponibilidad similar.", skill: "BEGINNER",     max: 3, modded: false },
  { name: "Pandemia – mod de enfermedades reales",       desc: "Mod que añade enfermedades. Hay que curar, vacunar y evitar contagios.", skill: "ADVANCED",     max: 4, modded: true  },
  { name: "Knox event – primeros días del brote",        desc: "Recreamos los primeros días del brote. Empezamos el día 1 de la cuarentena.", skill: "INTERMEDIATE", max: 4, modded: true  },
  { name: "PZ largo plazo – temporada 2 de nuestro SMP",desc: "Segunda temporada. Quedamos 3, buscamos 1-2 más. Primera sesión el sábado.", skill: "ADVANCED",     max: 5, modded: false },
  { name: "PZ config media – supervivencia realista",    desc: "Config equilibrada entre realismo y diversión. Sin sprinters, pero zombis en abundancia.", skill: "INTERMEDIATE", max: 4, modded: false },
  { name: "Nomadas – nunca quedamos en el mismo sitio",  desc: "Reto nómada: nunca pasamos más de 3 días en la misma base. Siempre en movimiento.", skill: "ADVANCED",     max: 3, modded: false },
  { name: "PZ noches de viernes – quedada semanal",      desc: "Cada viernes por la noche. Llevamos dos meses así y buscamos un cuarto fijo.", skill: "INTERMEDIATE", max: 4, modded: false },
  { name: "PZ con narrador – historia comentada",        desc: "Alguien narra lo que va pasando en Discord mientras jugamos. Roleplaying en voz.", skill: "INTERMEDIATE", max: 5, modded: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const demoUsers = await prisma.user.findMany({
    where: { email: { endsWith: DEMO_EMAIL_DOMAIN } },
    select: { id: true },
  });
  if (demoUsers.length === 0) {
    return NextResponse.json({ error: "No demo users found." }, { status: 400 });
  }

  const log: string[] = [];

  // ── 1. Avanzar ciclo de vida de parties existentes ───────────────────────────

  const allDemoParties = await prisma.party.findMany({
    where: { creator: { email: { endsWith: DEMO_EMAIL_DOMAIN } } },
    select: {
      id: true, status: true, maxPlayers: true, createdAt: true,
      _count: { select: { members: true } },
    },
  });

  const now = Date.now();
  const ageH = (p: { createdAt: Date }) => (now - p.createdAt.getTime()) / 3_600_000;

  // Parties CLOSED → delete (llevan cerradas suficiente tiempo)
  const toDelete = allDemoParties
    .filter(p => p.status === "CLOSED" && ageH(p) > 16)
    .map(p => p.id);
  if (toDelete.length) {
    await prisma.party.deleteMany({ where: { id: { in: toDelete } } });
    log.push(`Deleted ${toDelete.length} CLOSED parties`);
  }

  // Parties IN_GAME de >3h → CLOSED (la partida terminó)
  const toClose = allDemoParties
    .filter(p => p.status === "IN_GAME" && ageH(p) > 3 && Math.random() < 0.6)
    .map(p => p.id);
  if (toClose.length) {
    await prisma.party.updateMany({ where: { id: { in: toClose } }, data: { status: "CLOSED" } });
    log.push(`Closed ${toClose.length} IN_GAME parties`);
  }

  // Parties FULL de >1h → IN_GAME (empezaron a jugar)
  const toInGame = allDemoParties
    .filter(p => p.status === "FULL" && ageH(p) > 1 && Math.random() < 0.7)
    .map(p => p.id);
  if (toInGame.length) {
    await prisma.party.updateMany({ where: { id: { in: toInGame } }, data: { status: "IN_GAME" } });
    log.push(`${toInGame.length} parties now IN_GAME`);
  }

  // Parties OPEN cuyo memberCount llegó a maxPlayers → FULL
  const toFull = allDemoParties
    .filter(p => p.status === "OPEN" && p._count.members >= p.maxPlayers)
    .map(p => p.id);
  if (toFull.length) {
    await prisma.party.updateMany({ where: { id: { in: toFull } }, data: { status: "FULL" } });
    log.push(`${toFull.length} parties now FULL`);
  }

  // ── 2. Añadir miembros a parties OPEN con huecos (simula gente uniéndose) ────
  const openWithSlots = allDemoParties.filter(
    p => p.status === "OPEN" && p._count.members < p.maxPlayers,
  );
  let membersAdded = 0;
  for (const party of openWithSlots) {
    // Probabilidad de que alguien se una: mayor si la party tiene >2h
    const joinChance = ageH(party) > 2 ? 0.5 : 0.25;
    if (Math.random() < joinChance) {
      const existingIds = (
        await prisma.partyMember.findMany({ where: { partyId: party.id }, select: { userId: true } })
      ).map(m => m.userId);
      const candidates = demoUsers.filter(u => !existingIds.includes(u.id));
      if (candidates.length > 0) {
        const newMember = pick(candidates);
        await prisma.partyMember.create({
          data: { partyId: party.id, userId: newMember.id, role: "MEMBER" },
        });
        membersAdded++;
      }
    }
  }
  if (membersAdded) log.push(`Added ${membersAdded} members to open parties`);

  // ── 3. Crear nuevas parties OPEN según demanda horaria ────────────────────────
  const openCount = allDemoParties.filter(p => p.status === "OPEN").length
    - toFull.length           // las que se acaban de cerrar
    + 0;                      // las recién creadas aún no existen
  const target = targetActiveParties();
  const toCreate = Math.max(0, target - openCount);

  const allTemplates = [
    ...MINECRAFT_PARTIES.map(t => ({ ...t, game: "MINECRAFT" as const })),
    ...LOL_PARTIES.map(t => ({ ...t, game: "LEAGUE_OF_LEGENDS" as const })),
    ...PZ_PARTIES.map(t => ({ ...t, game: "PROJECT_ZOMBOID" as const })),
  ];

  const created: string[] = [];
  for (let i = 0; i < toCreate; i++) {
    const tpl = pick(allTemplates);
    const creator = pick(demoUsers);
    // Las parties nuevas empiezan con solo 1-2 miembros (más realista)
    const initialMembers = randInt(1, Math.min(2, (tpl.max ?? 4) - 1));

    // Normas: todas las obligatorias + 2-3 opcionales al azar
    const gameKey = tpl.game as keyof typeof DEFAULT_RULES;
    const rulePool = DEFAULT_RULES[gameKey] ?? DEFAULT_RULES.OTHER;
    const requiredRules = rulePool.filter(r => r.isRequired);
    const optionalRules = shuffle(rulePool.filter(r => !r.isRequired)).slice(0, randInt(2, 3));
    const rulesToCreate = [...requiredRules, ...optionalRules].map(r => ({
      category: r.category,
      text: r.text,
      isDefault: true,
      isRequired: r.isRequired,
    }));

    const party = await prisma.party.create({
      data: {
        name: tpl.name,
        description: tpl.desc,
        game: tpl.game,
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
        rules: { create: rulesToCreate },
        members: {
          create: [
            { userId: creator.id, role: "LEADER" },
            ...shuffle(demoUsers.filter(u => u.id !== creator.id))
              .slice(0, initialMembers - 1)
              .map(u => ({ userId: u.id, role: "MEMBER" as const })),
          ],
        },
      },
    });
    created.push(party.id);
  }
  if (created.length) log.push(`Created ${created.length} new parties (target: ${target}, was: ${openCount})`);

  return NextResponse.json({
    hour_es: spanishHour(),
    target,
    summary: log,
  });
}
