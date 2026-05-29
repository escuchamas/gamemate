"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

type ActionResult = { error?: string; success?: string };

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().max(150).optional(),
  message: z.string().min(10).max(3000),
  category: z.enum(["GENERAL", "BUG", "QUESTION", "OTHER"]),
});

export async function sendContactMessageAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject") || undefined,
    message: formData.get("message"),
    category: formData.get("category"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  await prisma.contactMessage.create({ data: parsed.data });

  return { success: "ok" };
}
