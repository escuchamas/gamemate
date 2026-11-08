// Guía práctica de cada página de juego: contenido útil para quien llega desde
// Google o desde un asistente de IA (y texto que esos buscadores pueden citar).

export type GuideSection = { title: string; text: string };

export function GameGuide({ title, intro, sections }: { title: string; intro: string; sections: GuideSection[] }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-2xl leading-relaxed">{intro}</p>
      <div className="flex flex-col gap-5">
        {sections.map((s) => (
          <div key={s.title} className="max-w-2xl">
            <h3 className="font-semibold text-white mb-1">{s.title}</h3>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export const GUIDES = {
  minecraft: {
    title: "Cómo encontrar un buen grupo de Minecraft",
    intro:
      "La mayoría de grupos de Minecraft no se rompen por falta de ganas, sino porque nadie acordó lo básico al principio. Antes de entrar en un mundo con gente nueva, conviene tener claras estas cosas.",
    sections: [
      {
        title: "Elige el tipo de partida",
        text: "No es lo mismo un survival vanilla tranquilo que un hardcore con una sola vida, un SMP con proyectos de construcción o un modpack con cientos de mods. Busca parties del modo que te apetece de verdad: mezclar a alguien que quiere construir con alguien que quiere matar al Ender Dragon el primer día suele acabar mal.",
      },
      {
        title: "Java o Bedrock, y la misma versión",
        text: "Java y Bedrock no juegan juntos sin un servidor preparado para ello, y los mods solo funcionan si todos tenéis exactamente la misma versión. Compruébalo antes de quedar para no perder la primera tarde configurando.",
      },
      {
        title: "Quién mantiene el mundo",
        text: "Decidid si usaréis Realms, un servidor alquilado o el mundo de uno de vosotros. Si el mundo está en el ordenador de alguien, solo se puede jugar cuando esa persona está conectada. Y que alguien se encargue de hacer copias de seguridad.",
      },
      {
        title: "Normas que conviene acordar",
        text: "Si los cofres son compartidos o de cada uno, si se puede tocar la base de otro, si hay PvP y qué pasa con las granjas que ralentizan el servidor. En GameMate cada party deja escritas sus normas antes de empezar, así sabes dónde te metes.",
      },
      {
        title: "El mismo ritmo",
        text: "Quien juega dos horas a la semana y quien juega veinte no suelen encajar en el mismo mundo: uno se aburre esperando y el otro se pierde. Fíjate en el nivel y en el horario de la party, no solo en el modo de juego.",
      },
    ],
  },
  lol: {
    title: "Cómo encontrar un buen duo o premade de LoL",
    intro:
      "Jugar con alguien de confianza cambia por completo la experiencia en League of Legends: menos tilt, mejor comunicación y más partidas ganadas por coordinación. Esto es lo que conviene mirar antes de hacer duo con alguien.",
    sections: [
      {
        title: "Rango compatible",
        text: "Riot limita qué rangos pueden jugar juntos en clasificatoria, y además jugar con alguien muy por encima o por debajo de tu nivel no ayuda a nadie. Busca parties cuyo rango mínimo y máximo te incluya, y comprobad las restricciones de duo antes de la primera partida.",
      },
      {
        title: "Roles que se complementan",
        text: "Las parejas más habituales son ADC con support en la línea de abajo y jungla con mid o top, porque son los roles que más interactúan durante la partida. Si los dos sois mains del mismo rol, tocará turnarse o elegir otro compañero.",
      },
      {
        title: "Cómo os vais a comunicar",
        text: "Hablar por voz durante la partida marca la diferencia en las peleas y los objetivos. Acordad si usaréis Discord, en qué horario soléis jugar y cuántas partidas seguidas queréis hacer.",
      },
      {
        title: "Actitud ante las derrotas",
        text: "Un buen compañero no culpa al otro de cada muerte ni pide rendirse al minuto 15 por sistema. Mira la reputación del jugador en GameMate: las valoraciones de partidas anteriores dicen mucho de cómo lleva perder.",
      },
      {
        title: "Clash, normals y ARAM",
        text: "Para Clash necesitáis un equipo de cinco, así que una premade estable es casi obligatoria. Si solo queréis practicar o pasar el rato, las normales y las ARAM son una buena forma de probar a alguien antes de jugar clasificatoria juntos.",
      },
    ],
  },
  pz: {
    title: "Cómo encontrar un buen grupo de Project Zomboid",
    intro:
      "Project Zomboid es mucho más divertido en grupo, pero también es un juego en el que una mala decisión de un compañero puede costar la partida entera. Antes de unirte a un grupo, conviene acordar cómo vais a jugar.",
    sections: [
      {
        title: "Qué tipo de partida queréis",
        text: "Cooperativo en un mundo propio, servidor público, roleplay con historia y personajes, PvE puro o PvP. Cada estilo pide un tipo de jugador distinto, así que busca parties que digan claramente a qué juegan.",
      },
      {
        title: "Ajustes del mundo",
        text: "Número de zombis, si corren o caminan, si un arañazo puede infectar y cuánto tarda en volver a haber zombis en zonas limpias. Esos ajustes cambian por completo la dificultad: hablad de ellos antes de empezar y no a mitad de partida.",
      },
      {
        title: "Mods iguales para todos",
        text: "Si la partida usa mods del Workshop, todos los jugadores necesitan exactamente los mismos. Pide la lista antes de quedar para no pasar la primera hora descargando y reiniciando.",
      },
      {
        title: "Qué pasa cuando alguien muere",
        text: "En Zomboid morir es lo normal. Decidid si quien muere empieza con un personaje nuevo cerca de la base, si se reparte su equipo o si la partida es de muerte permanente sin vuelta atrás.",
      },
      {
        title: "Horarios y servidor",
        text: "En un servidor encendido todo el día el mundo sigue avanzando aunque no estés conectado. Si el grupo juega a horas muy distintas, puede que lo mejor sea jugar solo cuando estéis todos.",
      },
    ],
  },
} satisfies Record<string, { title: string; intro: string; sections: GuideSection[] }>;
