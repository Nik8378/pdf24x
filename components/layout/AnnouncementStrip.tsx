"use client";
import Link from "next/link";
import { Sparkles } from "lucide-react";

const MSG = "New: Text, Code & JSON Diff Checker is live — compare instantly, 100% private";

export function AnnouncementStrip() {
  // Duplicate content so the marquee loops seamlessly
  const item = (
    <span className="mx-8 inline-flex items-center gap-2 text-[13px] font-semibold">
      <Sparkles size={14} className="text-white/90" />
      {MSG}
      <span className="ml-1 rounded-md bg-white/20 px-2 py-0.5 text-[11.5px] font-bold uppercase tracking-wide">Try it →</span>
    </span>
  );
  return (
    <Link
      href="/diff-checker/text"
      aria-label="Try the new Text, Code & JSON Diff Checker"
      className="group relative block w-full overflow-hidden border-b border-[#c0392b] bg-gradient-to-r from-[#EE4B3C] via-[#FF6B5E] to-[#EE4B3C] text-white hover:from-[#e04434] hover:to-[#e04434]"
    >
      <div className="marquee-track flex whitespace-nowrap py-2 will-change-transform">
        <div className="flex shrink-0">{item}{item}{item}{item}</div>
        <div className="flex shrink-0" aria-hidden>{item}{item}{item}{item}</div>
      </div>
      <style>{`
        .marquee-track {
          animation: pdf24x-marquee 40s linear infinite;
        }
        .group:hover .marquee-track { animation-play-state: paused; }
        @keyframes pdf24x-marquee {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>
    </Link>
  );
}
