import { auth } from "@/lib/auth";
import { ContactForm } from "./contact-form";

export default async function ContactPage() {
  const session = await auth();

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Contacto</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          ¿Tienes algún problema, duda o feedback? Escríbenos.
        </p>
      </div>
      <ContactForm
        defaultName={session?.user?.name ?? ""}
        defaultEmail={session?.user?.email ?? ""}
      />
    </div>
  );
}
