import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CreatePartyWizard } from "./create-party-wizard";

export default async function NewPartyPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const t = await getTranslations("createParty");

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          {t("subtitle")}
        </p>
      </div>
      <CreatePartyWizard />
    </div>
  );
}
