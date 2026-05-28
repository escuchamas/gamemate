"use server";

import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registerSchema, loginSchema, phoneVerifySchema } from "@/lib/validations";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import twilio from "twilio";

type ActionResult = { error?: string; success?: string };

export async function registerAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    name: formData.get("name"),
    username: (formData.get("username") as string)?.toLowerCase(),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    phone: formData.get("phone") || "",
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { error: firstError };
  }

  const { name, username, email, password, phone } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    if (existing.email === email) return { error: "Este email ya está registrado" };
    return { error: "Este nombre de usuario ya está en uso" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      username,
      email,
      password: hashedPassword,
      phone: phone || null,
    },
  });

  redirect("/login?registered=1");
}

export async function loginAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Email o contraseña inválidos" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "Email o contraseña incorrectos" };
      }
    }
    throw error;
  }

  return {};
}

export async function sendPhoneCodeAction(userId: string): Promise<ActionResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { phone: true, phoneVerified: true },
  });

  if (!user?.phone) return { error: "No tienes un número de teléfono registrado" };
  if (user.phoneVerified) return { error: "Tu teléfono ya está verificado" };

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await prisma.phoneVerification.deleteMany({ where: { userId } });
  await prisma.phoneVerification.create({
    data: { userId, code, expiresAt },
  });

  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    await client.messages.create({
      body: `Tu código de verificación de GameMate es: ${code}. Válido por 10 minutos.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.phone,
    });
  } catch {
    return { error: "Error al enviar el SMS. Inténtalo más tarde." };
  }

  return { success: "Código enviado. Revisa tu teléfono." };
}

export async function verifyPhoneAction(
  userId: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = { code: formData.get("code") };
  const parsed = phoneVerifySchema.safeParse(raw);
  if (!parsed.success) return { error: "Código inválido" };

  const verification = await prisma.phoneVerification.findFirst({
    where: {
      userId,
      code: parsed.data.code,
      expiresAt: { gt: new Date() },
    },
  });

  if (!verification) return { error: "Código incorrecto o expirado" };

  await prisma.user.update({
    where: { id: userId },
    data: { phoneVerified: true },
  });
  await prisma.phoneVerification.deleteMany({ where: { userId } });

  return { success: "Teléfono verificado correctamente" };
}
