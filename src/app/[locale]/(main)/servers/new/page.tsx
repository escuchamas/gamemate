import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ServerForm } from "./server-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publicar servidor | GameMate",
  description: "Publica tu servidor de Minecraft o Project Zomboid en el tablón de GameMate y encuentra jugadores activos.",
};

export default async function NewServerPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Publicar servidor</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Tu servidor aparecerá en el tablón público. Los jugadores podrán votar cada día para subirlo en el ranking.
        </p>
      </div>
      <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-6">
        <ServerForm />
      </div>
    </div>
  );
}
