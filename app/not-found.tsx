import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 – Page Not Found | PDF24X",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <>
      {/* Hide navbar/footer via CSS on this page */}
      <style>{`
        nav, footer, [data-mobile-nav], .pb-16 { display: none !important; }
      `}</style>
      <div className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden" style={{background:"#F5F3EE"}}>
        {/* Giant background 404 */}
        <p className="absolute inset-0 flex items-center justify-center font-black leading-none select-none pointer-events-none tracking-tighter"
          style={{fontSize:"28vw", color:"#E8E5DF"}}>
          404
        </p>
        {/* Content */}
        <div className="relative z-10 text-center max-w-xl">
          <h1 className="text-5xl sm:text-6xl font-light tracking-tight mb-4" style={{color:"#1a1917"}}>
            Page Not Found
          </h1>
          <p className="text-[16px] sm:text-[18px] leading-relaxed mb-10 max-w-md mx-auto" style={{color:"#6b6760"}}>
            The page you are looking for might have been moved, deleted, or it never existed in the first place.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/contact"
              className="flex items-center gap-2 px-7 py-3 rounded-full text-white text-[14px] font-semibold transition-all hover:opacity-90"
              style={{background:"#1a1917"}}>
              Get in touch →
            </Link>
            <Link href="/"
              className="flex items-center gap-2 px-7 py-3 rounded-full text-[14px] font-semibold transition-all"
              style={{border:"1.5px solid rgba(26,25,23,0.25)", color:"#1a1917"}}>
              Go Home
            </Link>
            <Link href="/tools"
              className="flex items-center gap-2 px-7 py-3 rounded-full text-[14px] font-semibold transition-all"
              style={{border:"1.5px solid rgba(26,25,23,0.25)", color:"#1a1917"}}>
              Browse Tools
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
