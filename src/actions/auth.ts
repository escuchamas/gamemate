"use server";

import bcrypt from "bcryptjs";
import { signIn, auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registerSchema, loginSchema, phoneVerifySchema } from "@/lib/validations";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import twilio from "twilio";
import { Resend } from "resend";

type ActionResult = { error?: string; field?: string; success?: string };

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
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      error: firstIssue?.message ?? "Datos inválidos",
      field: String(firstIssue?.path[0] ?? ""),
    };
  }

  const { name, username, email, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    if (existing.email === email) return { error: "Este email ya está registrado", field: "email" };
    return { error: "Este nombre de usuario ya está en uso", field: "username" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, username, email, password: hashedPassword },
  });

  // Send verification email
  await sendEmailVerificationCode(user.id, email, name ?? "");

  // Auto-login and redirect to verify email
  await signIn("credentials", { email, password, redirectTo: "/verify-email" });
  return {};
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

// ─── EMAIL VERIFICATION ───────────────────────────────────────────────────────

export async function sendEmailVerificationCode(userId: string, email: string, name: string): Promise<void> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

  await prisma.emailVerification.deleteMany({ where: { userId } });
  await prisma.emailVerification.create({ data: { userId, code, expiresAt } });

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "GameMate <noreply@gamemate.es>",
    to: email,
    subject: "Verifica tu cuenta de GameMate",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f0f13;color:#e8e8f0;border-radius:12px">
        <h1 style="color:#f97316;font-size:24px;margin-bottom:8px">¡Bienvenido a GameMate, ${name}!</h1>
        <p style="color:#8888aa;margin-bottom:24px">Usa este código para verificar tu cuenta. Válido 30 minutos.</p>
        <div style="background:#1a1a24;border:1px solid #2a2a3a;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px">
          <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#f97316">${code}</span>
        </div>
        <p style="color:#8888aa;font-size:12px">Si no has creado una cuenta en GameMate, ignora este email.</p>
      </div>
    `,
  });
}

export async function resendEmailVerificationAction(): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true, emailVerified: true },
  });

  if (!user) return { error: "Usuario no encontrado" };
  if (user.emailVerified) return { error: "Tu email ya está verificado" };

  await sendEmailVerificationCode(session.user.id, user.email, user.name ?? "");
  return { success: "Código reenviado. Revisa tu email." };
}

export async function verifyEmailAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  const code = (formData.get("code") as string)?.trim();
  if (!code || !/^\d{6}$/.test(code)) return { error: "Código inválido" };

  const verification = await prisma.emailVerification.findFirst({
    where: { userId: session.user.id, code, expiresAt: { gt: new Date() } },
  });

  if (!verification) return { error: "Código incorrecto o expirado" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { emailVerified: new Date() },
  });
  await prisma.emailVerification.deleteMany({ where: { userId: session.user.id } });

  redirect("/parties");
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

export async function forgotPasswordAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Email inválido" };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to avoid email enumeration
  if (!user || !user.password) {
    return { success: "ok" };
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  await prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } });

  const baseUrl = process.env.AUTH_URL ?? "https://gamemate.es";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "GameMate <noreply@gamemate.es>",
    to: email,
    subject: "Recupera tu contraseña de GameMate",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f0f13;color:#e8e8f0;border-radius:12px">
        <h1 style="color:#f97316;font-size:24px;margin-bottom:8px">Recupera tu contraseña</h1>
        <p style="color:#8888aa;margin-bottom:24px">Haz clic en el botón para crear una contraseña nueva. El enlace caduca en 30 minutos.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#f97316;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-bottom:24px">Restablecer contraseña</a>
        <p style="color:#8888aa;font-size:12px">Si no solicitaste esto, ignora este email.</p>
      </div>
    `,
  });

  return { success: "ok" };
}

export async function resetPasswordAction(
  token: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres" };
  }
  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden" };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return { error: "invalid_token" };
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { password: hashed } }),
    prisma.passwordResetToken.delete({ where: { token } }),
  ]);

  return { success: "ok" };
}

export async function completeOnboardingAction(
  name: string,
  username: string
): Promise<{ error?: string; success?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  const trimmedName = name.trim();
  const trimmedUsername = username.trim().toLowerCase();

  if (!trimmedName || trimmedName.length < 2) return { error: "El nombre debe tener al menos 2 caracteres" };
  if (!trimmedUsername || trimmedUsername.length < 3) return { error: "El usuario debe tener al menos 3 caracteres" };
  if (!/^[a-z0-9_]+$/.test(trimmedUsername)) return { error: "Solo minúsculas, números y _" };

  const existing = await prisma.user.findFirst({
    where: { username: trimmedUsername, NOT: { id: session.user.id } },
  });
  if (existing) return { error: "Ese usuario ya está en uso" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: trimmedName, username: trimmedUsername, needsOnboarding: false },
  });

  return { success: "ok" };
}
