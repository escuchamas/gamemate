"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPartySchema } from "@/lib/validations";
import { DEFAULT_RULES } from "@/lib/constants";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { createNotification } from "@/lib/notifications";
import { Resend } from "resend";

type ActionResult = { error?: string; success?: string; partyId?: string };

export async function createPartyAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  const activeParties = await prisma.party.count({
    where: {
      creatorId: session.user.id,
      status: { in: ["OPEN", "FULL", "IN_GAME"] },
    },
  });
  if (activeParties >= 2) {
    return { error: "Ya tienes 2 parties activas. Cierra una antes de crear otra." };
  }

  const selectedRulesRaw = formData.get("selectedRules");
  const customRulesRaw = formData.get("customRules");

  const raw = {
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    game: formData.get("game"),
    skillLevel: formData.get("skillLevel"),
    minPlayers: Number(formData.get("minPlayers")),
    maxPlayers: Number(formData.get("maxPlayers")),
    language: formData.get("language") || "es",
    minecraftVersion: formData.get("minecraftVersion") || undefined,
    lolRoles: (() => { try { return JSON.parse(formData.get("lolRoles") as string || "[]"); } catch { return []; } })(),
    lolRankMin: formData.get("lolRankMin") || undefined,
    lolRankMax: formData.get("lolRankMax") || undefined,
    modded: formData.get("modded") === "true",
    modTags: (() => { try { return JSON.parse(formData.get("modTags") as string || "[]"); } catch { return []; } })(),
    modsNote: formData.get("modsNote") || undefined,
    serverInfo: formData.get("serverInfo") || undefined,
    gameLabel: formData.get("gameLabel") as string || undefined,
    selectedRules: selectedRulesRaw ? JSON.parse(selectedRulesRaw as string) : [],
    customRules: customRulesRaw ? JSON.parse(customRulesRaw as string) : [],
  };

  const parsed = createPartySchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { error: firstError };
  }

  const data = parsed.data;

  if (data.minPlayers > data.maxPlayers) {
    return { error: "El mínimo no puede ser mayor que el máximo" };
  }

  const gameRules = DEFAULT_RULES[data.game as keyof typeof DEFAULT_RULES] ?? [];
  const requiredRules = gameRules.filter((r) => r.isRequired);
  const optionalDefaultRules = gameRules.filter(
    (r) => !r.isRequired && data.selectedRules.includes(r.text)
  );

  const party = await prisma.party.create({
    data: {
      name: data.name,
      description: data.description,
      game: data.game,
      skillLevel: data.skillLevel,
      minPlayers: data.minPlayers,
      maxPlayers: data.maxPlayers,
      language: data.language,
      minecraftVersion: (data as any).minecraftVersion ?? null,
      lolRoles: (data as any).lolRoles ?? [],
      lolRankMin: (data as any).lolRankMin ?? null,
      lolRankMax: (data as any).lolRankMax ?? null,
      modded: data.modded,
      modTags: data.modTags ?? [],
      modsNote: data.modsNote,
      serverInfo: data.serverInfo,
      gameLabel: (raw as any).gameLabel ?? null,
      creatorId: session.user.id,
      members: {
        create: {
          userId: session.user.id,
          role: "LEADER",
        },
      },
      rules: {
        createMany: {
          data: [
            ...requiredRules.map((r) => ({
              category: r.category,
              text: r.text,
              isDefault: true,
              isRequired: true,
            })),
            ...optionalDefaultRules.map((r) => ({
              category: r.category,
              text: r.text,
              isDefault: true,
              isRequired: false,
            })),
            ...data.customRules.map((r) => ({
              category: r.category,
              text: r.text,
              isDefault: false,
              isRequired: false,
            })),
          ],
        },
      },
    },
  });

  updateTag(`parties`);

  redirect(`/parties/${party.id}`);
}

// Enviar solicitud de unión (con mensaje opcional)
export async function requestJoinPartyAction(
  partyId: string,
  message?: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  const party = await prisma.party.findUnique({
    where: { id: partyId },
    include: {
      members: true,
      creator: { select: { email: true } },
    },
  });

  if (!party) return { error: "La party no existe" };
  if (party.status !== "OPEN" && party.status !== "IN_GAME")
    return { error: "Esta party no está disponible" };

  // Si es una party de demo, simular que acaban de empezar
  if (party.creator.email?.endsWith("@gamemate-demo.fake")) {
    await prisma.party.update({ where: { id: partyId }, data: { status: "IN_GAME" } });
    updateTag(`party-${partyId}`);
    return { error: "Esta party acaba de empezar a jugar, ya no acepta nuevos miembros 🎮" };
  }

  const alreadyMember = party.members.some((m) => m.userId === session.user.id);
  if (alreadyMember) return { error: "Ya eres miembro de esta party" };

  if (party.members.length >= party.maxPlayers)
    return { error: "La party está llena" };

  const gameProfile = await prisma.gameProfile.findUnique({
    where: { userId_game: { userId: session.user.id, game: party.game } },
  });
  if (!gameProfile) return { error: `INCOMPLETE_PROFILE:${party.game}` };

  // Validación de edad si la party lo requiere
  if (party.minAge || party.maxAge) {
    const userAge = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { age: true },
    });
    if (!userAge?.age) {
      return { error: "AGE_REQUIRED" };
    }
    if (party.minAge && userAge.age < party.minAge) {
      return { error: `Esta party requiere tener al menos ${party.minAge} años.` };
    }
    if (party.maxAge && userAge.age > party.maxAge) {
      return { error: `Esta party es para jugadores de hasta ${party.maxAge} años.` };
    }
  }

  const existing = await prisma.partyJoinRequest.findUnique({
    where: { partyId_userId: { partyId, userId: session.user.id } },
  });
  if (existing && existing.status === "PENDING")
    return { error: "Ya tienes una solicitud pendiente" };

  // Upsert: si fue cancelada/rechazada, crear nueva
  await prisma.partyJoinRequest.upsert({
    where: { partyId_userId: { partyId, userId: session.user.id } },
    create: {
      partyId,
      userId: session.user.id,
      message: message?.slice(0, 500) || null,
      status: "PENDING",
    },
    update: {
      message: message?.slice(0, 500) || null,
      status: "PENDING",
      updatedAt: new Date(),
    },
  });

  // Notificar a todos los miembros
  const requester = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true } });
  for (const member of party.members) {
    await createNotification({
      userId: member.userId,
      type: "JOIN_REQUEST",
      title: "Nueva solicitud de unión",
      body: `${requester?.name ?? "Alguien"} quiere unirse a "${party.name}"`,
      link: `/parties/${partyId}`,
    });
  }

  updateTag(`party-${partyId}`);
  return { success: "Solicitud enviada. Los miembros deben aceptarte." };
}

// Votar en una solicitud de unión (solo miembros)
export async function voteJoinRequestAction(
  requestId: string,
  approve: boolean
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  const request = await prisma.partyJoinRequest.findUnique({
    where: { id: requestId },
    include: {
      party: { include: { members: true } },
      votes: true,
      user: { select: { email: true, name: true } },
    },
  });

  if (!request) return { error: "Solicitud no encontrada" };
  if (request.status !== "PENDING") return { error: "Esta solicitud ya fue procesada" };

  const isMember = request.party.members.some(
    (m) => m.userId === session.user.id
  );
  if (!isMember) return { error: "Solo los miembros pueden votar" };

  const alreadyVoted = request.votes.some((v) => v.voterId === session.user.id);
  if (alreadyVoted) return { error: "Ya has votado" };

  if (!approve) {
    // Rechazo inmediato por cualquier miembro
    await prisma.$transaction([
      prisma.partyJoinRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" },
      }),
    ]);
    await createNotification({
      userId: request.userId,
      type: "JOIN_REJECTED",
      title: "Solicitud rechazada",
      body: `Tu solicitud para unirte a "${request.party.name}" fue rechazada`,
      link: `/parties/${request.partyId}`,
    });
    updateTag(`party-${request.partyId}`);
    return { success: "Solicitud rechazada" };
  }

  // Guardar voto de aprobación
  await prisma.joinRequestVote.create({
    data: { requestId, voterId: session.user.id, approve: true },
  });

  // Comprobar si todos los miembros han aprobado
  const totalMembers = request.party.members.length;
  const approvalVotes = request.votes.filter((v) => v.approve).length + 1; // +1 por el voto recién emitido

  if (approvalVotes >= totalMembers) {
    // ¡Todos aprobaron! Admitir al usuario
    const party = request.party;
    if (party.members.length < party.maxPlayers) {
      await prisma.$transaction([
        prisma.partyJoinRequest.update({
          where: { id: requestId },
          data: { status: "APPROVED" },
        }),
        prisma.partyMember.create({
          data: { partyId: request.partyId, userId: request.userId },
        }),
        ...(party.members.length + 1 >= party.maxPlayers
          ? [
              prisma.party.update({
                where: { id: request.partyId },
                data: { status: "FULL" },
              }),
            ]
          : []),
      ]);
    }
    await createNotification({
      userId: request.userId,
      type: "JOIN_APPROVED",
      title: "¡Solicitud aprobada!",
      body: `Te han aceptado en "${request.party.name}"`,
      link: `/parties/${request.partyId}`,
    });

    // Send acceptance email
    try {
      const base = process.env.AUTH_URL ?? "https://gamemate.es";
      const partyUrl = `${base}/es/parties/${request.partyId}`;
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "GameMate <noreply@gamemate.es>",
        to: request.user.email,
        subject: `¡Te han aceptado en "${request.party.name}"! 🎮`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f0f13;color:#e8e8f0;border-radius:12px">
            <div style="text-align:center;margin-bottom:24px">
              <img src="https://gamemate.es/apple-icon.png" alt="GameMate" style="width:64px;height:64px;border-radius:50%"/>
            </div>
            <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 8px">¡Estás dentro, ${request.user.name?.split(" ")[0] ?? "gamer"}! 🎉</h1>
            <p style="color:#a0a0b8;margin:0 0 24px;line-height:1.6">
              Tu solicitud para unirte a <strong style="color:#ffffff">${request.party.name}</strong> ha sido aceptada por todos los miembros.
            </p>
            <a href="${partyUrl}" style="display:inline-block;background:#ea580c;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">
              Ir a la party →
            </a>
            <p style="color:#6b7280;font-size:12px;margin-top:32px">
              Si no esperabas este email, puedes ignorarlo.
            </p>
          </div>
        `,
      });
    } catch {
      // No bloquear el flujo si el email falla
    }

    updateTag(`party-${request.partyId}`);
    updateTag(`parties`);
    return { success: "¡Solicitud aprobada! El jugador se ha unido." };
  }

  updateTag(`party-${request.partyId}`);
  return {
    success: `Voto registrado (${approvalVotes}/${totalMembers} aprobaciones)`,
  };
}

// Cancelar propia solicitud
export async function cancelJoinRequestAction(
  partyId: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  await prisma.partyJoinRequest.updateMany({
    where: {
      partyId,
      userId: session.user.id,
      status: "PENDING",
    },
    data: { status: "CANCELLED" },
  });

  updateTag(`party-${partyId}`);
  return { success: "Solicitud cancelada" };
}

// Acción legacy — ya no admite directamente, pero la dejamos como alias por compatibilidad
export async function joinPartyAction(partyId: string): Promise<ActionResult> {
  return requestJoinPartyAction(partyId);
}

export async function leavePartyAction(partyId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  const member = await prisma.partyMember.findUnique({
    where: { partyId_userId: { partyId, userId: session.user.id } },
  });

  if (!member) return { error: "No eres miembro de esta party" };

  if (member.role === "LEADER") {
    return { error: "El líder no puede abandonar la party. Transfiere el liderazgo primero o cierra la party." };
  }

  await prisma.partyMember.delete({
    where: { partyId_userId: { partyId, userId: session.user.id } },
  });

  await prisma.party.update({
    where: { id: partyId },
    data: { status: "OPEN" },
  });

  updateTag(`party-${partyId}`);
  updateTag(`parties`);

  return { success: "Has abandonado la party" };
}

// ─── EXPULSIÓN POR VOTACIÓN ───────────────────────────────────────────────────

export async function proposeKickAction(
  partyId: string,
  targetId: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  if (targetId === session.user.id) return { error: "No puedes proponer tu propia expulsión" };

  const party = await prisma.party.findUnique({
    where: { id: partyId },
    include: { members: { include: { user: { select: { id: true } } } } },
  });

  if (!party) return { error: "La party no existe" };

  const isMember = party.members.some((m) => m.userId === session.user.id);
  if (!isMember) return { error: "No eres miembro de esta party" };

  const targetMember = party.members.find((m) => m.userId === targetId);
  if (!targetMember) return { error: "El jugador no es miembro de esta party" };
  if (targetMember.role === "LEADER") return { error: "No se puede expulsar al líder" };

  const existing = await prisma.partyKickProposal.findUnique({
    where: { partyId_targetId: { partyId, targetId } },
  });
  if (existing && existing.status === "PENDING") {
    return { error: "Ya hay una propuesta activa para este jugador" };
  }

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 3); // 3 días para votar

  await prisma.partyKickProposal.upsert({
    where: { partyId_targetId: { partyId, targetId } },
    create: {
      partyId,
      targetId,
      initiatorId: session.user.id,
      votingDeadline: deadline,
      status: "PENDING",
    },
    update: {
      initiatorId: session.user.id,
      votingDeadline: deadline,
      status: "PENDING",
    },
  });

  updateTag(`party-${partyId}`);
  return { success: "Propuesta de expulsión enviada" };
}

export async function voteKickAction(
  proposalId: string,
  approve: boolean
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  const proposal = await prisma.partyKickProposal.findUnique({
    where: { id: proposalId },
    include: {
      party: { include: { members: true } },
      votes: true,
    },
  });

  if (!proposal) return { error: "Propuesta no encontrada" };
  if (proposal.status !== "PENDING") return { error: "Esta propuesta ya fue procesada" };
  if (proposal.targetId === session.user.id) return { error: "No puedes votar sobre tu propia expulsión" };

  const isMember = proposal.party.members.some((m) => m.userId === session.user.id);
  if (!isMember) return { error: "Solo los miembros pueden votar" };

  const alreadyVoted = proposal.votes.some((v) => v.voterId === session.user.id);
  if (alreadyVoted) return { error: "Ya has votado" };

  if (!approve) {
    await prisma.partyKickProposal.update({
      where: { id: proposalId },
      data: { status: "REJECTED" },
    });
    updateTag(`party-${proposal.partyId}`);
    return { success: "Has vetado la expulsión. Propuesta cancelada." };
  }

  await prisma.kickVoteRecord.create({
    data: { proposalId, voterId: session.user.id, approve: true },
  });

  // Votos necesarios: todos excepto el target
  const eligibleVoters = proposal.party.members.filter(
    (m) => m.userId !== proposal.targetId
  ).length;
  const currentApprovals = proposal.votes.filter((v) => v.approve).length + 1;

  // También contar como "sí" a quienes no hayan votado y la deadline haya expirado
  const now = new Date();
  const deadlinePassed = proposal.votingDeadline <= now;

  const pendingVoters = eligibleVoters - currentApprovals;
  const effectiveApprovals = deadlinePassed
    ? eligibleVoters // todos cuentan como "sí" si pasó el plazo
    : currentApprovals;

  if (effectiveApprovals >= eligibleVoters || (deadlinePassed && pendingVoters === 0)) {
    // Expulsar al jugador
    await prisma.$transaction([
      prisma.partyKickProposal.update({
        where: { id: proposalId },
        data: { status: "APPROVED" },
      }),
      prisma.partyMember.delete({
        where: {
          partyId_userId: {
            partyId: proposal.partyId,
            userId: proposal.targetId,
          },
        },
      }),
      prisma.party.update({
        where: { id: proposal.partyId },
        data: { status: "OPEN" },
      }),
    ]);
    updateTag(`party-${proposal.partyId}`);
    updateTag(`parties`);
    return { success: "El jugador ha sido expulsado de la party." };
  }

  updateTag(`party-${proposal.partyId}`);
  return {
    success: `Voto registrado (${currentApprovals}/${eligibleVoters} aprobaciones necesarias)`,
  };
}

// Resolución de propuestas con deadline expirado (llamado cuando se carga la party)
export async function resolveExpiredKickProposalsAction(
  partyId: string
): Promise<void> {
  const now = new Date();
  const expired = await prisma.partyKickProposal.findMany({
    where: { partyId, status: "PENDING", votingDeadline: { lte: now } },
    include: {
      party: { include: { members: true } },
      votes: true,
    },
  });

  for (const proposal of expired) {
    // Silencio = "sí" → expulsar
    await prisma.$transaction([
      prisma.partyKickProposal.update({
        where: { id: proposal.id },
        data: { status: "APPROVED" },
      }),
      prisma.partyMember.deleteMany({
        where: { partyId, userId: proposal.targetId },
      }),
      prisma.party.update({
        where: { id: partyId },
        data: { status: "OPEN" },
      }),
    ]);
  }

  if (expired.length > 0) {
    updateTag(`party-${partyId}`);
    updateTag(`parties`);
  }
}

export async function updateMilestoneAction(
  partyId: string,
  milestone: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  const party = await prisma.party.findUnique({
    where: { id: partyId },
    select: { creatorId: true },
  });

  if (!party) return { error: "La party no existe" };
  if (party.creatorId !== session.user.id)
    return { error: "Solo el líder puede actualizar el hito" };

  await prisma.party.update({
    where: { id: partyId },
    data: { currentMilestone: milestone },
  });

  updateTag(`party-${partyId}`);
  return { success: "Hito actualizado" };
}

export async function closePartyAction(partyId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  const party = await prisma.party.findUnique({
    where: { id: partyId },
    select: { creatorId: true },
  });

  if (!party) return { error: "La party no existe" };
  if (party.creatorId !== session.user.id) return { error: "Solo el líder puede cerrar la party" };

  await prisma.party.update({
    where: { id: partyId },
    data: { status: "CLOSED" },
  });

  updateTag(`party-${partyId}`);
  updateTag(`parties`);

  return { success: "Party cerrada" };
}

export async function startPartyAction(partyId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  const party = await prisma.party.findUnique({
    where: { id: partyId },
    select: { creatorId: true, status: true },
  });

  if (!party) return { error: "La party no existe" };
  if (party.creatorId !== session.user.id) return { error: "Solo el líder puede iniciar la party" };
  if (party.status !== "FULL") return { error: "La party debe estar llena para iniciarla" };

  await prisma.party.update({
    where: { id: partyId },
    data: { status: "IN_GAME" },
  });

  updateTag(`party-${partyId}`);
  updateTag(`parties`);

  return { success: "¡Party iniciada! A jugar 🎮" };
}

export async function createPartyWizardAction(formData: FormData): Promise<void> {
  await createPartyAction({}, formData);
}
