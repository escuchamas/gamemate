import { auth } from "@/lib/auth";
import { ContactForm } from "./contact-form";

import type { Metadata } from "next";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === "en";
  return {
    title: en ? "Contact" : "Contacto",
    description: en ? "Questions, issues or proposals? Get in touch with the GameMate team." : "¿Dudas, problemas o propuestas? Escribe al equipo de GameMate, la comunidad para encontrar compañeros de Minecraft, LoL y Project Zomboid.",
    alternates: localeAlternates(locale, "/contact", { esOnly: true }),
  };
}

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
