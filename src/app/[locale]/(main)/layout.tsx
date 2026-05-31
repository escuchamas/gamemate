import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProfileBanner } from "@/components/profile-banner";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  let showProfileBanner = false;

  if (session?.user?.id) {
    const [user, profileCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { emailVerified: true },
      }),
      prisma.gameProfile.count({ where: { userId: session.user.id } }),
    ]);

    if (!user?.emailVerified) redirect("/verify-email");
    showProfileBanner = profileCount === 0;
  }

  return (
    <>
      <Navbar />
      {showProfileBanner && <ProfileBanner />}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>
      <Footer />
    </>
  );
}
