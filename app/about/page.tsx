import type { Metadata } from "next";
import Link from "next/link";
import { Heart, ShieldCheck, Zap, Globe, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | PDF24X",
  description: "Learn why PDF24X exists — free, fast, privacy-first PDF and file tools, with no sign-ups or hidden fees.",
  alternates: { canonical: "https://pdf24x.com/about" },
};

const VALUES = [
  { icon: Heart, color: "#EE4B3C", tint: "#ffe7e3", title: "Built for everyone", desc: "No sign-ups, no paywalls — every tool stays free and open to use." },
  { icon: ShieldCheck, color: "#27AE60", tint: "#E4F5EC", title: "Privacy first", desc: "Files are processed and then deleted. We don't keep what isn't ours." },
  { icon: Zap, color: "#3B82F6", tint: "#E5EEFC", title: "Fast by default", desc: "We optimize every tool so you get results in seconds, not minutes." },
  { icon: Globe, color: "#7B61FF", tint: "#ECE7FF", title: "Works anywhere", desc: "No installs. Any device, any browser, any time." },
];

const C = { ink: "#1a1a1a", sub: "#6b6760", brand: "#FF6B5E", line: "#1c1c1c", surface: "#ffffff", cream: "#f4f1ea" };
const shadow = "3px 3px 0 0 #1c1c1c";
const font = { fontFamily: "Archivo, Inter, sans-serif" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="text-center">
        <span className="mx-auto mb-3 inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-bold" style={{ border: `1px solid ${C.line}`, color: C.brand, boxShadow: shadow }}>
          About PDF24X
        </span>
        <h1 className="text-3xl font-extrabold sm:text-4xl" style={{ color: C.ink, ...font }}>
          Tools that get out of your way
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed" style={{ color: C.sub }}>
          PDF24X exists to make everyday file tasks — merging, converting, compressing, organizing — fast, free, and frustration-free. We believe useful tools shouldn't come with sign-up walls, hidden fees, or your data as the price of admission.
        </p>
      </header>

      <section className="mt-14 rounded-2xl bg-white p-7 sm:p-10" style={{ border: `1px solid ${C.line}`, boxShadow: shadow }}>
        <h2 className="text-xl font-extrabold sm:text-2xl" style={{ color: C.ink, ...font }}>Why we built this</h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed sm:text-base" style={{ color: C.sub }}>
          <p>We kept running into the same problem: needing to merge a couple of PDFs, or shrink one down to email it, and ending up on a site cluttered with ads, asking us to create an account just to download a file we already had the rights to.</p>
          <p>So we started building the tool we actually wanted to use — no clutter, no accounts, no catch. PDF24X is the result: a growing collection of simple, fast tools for PDFs, images, and more, built one tool at a time.</p>
          <p>Every tool on PDF24X is free to use, works without sign-up, and doesn't store your files after processing. That's not a marketing claim — it's how we built the backend from the start.</p>
        </div>
      </section>

      <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {VALUES.map(({ icon: Icon, color, tint, title, desc }) => (
          <div key={title} className="rounded-2xl bg-white p-6" style={{ border: `1px solid ${C.line}`, boxShadow: shadow }}>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: tint }}>
              <Icon size={22} style={{ color }} />
            </span>
            <h3 className="mt-4 text-base font-bold" style={{ color: C.ink }}>{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed" style={{ color: C.sub }}>{desc}</p>
          </div>
        ))}
      </section>

      <div className="mt-10 text-center">
        <Link href="/tools" className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5" style={{ background: C.brand, borderColor: C.line, boxShadow: shadow }}>
          Explore All Tools <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
