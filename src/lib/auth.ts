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
          select: { username: true, banned: true },
        });
        if (dbUser?.banned) return false;
        if (!dbUser?.username) {
          const base = user.name ?? user.email?.split("@")[0] ?? "user";
          const username = await generateUniqueUsername(base);
          await prisma.user.update({ where: { id: user.id }, data: { username } });
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
