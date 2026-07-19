"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const is404 = pathname === "/not-found" || pathname === "/_not-found";
  // Next.js renders not-found at /_not-found internally
  // We detect it by checking if children contain the 404 content
  // The cleanest way: check if no known route matches — but we use a simpler trick:
  // wrap children and conditionally render nav/footer
  if (is404) return <>{children}</>;
  return (
    <>
      <Navbar />
      {children}
      <MobileNav />
      <div className="pb-16 lg:pb-0" />
      <Footer />
    </>
  );
}
