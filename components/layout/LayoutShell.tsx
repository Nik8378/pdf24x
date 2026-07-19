"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hide = pathname === "/_not-found" || pathname === "/not-found";
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
