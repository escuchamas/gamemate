import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreatePartyForm } from "./create-party-form";

export default async function NewPartyPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Crear party</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Configura tu grupo de juego. Podrás tener entre 2 y 6 jugadores.
        </p>
      </div>
      <CreatePartyForm />
    </div>
  );
}
