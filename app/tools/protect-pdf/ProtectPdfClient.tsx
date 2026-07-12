"use client";
import Link from "next/link";
import { Clock } from "lucide-react";
const C = { ink: "#1a1a1a", sub: "#6b6760", brand: "#FF6B5E", line: "#1c1c1c", surface: "#ffffff" };
const shadow = "3px 3px 0 0 #1c1c1c";
export default function Client() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "#E4F5EC", border: `1px solid ${C.line}`, boxShadow: shadow }}>
        <Clock size={28} style={{ color: "#27AE60" }} />
      </span>
      <h1 className="text-3xl font-extrabold sm:text-4xl" style={{ color: C.ink, fontFamily: "Archivo, Inter, sans-serif" }}>Protect PDF</h1>
      <p className="mx-auto mt-4 max-w-md text-sm sm:text-base" style={{ color: C.sub }}>Adding password protection to PDFs requires server-side encryption. This tool is coming soon.</p>
      <div className="mx-auto mt-8 max-w-sm rounded-2xl bg-white p-8" style={{ border: `1px solid ${C.line}`, boxShadow: shadow }}>
        <p className="text-sm font-bold" style={{ color: C.ink }}>Coming Soon</p>
        <p className="mt-2 text-xs" style={{ color: C.sub }}>This feature requires server-side processing and will be available soon.</p>
        <Link href="/tools" className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white" style={{ background: C.brand, border: `1px solid ${C.line}`, boxShadow: shadow }}>
          Explore All Tools
        </Link>
      </div>
    </div>
  );
}
