import { Link } from "@/i18n/navigation";
import { PartiesCarouselSection } from "@/components/landing/parties-carousel-section";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* Logo header */}
      <div className="flex justify-center pt-8 pb-2">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <img src="/logo gamemate.png" alt="GameMate" className="h-9" />
        </Link>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Carousel */}
      <PartiesCarouselSection />
    </div>
  );
}
