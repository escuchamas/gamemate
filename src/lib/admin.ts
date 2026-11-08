import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Único sitio donde se decide quién es administrador.
// No basta con que el email de la sesión esté en la lista: la cuenta tiene que
// tener ese email VERIFICADO y no estar baneada. Así nadie puede registrarse con
// un email de la lista que no sea suyo y entrar al panel.
const ADMIN_EMAILS = ["fernandomcq123@gmail.com", "fernando_mcq@hotmail.com"];

export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return false;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { email: true, emailVerified: true, banned: true },
  });
  return !!user && !!user.emailVerified && !user.banned && ADMIN_EMAILS.includes(user.email.toLowerCase());
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}
