import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SuggestionForm } from "./suggestion-form";

export default async function SuggestionsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Peticiones</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          ¿Tienes una idea para mejorar GameMate? Cuéntanosla.
        </p>
      </div>
      <SuggestionForm />
    </div>
  );
}
