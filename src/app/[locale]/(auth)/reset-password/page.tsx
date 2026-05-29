import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ResetPasswordForm } from "./reset-password-form";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const t = await getTranslations("auth.resetPassword");

  if (!token) redirect("/forgot-password");

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  const isExpired = !record || record.expiresAt < new Date();

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">{t("subtitle")}</p>
      </div>
      <ResetPasswordForm token={isExpired ? "" : token} />
    </div>
  );
}
