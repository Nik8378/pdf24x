"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Image, Minimize2, Link2, Scissors, ImagePlay } from "lucide-react";

const links = [
  { name: "Img→PDF",  href: "/tools/image-to-pdf",  icon: Image },
  { name: "→WebP",    href: "/tools/image-to-webp",  icon: ImagePlay },
  { name: "Compress", href: "/tools/compress",        icon: Minimize2 },
  { name: "Merge",    href: "/tools/merge",           icon: Link2 },
  { name: "Split",    href: "/tools/split",           icon: Scissors },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface)] border-t border-[var(--line)] safe-area-bottom">
      <div className="flex items-stretch h-14">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link key={l.href} href={l.href}
              className={`flex flex-col items-center justify-center flex-1 gap-0.5 text-[10px] font-medium transition-colors ${active ? "text-accent" : "text-[var(--txt-2)]"}`}>
              <l.icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              <span>{l.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
