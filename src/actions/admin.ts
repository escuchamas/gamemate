"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

const ADMIN_EMAILS = ["fernandomcq123@gmail.com", "fernando_mcq@hotmail.com"];

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    throw new Error("Unauthorized");
  }
}

export async function markContactReadAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.contactMessage.update({ where: { id }, data: { read: true } });
  revalidatePath("/admin");
}

export async function deleteContactAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin");
}

export async function markSuggestionReadAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.suggestion.update({ where: { id }, data: { read: true } });
  revalidatePath("/admin");
}

export async function updateSuggestionStatusAction(id: string, status: string): Promise<void> {
  await requireAdmin();
  await prisma.suggestion.update({
    where: { id },
    data: { status: status as any, read: true },
  });
  revalidatePath("/admin");
}

export async function banUserAction(userId: string, reason: string): Promise<void> {
  await requireAdmin();

  const finalReason = reason || "Incumplimiento de normas";

  const user = await prisma.user.update({
    where: { id: userId },
    data: { banned: true, banReason: finalReason },
    select: { email: true, name: true },
  });

  revalidatePath("/admin/users");

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const base = process.env.AUTH_URL ?? "https://gamemate.es";
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "GameMate <noreply@gamemate.es>",
      to: user.email,
      subject: "Tu cuenta en GameMate ha sido suspendida",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f0f13;color:#e8e8f0;border-radius:12px">
          <div style="text-align:center;margin-bottom:24px">
            <img src="${base}/apple-icon.png" alt="GameMate" style="width:64px;height:64px;border-radius:50%"/>
          </div>
          <h1 style="font-size:20px;font-weight:700;color:#ffffff;margin:0 0 12px">Cuenta suspendida</h1>
          <p style="color:#a0a0b8;line-height:1.6;margin:0 0 20px">
            Hola${user.name ? ` <strong style="color:#ffffff">${user.name.split(" ")[0]}</strong>` : ""},<br/>
            tu cuenta en GameMate ha sido suspendida por el siguiente motivo:
          </p>
          <div style="background:#1c1c2e;border-left:3px solid #ea580c;border-radius:4px;padding:14px 18px;margin:0 0 24px">
            <p style="color:#e8e8f0;font-size:14px;margin:0;font-weight:500">${finalReason}</p>
          </div>
          <p style="color:#a0a0b8;line-height:1.6;margin:0 0 20px;font-size:14px">
            Si crees que esta suspensión es un error o quieres apelar la decisión, puedes escribirnos a:
          </p>
          <a href="mailto:hola@gamemate.es" style="display:inline-block;background:#1c1c2e;border:1px solid #374151;color:#ea580c;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-bottom:24px">
            hola@gamemate.es
          </a>
          <p style="color:#6b7280;font-size:12px;margin:0;line-height:1.5">
            Por favor, incluye en el correo tu nombre de usuario y una explicación detallada.<br/>
            Revisamos todas las apelaciones en un plazo de 48-72 horas.
          </p>
        </div>
      `,
    });
  } catch {
    // No bloqueamos el baneo si el email falla
  }
}

export async function unbanUserAction(userId: string): Promise<void> {
  await requireAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { banned: false, banReason: null },
  });
  revalidatePath("/admin/users");
}

export async function resolveReportAction(id: string, status: "REVIEWED" | "RESOLVED_ACTION" | "RESOLVED_NO_ACTION"): Promise<void> {
  await requireAdmin();
  await prisma.report.update({ where: { id }, data: { status } });
  revalidatePath("/admin/reports");
}

export async function deleteMessageAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.message.delete({ where: { id } });
  revalidatePath("/admin/reports");
}

export async function deleteDirectMessageAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.directMessage.delete({ where: { id } });
  revalidatePath("/admin/reports");
}

export async function closePartyAdminAction(partyId: string): Promise<void> {
  await requireAdmin();
  await prisma.party.update({ where: { id: partyId }, data: { status: "CLOSED" } });
  revalidatePath("/admin/parties");
}

export async function deletePartyAdminAction(partyId: string): Promise<void> {
  await requireAdmin();
  // Delete kick proposals and their votes first
  const proposals = await prisma.partyKickProposal.findMany({ where: { partyId }, select: { id: true } });
  await prisma.$transaction([
    prisma.kickVoteRecord.deleteMany({ where: { proposalId: { in: proposals.map(p => p.id) } } }),
    prisma.partyKickProposal.deleteMany({ where: { partyId } }),
    prisma.partyJoinRequest.deleteMany({ where: { partyId } }),
    prisma.message.deleteMany({ where: { partyId } }),
    prisma.partyRule.deleteMany({ where: { partyId } }),
    prisma.partyMember.deleteMany({ where: { partyId } }),
    prisma.party.delete({ where: { id: partyId } }),
  ]);
  revalidatePath("/admin/parties");
}
