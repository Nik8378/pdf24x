"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Next.js renders not-found for ANY unknown route
  // So we check if the page is a known route — if not, hide nav/footer
  const knownPrefixes = [
    "/tools", "/diff-checker", "/blog", "/about",
    "/contact", "/privacy-policy", "/terms-of-use",
    "/disclaimer", "/api",
  ];
  const isHome = pathname === "/";
  const isKnown = isHome || knownPrefixes.some(p => pathname.startsWith(p));
  const hide = !isKnown;

  return (
    <>
      {!hide && <Navbar />}
      {children}
      {!hide && <MobileNav />}
      {!hide && <div className="pb-16 lg:pb-0" />}
      {!hide && <Footer />}
    </>
  );
}
