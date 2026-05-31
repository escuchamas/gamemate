export const GAME_LABELS = {
  MINECRAFT: "Minecraft",
  PROJECT_ZOMBOID: "Project Zomboid",
} as const;

export const GAME_ICONS = {
  MINECRAFT: "⛏️",
  PROJECT_ZOMBOID: "🧟",
} as const;

export const SKILL_LABELS = {
  BEGINNER: "Principiante",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzado",
  EXPERT: "Experto",
} as const;

export const SKILL_DESCRIPTIONS = {
  MINECRAFT: {
    BEGINNER: "Nuevo en el juego, aprendiendo mecánicas básicas",
    INTERMEDIATE: "Conozco lo básico, trabajando hacia el Ender Dragon",
    ADVANCED: "He acabado el juego varias veces, manejo la automatización",
    EXPERT: "Domino todo, builds técnicas, redstone avanzado",
  },
  PROJECT_ZOMBOID: {
    BEGINNER: "Muero en los primeros días",
    INTERMEDIATE: "Sobrevivo semanas, construyo bases simples",
    ADVANCED: "Superviviente de meses, gestión avanzada de recursos",
    EXPERT: "Domino todas las mecánicas, builds duraderas",
  },
} as const;

export const SKILL_CRITERIA = {
  MINECRAFT: {
    BEGINNER: "Acabas de empezar. Aún aprendes a craftear y a sobrevivir la primera noche. No has conseguido herramientas de hierro.",
    INTERMEDIATE: "Sabes craftear herramientas y armadura de hierro, conoces los mobs principales y te manejas con soltura en cuevas y superficie.",
    ADVANCED: "Has llegado al Nether, tienes equipo de diamante o netherite, construyes granjas básicas y conoces redstone elemental.",
    EXPERT: "Has derrotado al Dragón del End, dominas redstone avanzado, granjas automatizadas o juegas en hardcore/speedrun.",
  },
  PROJECT_ZOMBOID: {
    BEGINNER: "Acabas de empezar. Mueres en los primeros días, aún aprendes sigilo, gestión de heridas e inventario.",
    INTERMEDIATE: "Sobrevives la primera semana, sabes construir una base segura, conducir y gestionar el inventario con eficiencia.",
    ADVANCED: "Runs de más de un mes, bases fortificadas con generador, dominas vehículos, loot eficiente y gestión de grupos.",
    EXPERT: "Superviviente veterano. Conoces todos los sistemas del juego, juegas con dificultad alta, mods de challenge o llevas el servidor.",
  },
} as const;

export const POPULAR_MODPACKS = {
  MINECRAFT: [
    "RLCraft",
    "All the Mods 9",
    "Vault Hunters",
    "SkyFactory 4",
    "Better Minecraft",
    "Create: Above and Beyond",
    "Valhelsia 6",
    "Roguelike Adventures and Dungeons",
    "Stoneblock 3",
    "Pixelmon",
    "FTB Academy",
    "Enigmatica 9",
    "Farming Valley",
    "Dungeons Dragons Space Shuttles",
    "Tekkit 2",
    "FTB Revelation",
  ],
  PROJECT_ZOMBOID: [
    "Brita's Weapon Pack",
    "More Traits",
    "Hydrocraft",
    "ORGM Rechambered",
    "Superb Survivors",
    "Filibuster Rhymes' Used Cars",
    "Bedford Falls",
    "Raven Creek",
  ],
} as const;

export const MINECRAFT_STYLE_LABELS = {
  SURVIVAL: "Supervivencia",
  HARDCORE: "Hardcore",
  CREATIVE: "Creativo",
  ADVENTURE: "Aventura",
} as const;

export const PZ_STYLE_LABELS = {
  CASUAL: "Casual",
  ROLEPLAY: "Roleplay",
  HARDCORE: "Hardcore",
  CHALLENGE: "Challenge",
} as const;

export const PARTY_STATUS_LABELS = {
  OPEN: "Abierta",
  FULL: "Llena",
  IN_GAME: "En partida",
  CLOSED: "Cerrada",
} as const;

export const RULE_CATEGORY_LABELS = {
  BEHAVIOR: "Comportamiento",
  GAMEPLAY: "Juego",
  COMMUNICATION: "Comunicación",
  CUSTOM: "Personalizada",
} as const;

// Reglas predeterminadas por juego y categoría
export const DEFAULT_RULES = {
  MINECRAFT: [
    {
      category: "BEHAVIOR" as const,
      text: "No griefear las construcciones de otros jugadores",
      isRequired: true,
    },
    {
      category: "BEHAVIOR" as const,
      text: "No robar de los cofres de otros jugadores sin permiso",
      isRequired: true,
    },
    {
      category: "BEHAVIOR" as const,
      text: "Tratar a todos los jugadores con respeto",
      isRequired: true,
    },
    {
      category: "GAMEPLAY" as const,
      text: "Respetar la dificultad acordada al crear la partida",
      isRequired: false,
    },
    {
      category: "GAMEPLAY" as const,
      text: "No usar exploits ni trampas que rompan el juego",
      isRequired: false,
    },
    {
      category: "GAMEPLAY" as const,
      text: "Comunicar antes de hacer cambios grandes en el mundo",
      isRequired: false,
    },
    {
      category: "GAMEPLAY" as const,
      text: "Avanzar al mismo ritmo, sin rushear el final del juego",
      isRequired: false,
    },
    {
      category: "GAMEPLAY" as const,
      text: "Acordar el modpack antes de unirse",
      isRequired: false,
    },
    {
      category: "COMMUNICATION" as const,
      text: "Avisar con antelación si no puedes conectarte",
      isRequired: false,
    },
    {
      category: "COMMUNICATION" as const,
      text: "Estar disponible en el canal de comunicación del grupo",
      isRequired: false,
    },
  ],
  PROJECT_ZOMBOID: [
    {
      category: "BEHAVIOR" as const,
      text: "No matar a otros jugadores (PvP desactivado salvo acuerdo)",
      isRequired: true,
    },
    {
      category: "BEHAVIOR" as const,
      text: "No saquear la base o refugio de otros jugadores",
      isRequired: true,
    },
    {
      category: "BEHAVIOR" as const,
      text: "Tratar a todos los jugadores con respeto",
      isRequired: true,
    },
    {
      category: "GAMEPLAY" as const,
      text: "Acordar los mods antes de iniciar el servidor",
      isRequired: false,
    },
    {
      category: "GAMEPLAY" as const,
      text: "No hacer meta-gaming (usar info externa al juego)",
      isRequired: false,
    },
    {
      category: "GAMEPLAY" as const,
      text: "Compartir recursos cuando sea posible",
      isRequired: false,
    },
    {
      category: "GAMEPLAY" as const,
      text: "No explorar zonas peligrosas sin avisar al grupo",
      isRequired: false,
    },
    {
      category: "COMMUNICATION" as const,
      text: "Avisar antes de abandonar el servidor de forma permanente",
      isRequired: false,
    },
    {
      category: "COMMUNICATION" as const,
      text: "Usar el canal de voz o texto acordado para coordinar",
      isRequired: false,
    },
  ],
} as const;

// Etiquetas de jugador por juego
export const PLAYER_TAGS = {
  MINECRAFT: [
    "Exploración",
    "Construcción",
    "Farms",
    "Redstone",
    "Builds técnicas",
    "PvP",
    "Roleplay",
    "Sin metas fijas",
    "Historia / lore",
    "Mods",
    "Vanilla puro",
    "Speedrun",
    "Comercio",
    "Calabozos",
  ],
  PROJECT_ZOMBOID: [
    "Base building",
    "Roleplay",
    "Lore-friendly",
    "Sin voz",
    "Cooperación",
    "Supervivencia a largo plazo",
    "PvP off",
    "PvP on",
    "Farming",
    "Mecánica de vehículos",
    "Exploración urbana",
    "Hardcore",
    "Casual",
    "Mods",
  ],
} as const;

// Badges verificados por la comunidad
export const BADGE_INFO = {
  BUILDER_PRO: {
    emoji: "🏗️",
    label: "Builder Pro",
    description: "Construye cosas que te dejan con la boca abierta",
    game: "MINECRAFT" as const,
    threshold: 15,
  },
  REDSTONE_MASTER: {
    emoji: "⚡",
    label: "Redstone Master",
    description: "El tipo que hace que la redstone parezca magia",
    game: "MINECRAFT" as const,
    threshold: 15,
  },
  EXPLORER: {
    emoji: "🗺️",
    label: "Gran Explorador",
    description: "Ha visto cada bioma, cada dimensión, cada secreto",
    game: "MINECRAFT" as const,
    threshold: 15,
  },
  TRUE_SURVIVOR: {
    emoji: "💀",
    label: "True Survivor",
    description: "Superviviente de largo plazo. Los zombis le tienen miedo",
    game: "PROJECT_ZOMBOID" as const,
    threshold: 15,
  },
  MECHANIC_EXPERT: {
    emoji: "🔧",
    label: "Mecánico Experto",
    description: "Arregla cualquier vehículo con piezas de basura",
    game: "PROJECT_ZOMBOID" as const,
    threshold: 15,
  },
  FARMER: {
    emoji: "🌾",
    label: "Farmer Supremo",
    description: "Su base tiene más comida que el apocalipsis puede destruir",
    game: "PROJECT_ZOMBOID" as const,
    threshold: 15,
  },
  TEAM_PLAYER: {
    emoji: "🤝",
    label: "Team Player",
    description: "Siempre colabora, nunca abandona al equipo",
    game: null,
    threshold: 15,
  },
  MENTOR: {
    emoji: "📚",
    label: "Mentor",
    description: "Enseña sin spoilers ni aires de superioridad",
    game: null,
    threshold: 15,
  },
  CHILL_VIBES: {
    emoji: "😎",
    label: "Chill Vibes",
    description: "0 toxicidad, 100% buena onda. El compañero ideal",
    game: null,
    threshold: 15,
    staffVerified: false as const,
  },
  ARCHITECT: {
    emoji: "🏛️",
    label: "Arquitecto Verificado",
    description: "Constructor profesional validado por el staff. Portfolio revisado.",
    game: "MINECRAFT" as const,
    threshold: 0,
    staffVerified: true as const,
    price: 19.99,
  },
} as const;

// Requisitos mínimos para solicitar el badge ARCHITECT
export const ARCHITECT_REQUIREMENTS = {
  minProjects: 3,
  priceEuros: 19.99,
  // Descripción de lo que se considera nivel suficiente
  levelExamples: [
    {
      level: "NO suficiente ❌",
      description: "Una casa de madera, un castillo simple copiado de tutoriales, o cualquier construcción sin detalle estructural ni cohesión estética.",
      examples: ["Casa de madera 10x10", "Cueva decorada básica", "Círculo de piedra"],
    },
    {
      level: "En el límite ⚠️",
      description: "Construcciones con algo de detalle pero que parecen producto de seguir un tutorial paso a paso. Falta creatividad propia o coherencia de estilo.",
      examples: ["Aldea medieval básica", "Torre de mago con plantilla", "Mansión con worldedit sin personalización"],
    },
    {
      level: "SÍ suficiente ✅",
      description: "Proyectos originales con identidad propia, uso de paletas de bloques, profundidad visual, proporciones correctas y al menos 1 megabuild o proyecto de escala grande.",
      examples: [
        "Ciudad medieval con calles, mercado y detalles interiores",
        "Mapa de aventuras con historia y construcciones temáticas",
        "Recreación arquitectónica real con escala y precisión",
        "Proyecto de fantasy con 3+ edificios únicos conectados",
      ],
    },
  ],
} as const;

export const RATING_CRITERIA_LABELS = {
  levelMatch: "Nivel declarado",
  friendliness: "Simpatía",
  funFactor: "Diversión",
  reliability: "Responsabilidad",
} as const;

export const RATING_CRITERIA_DESCRIPTIONS = {
  levelMatch: "¿Su nivel coincidía con lo que declaró?",
  friendliness: "¿Fue amable y respetuoso contigo?",
  funFactor: "¿Fue divertido jugar con él/ella?",
  reliability: "¿Fue constante y avisó si no podía conectarse?",
} as const;

export const LANGUAGES = [
  { value: "es", label: "🇪🇸 Español" },
  { value: "en", label: "🇬🇧 English" },
  { value: "pt", label: "🇵🇹 Português" },
  { value: "fr", label: "🇫🇷 Français" },
  { value: "de", label: "🇩🇪 Deutsch" },
] as const;

export const MINECRAFT_VERSION_LABELS: Record<string, string> = {
  JAVA:    "☕ Java",
  BEDROCK: "🪨 Bedrock",
  CONSOLE: "🎮 Consola",
};

export const LANGUAGE_FLAG: Record<string, string> = {
  es: "🇪🇸",
  en: "🇬🇧",
  pt: "🇵🇹",
  fr: "🇫🇷",
  de: "🇩🇪",
};

// IDs de hitos de progreso por juego (las labels están en i18n)
export const GAME_MILESTONES = {
  MINECRAFT: [
    "START",
    "STONE_AGE",
    "IRON_AGE",
    "PRE_NETHER",
    "NETHER",
    "END_READY",
    "END_DONE",
    "LATE_GAME",
  ],
  PROJECT_ZOMBOID: [
    "START",
    "FIRST_BASE",
    "WEEK_1",
    "VEHICLE",
    "FORTIFIED",
    "MONTH_1",
    "LATE_GAME",
  ],
} as const;
