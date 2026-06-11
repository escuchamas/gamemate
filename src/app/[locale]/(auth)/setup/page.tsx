import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SetupForm } from "./setup-form";

export default async function SetupPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, username: true, needsOnboarding: true },
  });

  if (!user?.needsOnboarding) redirect("/parties");

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Personaliza tu perfil</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Elige cómo te verán otros jugadores en GameMate.
        </p>
      </div>

      <div className="rounded-2xl bg-[var(--card)] border border-[var(--card-border)] p-6">
        <SetupForm
          currentName={user.name ?? ""}
          currentUsername={user.username ?? ""}
        />
      </div>
    </div>
  );
}
