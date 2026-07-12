"use client";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

const C = { ink: "#1a1a1a", sub: "#6b6760", brand: "#FF6B5E", line: "#1c1c1c", surface: "#ffffff", cream: "#f4f1ea" };
const shadow = "3px 3px 0 0 #1c1c1c";

export default function ProtectPdfClient() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ background: "#E4F5EC", border: `1px solid ${C.line}`, boxShadow: shadow }}>
          <ShieldCheck size={26} style={{ color: "#27AE60" }} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl" style={{ color: C.ink, fontFamily: "Archivo, Inter, sans-serif" }}>Protect PDF</h1>
          <p className="mt-1 text-sm sm:text-base" style={{ color: C.sub }}>Add password protection to your PDF file.</p>
        </div>
      </div>
      <div className="rounded-2xl p-8 text-center" style={{ border: `1px solid ${C.line}`, background: C.surface, boxShadow: shadow }}>
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "#E4F5EC" }}>
          <ShieldCheck size={24} style={{ color: "#27AE60" }} />
        </span>
        <p className="text-base font-bold" style={{ color: C.ink }}>Coming Soon</p>
        <p className="mt-2 text-sm max-w-sm mx-auto" style={{ color: C.sub }}>
          PDF password protection requires server-side processing. This feature is coming soon. 
          In the meantime, you can use our other PDF tools.
        </p>
        <Link href="/tools" className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white"
          style={{ background: C.brand, border: `1px solid ${C.line}`, boxShadow: shadow }}>
          Explore All Tools
        </Link>
      </div>
    </div>
  );
}
