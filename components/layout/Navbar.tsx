"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ChevronDown, GitMerge, Minimize2, Split, FileText, FileImage, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

const HIGHLY_USED = [
  { icon: ImageIcon, color: "#27AE60", tint: "#E4F5EC", title: "Image to PDF", path: "/tools/image-to-pdf" },
  { icon: Minimize2, color: "#3B82F6", tint: "#E5EEFC", title: "Compress PDF", path: "/tools/compress" },
  { icon: GitMerge, color: "#F2994A", tint: "#FCEEDD", title: "Merge PDF", path: "/tools/merge" },
  { icon: Split, color: "#7B61FF", tint: "#ECE7FF", title: "Split PDF", path: "/tools/split" },
  { icon: FileImage, color: "#EC4899", tint: "#FCE4EF", title: "PDF to JPG", path: "/tools/pdf-to-jpg" },
];

const NAV_LINKS = [
  { label: "About Us", path: "/about" },
  { label: "Blogs", path: "/blog" },
  { label: "Privacy Policy", path: "/privacy-policy" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b border-[#1c1c1c] bg-[#f4f1ea]/90 backdrop-blur"
      onMouseLeave={() => setMegaOpen(false)}
      onKeyDown={(e) => e.key === "Escape" && setMegaOpen(false)}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="PDF24X" width={130} height={36} style={{ objectFit: "contain" }} priority />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 lg:flex">
            {/* Highly Used Tools with dropdown */}
            <div className="relative" onMouseEnter={() => setMegaOpen(true)}>
              <button className="flex items-center gap-1 text-sm font-medium text-[#1a1a1a] transition-colors hover:text-[#FF6B5E]"
                aria-expanded={megaOpen}
                aria-haspopup="true"
                onKeyDown={(e) => e.key === "Escape" && setMegaOpen(false)}>
                Highly Used Tools
                <ChevronDown size={14} className={`transition-transform duration-200 ${megaOpen ? "rotate-180" : ""}`} />
              </button>
            </div>
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.path}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.path ? "text-[#FF6B5E]" : "text-[#1a1a1a] hover:text-[#FF6B5E]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/tools"
              className="hidden rounded-lg bg-[#FF6B5E] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 sm:inline-flex"
            >
              Explore All Tools
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle navigation menu"
              aria-expanded={open}
              className="rounded-lg border border-[#1c1c1c] p-2 text-[#1a1a1a] lg:hidden"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mega menu dropdown */}
        {megaOpen && (
          <div className="absolute left-0 right-0 top-16 border-t border-[#1c1c1c] bg-[#f4f1ea]/95 backdrop-blur shadow-lg">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#6b6760]">Most Used Tools</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {HIGHLY_USED.map((tool) => (
                  <Link
                    key={tool.title}
                    href={tool.path}
                    onClick={() => setMegaOpen(false)}
                    onKeyDown={(e) => e.key === "Enter" && setMegaOpen(false)}
                    className="flex flex-col items-center gap-2 rounded-xl border border-[#1c1c1c] bg-[#ffffff] p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: tool.tint }}>
                      <tool.icon size={20} style={{ color: tool.color }} />
                    </span>
                    <span className="text-xs font-semibold text-[#1a1a1a]">{tool.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {open && (
        <div role="navigation" aria-label="Mobile navigation" className="space-y-1 border-t border-[#1c1c1c] px-4 pb-4 pt-1 lg:hidden">
          <Link href="/tools" onClick={() => setOpen(false)} className="flex w-full items-center justify-between py-2.5 text-sm font-medium text-[#1a1a1a]">
            Highly Used Tools <ChevronDown size={15} />
          </Link>
          {NAV_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.path}
              onClick={() => setOpen(false)}
              className="flex w-full items-center py-2.5 text-sm font-medium text-[#1a1a1a]"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/tools"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-lg bg-[#FF6B5E] px-4 py-2.5 text-center text-sm font-semibold text-white"
          >
            Explore All Tools
          </Link>
        </div>
      )}
    </header>
  );
}
