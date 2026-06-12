"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Tools", href: "/tools" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="bg-white border-b border-[#1a1917]/10 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center">

        {/* Left — Logo */}
        <div className="flex-1 flex items-center">
          <Link href="/tools" className="flex items-center shrink-0 hover:opacity-80 transition-opacity">
            <img
              src="/logo.png"
              alt="PDF24x"
              width={120}
              height={40}
              style={{ objectFit: "contain" }}
            />
          </Link>
        </div>

        {/* Center — Nav Links */}
        <div className="hidden sm:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                pathname === l.href
                  ? "text-accent bg-accent-bg"
                  : "text-[#4a4845] hover:text-[#1a1917] hover:bg-[#f4f3f0]"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right — Badge */}
        <div className="flex-1 flex items-center justify-end">
          <span className="hidden sm:flex items-center gap-1.5 text-[12px] text-[#7a7875] bg-[#f4f3f0] border border-[#1a1917]/10 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            Files never leave your device
          </span>
        </div>

      </div>
    </nav>
  );
}