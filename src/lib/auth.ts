import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";

async function generateUniqueUsername(base: string): Promise<string> {
  const slug = base.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 15);
  let username = slug || "user";
  let counter = 0;
  while (await prisma.user.findUnique({ where: { username } })) {
    counter++;
    username = `${slug}${counter}`;
  }
  return username;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user || !user.password) return null;
        if (user.banned) return null;

        const passwordMatch = await bcrypt.compare(
          parsed.data.password,
          user.password
        );
        if (!passwordMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          username: user.username,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.type === "oauth") {
        // Auto-generate username for new Google users
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { username: true, banned: true, emailVerified: true },
        });
        if (dbUser?.banned) return false;
        const updates: Record<string, unknown> = {};
        if (!dbUser?.username) {
          const base = user.name ?? user.email?.split("@")[0] ?? "user";
          updates.username = await generateUniqueUsername(base);
          updates.needsOnboarding = true;

          // Notificar al admin del nuevo registro via Google
          try {
            const { Resend } = await import("resend");
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
              from: process.env.EMAIL_FROM ?? "GameMate <noreply@gamemate.es>",
              to: "fernandomcq123@gmail.com",
              subject: `🎮 Nuevo registro en GameMate (Google) — ${user.name ?? user.email}`,
              html: `
                <div style="font-family:sans-serif;max-width:400px;padding:24px;background:#0f0f13;color:#e8e8f0;border-radius:12px">
                  <h2 style="color:#ea580c;margin:0 0 16px">Nuevo usuario (Google)</h2>
                  <p style="margin:0 0 8px"><strong>Nombre:</strong> ${user.name ?? "—"}</p>
                  <p style="margin:0 0 8px"><strong>Email:</strong> ${user.email}</p>
                  <p style="margin:0 0 16px;color:#6b7280;font-size:12px">${new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}</p>
                  <a href="https://gamemate.es/es/admin/users" style="background:#ea580c;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px">Ver en admin →</a>
                </div>
              `,
            });
          } catch { /* no bloquear */ }
        }
        // Google verifies emails — mark as verified if not already
        if (!dbUser?.emailVerified) {
          updates.emailVerified = new Date();
        }
        if (Object.keys(updates).length > 0) {
          await prisma.user.update({ where: { id: user.id }, data: updates });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        if (account?.type === "oauth") {
          // OAuth: fetch full user from DB for custom fields
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { username: true, emailVerified: true, phoneVerified: true },
          });
          token.username = dbUser?.username ?? null;
          token.emailVerified = dbUser?.emailVerified ?? null;
          token.phoneVerified = dbUser?.phoneVerified ?? false;
        } else {
          token.username = (user as { username?: string | null }).username;
          token.emailVerified = (user as { emailVerified?: Date | null }).emailVerified;
          token.phoneVerified = (user as { phoneVerified?: boolean }).phoneVerified;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { username?: string | null }).username = token.username as string | null;
        (session.user as { emailVerified?: Date | null }).emailVerified = token.emailVerified as Date | null;
        (session.user as { phoneVerified?: boolean }).phoneVerified = token.phoneVerified as boolean;
      }
      return session;
    },
  },
});
