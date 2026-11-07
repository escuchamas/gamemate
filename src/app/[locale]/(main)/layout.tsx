import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  let showOnboarding = false;

  if (session?.user?.id) {
    const [user, gamerProfile] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { emailVerified: true, needsOnboarding: true, lastSeenAt: true },
      }),
      prisma.gamerProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      }),
    ]);
    // Última visita (como mucho una escritura cada 12 h): decide si seguir enviando emails
    if (user && (!user.lastSeenAt || Date.now() - user.lastSeenAt.getTime() > 12 * 60 * 60 * 1000)) {
      await prisma.user.update({ where: { id: session.user.id }, data: { lastSeenAt: new Date() } }).catch(() => {});
    }
    if (!user?.emailVerified) redirect("/verify-email");
    if (user?.needsOnboarding) redirect("/setup");
    showOnboarding = !gamerProfile;
  }

  return (
    <>
      <Navbar />
      {showOnboarding && <OnboardingModal />}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>
      <Footer />
    </>
  );
}
