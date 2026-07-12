"use client";
import Link from "next/link";
import { AdUnit } from "@/components/ads/AdUnit";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  FileText, Image as ImageIcon, Minimize2, GitMerge, Split, FileImage,
  Heart, ShieldCheck, Sparkles, Shield, ChevronRight, Search, X,
  Zap, Globe, Download, LayoutGrid, Code2, BookOpen, Music, Video,
  RotateCw, Unlock, Droplets, Crop, Grid3x3, FileSpreadsheet, Code,
  CheckCircle2, ArrowRight, Mail,
} from "lucide-react";

const C = {
  cream: "#f4f1ea", surface: "#ffffff", line: "#1c1c1c",
  ink: "#1a1a1a", sub: "#6b6760", brand: "#FF6B5E",
  redsoft: "#ffe7e3", banner: "#F5C84B",
  shadow: "3px 3px 0 0 #1c1c1c", shadowLift: "6px 6px 0 0 #1c1c1c",
};

const HERO_WORDS = ["PDF", "Image", "Developers", "Publishers", "Creators"];
const HERO_BADGES = ["100% Free", "No Sign Up", "Secure & Private"];
const FEATURE_CHIPS = [
  { label: "Easy to Use", icon: Heart },
  { label: "No Installation", icon: ShieldCheck },
  { label: "Unlimited Access", icon: Sparkles },
  { label: "100% Secure", icon: Shield },
];

const CATEGORIES = [
  { icon: FileText, color: "#EE4B3C", tint: "#ffe7e3", title: "PDF Converter", desc: "Convert PDF to Word, Excel, JPG and more.", path: "/tools#pdf-tools" },
  { icon: ImageIcon, color: "#27AE60", tint: "#E4F5EC", title: "Image Converter", desc: "Convert images to and from different formats.", path: "/tools#image-tools" },
  { icon: Code2, color: "#7B61FF", tint: "#ECE7FF", title: "Developer Tools", desc: "Format, encode, decode and minify code.", path: "/tools#developer-tools" },
  { icon: BookOpen, color: "#F2994A", tint: "#FCEEDD", title: "Publisher Tools", desc: "Tools for writers and content creators.", path: "/tools#publisher-tools" },
  { icon: Music, color: "#EC4899", tint: "#FCE4EF", title: "YouTube to MP3", desc: "Convert YouTube videos to MP3.", path: "/tools#publisher-tools" },
  { icon: Video, color: "#3B82F6", tint: "#E5EEFC", title: "Video Downloader", desc: "Download videos from YouTube and more.", path: "/tools#publisher-tools" },
  { icon: Download, color: "#E60023", tint: "#FDE6E9", title: "Pinterest Downloader", desc: "Download Pinterest videos and images.", path: "/tools#publisher-tools" },
  { icon: LayoutGrid, color: "#F2C94C", tint: "#FCF4DA", title: "All Tools", desc: "Browse all 200+ free tools.", path: "/tools" },
];

const HIGHLY_USED = [
  { icon: FileText, color: "#EE4B3C", tint: "#ffe7e3", title: "PDF to Word", desc: "Turn PDFs into fully editable Word documents.", path: "/tools/pdf-to-word", badge: "#1 Pick" },
  { icon: ImageIcon, color: "#27AE60", tint: "#E4F5EC", title: "Image to PDF", desc: "Combine JPG, PNG or HEIC images into one PDF.", path: "/tools/image-to-pdf", badge: "Trending" },
  { icon: Minimize2, color: "#3B82F6", tint: "#E5EEFC", title: "Compress PDF", desc: "Shrink file size without losing quality.", path: "/tools/compress", badge: "Most Popular" },
  { icon: GitMerge, color: "#F2994A", tint: "#FCEEDD", title: "Merge PDF", desc: "Combine multiple PDFs into a single file.", path: "/tools/merge", badge: "Editor's Pick" },
  { icon: Split, color: "#7B61FF", tint: "#ECE7FF", title: "Split PDF", desc: "Pull specific pages out into new PDFs.", path: "/tools/split", badge: "Trending" },
  { icon: FileImage, color: "#EC4899", tint: "#FCE4EF", title: "PDF to JPG", desc: "Export every page as a high-quality image.", path: "/tools/pdf-to-jpg", badge: "Most Popular" },
];

const MORE_TOOLS = [
  { icon: RotateCw, color: "#EE4B3C", tint: "#ffe7e3", title: "Rotate PDF", desc: "Rotate pages of your PDF file.", path: "/tools" },
  { icon: Unlock, color: "#3B82F6", tint: "#E5EEFC", title: "Unlock PDF", desc: "Remove password from secured PDF.", path: "/tools" },
  { icon: ShieldCheck, color: "#27AE60", tint: "#E4F5EC", title: "Protect PDF", desc: "Add password protection to PDF file.", path: "/tools" },
  { icon: Droplets, color: "#EC4899", tint: "#FCE4EF", title: "Watermark PDF", desc: "Add text or image watermark to PDF.", path: "/tools" },
  { icon: Crop, color: "#F2994A", tint: "#FCEEDD", title: "Crop PDF", desc: "Crop pages of your PDF file.", path: "/tools" },
  { icon: Grid3x3, color: "#7B61FF", tint: "#ECE7FF", title: "Organize PDF", desc: "Reorder, add or remove pages in PDF.", path: "/tools" },
  { icon: FileSpreadsheet, color: "#27AE60", tint: "#E4F5EC", title: "PDF to Excel", desc: "Extract tables from PDF to Excel.", path: "/tools/pdf-to-excel" },
  { icon: Code, color: "#EE4B3C", tint: "#ffe7e3", title: "HTML to PDF", desc: "Convert web pages to PDF.", path: "/tools" },
];

const WHAT_CHECKS = [
  "200+ Tools for PDF, Image, Video & More",
  "No sign up or installation required",
  "Files are automatically deleted after processing",
  "Regularly updated with new tools",
];

const ALL_SEARCH_TOOLS = [...HIGHLY_USED, ...MORE_TOOLS];

const card = { border: `1px solid ${C.line}`, background: C.surface, boxShadow: C.shadow, borderRadius: 12 };
const font = (family = "Archivo") => ({ fontFamily: `${family}, Inter, sans-serif` });

function TypingText({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[index];
    let t: ReturnType<typeof setTimeout>;
    if (!deleting && displayed.length < word.length) t = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
    else if (!deleting && displayed.length === word.length) t = setTimeout(() => setDeleting(true), 1800);
    else if (deleting && displayed.length > 0) t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 45);
    else { setDeleting(false); setIndex(i => (i + 1) % words.length); }
    return () => clearTimeout(t);
  }, [displayed, deleting, index, words]);
  return <span className="inline-block min-w-[2ch]">{displayed}<span className="animate-pulse" style={{ color: C.ink }}>|</span></span>;
}

function SearchBar() {
  const [query, setQuery] = useState("");
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const matches = query.trim().length > 0 ? ALL_SEARCH_TOOLS.filter(t => t.title.toLowerCase().includes(query.trim().toLowerCase())) : [];
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setShow(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative mt-6 w-full max-w-lg">
      <div className="flex w-full items-center rounded-xl bg-white p-1.5" style={{ border: `1px solid ${C.line}`, boxShadow: C.shadow }}>
        <Search size={18} className="ml-2 shrink-0" style={{ color: C.sub }} />
        <input ref={inputRef} value={query} onChange={e => { setQuery(e.target.value); setShow(true); }} onFocus={() => query && setShow(true)}
          placeholder="Search any tool you need..." className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm" style={{ color: C.ink, outline: "none" }} />
        {query && <button type="button" onClick={() => { setQuery(""); setShow(false); inputRef.current?.focus(); }} className="shrink-0 p-1.5" style={{ color: C.sub }}><X size={16} /></button>}
        <button type="button" className="shrink-0 rounded-lg p-2.5 text-white" style={{ background: C.brand }} aria-label="Search"><Search size={18} /></button>
      </div>
      {show && matches.length > 0 && (
        <ul className="absolute left-0 top-full z-30 mt-2 w-full overflow-hidden rounded-xl bg-white" style={{ border: `1px solid ${C.line}`, boxShadow: C.shadow }}>
          {matches.slice(0, 6).map(tool => (
            <li key={tool.title}>
              <Link href={tool.path} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#f4f1ea]" style={{ color: C.ink }}>
                <tool.icon size={16} style={{ color: tool.color }} />{tool.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {show && query.trim() && matches.length === 0 && (
        <div className="absolute left-0 top-full z-30 mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm" style={{ color: C.sub, border: `1px solid ${C.line}`, boxShadow: C.shadow }}>
          No matching tools found for "{query}"
        </div>
      )}
    </div>
  );
}

export default function HomeClient() {
  return (
    <div style={{ background: C.cream }}>
      {/* ── Hero ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 pb-8 pt-10 sm:pt-14 md:grid-cols-2 md:gap-10">
          <div>
            <div className="mb-5 flex flex-wrap gap-2">
              {HERO_BADGES.map(b => (
                <span key={b} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium" style={{ border: `1px solid ${C.line}`, color: C.sub }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: C.brand }} />{b}
                </span>
              ))}
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl" style={{ color: C.ink, ...font() }}>All-in-One</h1>
            <div className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl" style={{ color: C.brand, ...font() }}>
              <TypingText words={HERO_WORDS} />
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl" style={{ color: C.ink, ...font() }}>Tools Suite</h1>
            <p className="mt-4 max-w-lg text-base sm:text-lg" style={{ color: C.sub }}>
              Your free, fast and secure platform to convert, edit, compress, merge, split PDF files and much more.
            </p>
            <SearchBar />
            <div className="mt-5 flex flex-wrap gap-2">
              {FEATURE_CHIPS.map(({ label, icon: Icon }) => (
                <span key={label} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium" style={{ border: `1px solid ${C.line}`, color: C.sub }}>
                  <Icon size={13} style={{ color: C.brand }} />{label}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 sm:p-8" style={{ border: `1px solid ${C.line}`, boxShadow: C.shadow }}>
            <Image src="/hero.png" alt="PDF24X tools illustration" width={600} height={400} className="w-full rounded-xl object-contain" priority />
            <h3 className="mt-6 text-lg font-bold" style={{ color: C.ink, ...font() }}>Powerful Tools. Simple Interface.</h3>
            <p className="mt-1 text-sm" style={{ color: C.sub }}>All tools you need in one place. 100% free forever.</p>
          </div>
        </div>
      </section>

      {/* ── Ad slot ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <AdUnit slot="YOUR_AD_SLOT_1" format="horizontal" className="min-h-[90px] bg-[#f4f1ea]" />
      </div>

      {/* ── Categories ── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2">
          <span className="text-xl">📂</span>
          <h2 className="text-2xl font-extrabold sm:text-3xl" style={{ color: C.ink, ...font() }}>Browse by Category</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map(cat => (
            <Link key={cat.title} href={cat.path} className="group flex flex-col gap-3 rounded-2xl bg-white p-5 transition-all hover:-translate-y-1" style={{ border: `1px solid ${C.line}`, boxShadow: C.shadow }}>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: cat.tint }}>
                <cat.icon size={22} style={{ color: cat.color }} />
              </span>
              <div>
                <p className="text-sm font-bold" style={{ color: C.ink }}>{cat.title}</p>
                <p className="mt-0.5 text-xs" style={{ color: C.sub }}>{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Highly Used ── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <h2 className="text-2xl font-extrabold sm:text-3xl" style={{ color: C.ink, ...font() }}>Highly Used Tools</h2>
          </div>
          <Link href="/tools" className="text-sm font-semibold" style={{ color: C.brand }}>View all →</Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HIGHLY_USED.map(tool => (
            <Link key={tool.title} href={tool.path} className="group flex items-start gap-4 rounded-2xl bg-white p-5 transition-all hover:-translate-y-1" style={{ border: `1px solid ${C.line}`, boxShadow: C.shadow }}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: tool.tint }}>
                <tool.icon size={22} style={{ color: tool.color }} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold" style={{ color: C.ink }}>{tool.title}</p>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: C.redsoft, color: C.brand }}>{tool.badge}</span>
                </div>
                <p className="mt-1 text-xs" style={{ color: C.sub }}>{tool.desc}</p>
              </div>
              <ChevronRight size={16} className="shrink-0 transition-transform group-hover:translate-x-1" style={{ color: C.sub }} />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Ad slot ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <AdUnit slot="YOUR_AD_SLOT_2" format="horizontal" className="min-h-[90px] bg-[#f4f1ea]" />
      </div>

      {/* ── More Tools ── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2">
          <span className="text-xl">🧰</span>
          <h2 className="text-2xl font-extrabold sm:text-3xl" style={{ color: C.ink, ...font() }}>More Tools to Explore</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MORE_TOOLS.map(tool => (
            <Link key={tool.title} href={tool.path} className="group rounded-2xl bg-white p-5 transition-all hover:-translate-y-1" style={{ border: `1px solid ${C.line}`, boxShadow: C.shadow }}>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: tool.tint }}>
                <tool.icon size={21} style={{ color: tool.color }} />
              </span>
              <h3 className="mt-4 text-base font-bold" style={{ color: C.ink }}>{tool.title}</h3>
              <p className="mt-1.5 text-sm leading-snug" style={{ color: C.sub }}>{tool.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: C.brand }}>
                Use Tool <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── What Is + Newsletter ── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* What Is */}
          <div className="rounded-2xl bg-white p-6 sm:p-8" style={{ border: `1px solid ${C.line}`, boxShadow: C.shadow }}>
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="w-full shrink-0 sm:w-32">
                <Image src="/what-is.png" alt="What is PDF24X" width={128} height={170} className="w-full rounded-xl object-contain" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold" style={{ color: C.ink, ...font() }}>What is PDF24X?</h2>
                <p className="mt-2 text-sm" style={{ color: C.sub }}>
                  PDF24X is a free online platform that offers a wide range of PDF, image, video and developer tools. Our mission is to provide easy-to-use, fast and secure tools for everyone.
                </p>
                <ul className="mt-4 space-y-2.5">
                  {WHAT_CHECKS.map(c => (
                    <li key={c} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 size={17} className="mt-0.5 shrink-0" style={{ color: "#27AE60" }} />
                      <span style={{ color: C.ink }}>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* Newsletter */}
          <div className="rounded-2xl bg-white p-6 sm:p-8" style={{ border: `1px solid ${C.line}`, boxShadow: C.shadow }}>
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: C.redsoft }}>
                <Mail size={20} style={{ color: C.brand }} />
              </span>
              <div>
                <h3 className="text-lg font-extrabold" style={{ color: C.ink, ...font() }}>Stay Updated</h3>
                <p className="mt-1 text-sm" style={{ color: C.sub }}>Get tips, tool updates and helpful content straight to your inbox.</p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input placeholder="Enter your email address" className="flex-1 rounded-lg px-4 py-2.5 text-sm outline-none" style={{ border: `1px solid ${C.line}`, background: C.cream, color: C.ink }} />
              <button className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white" style={{ background: C.brand }}>Subscribe</button>
            </div>
            <p className="mt-3 text-xs" style={{ color: C.sub }}>No spam, unsubscribe anytime.</p>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="relative mb-12 mt-10 overflow-hidden rounded-2xl px-6 py-10 text-center sm:px-10 sm:py-14" style={{ background: C.banner, border: `1px solid ${C.line}`, boxShadow: C.shadow }}>
          <div className="pointer-events-none absolute -left-6 -top-6 h-28 w-28 rotate-12 rounded-2xl bg-black/10" />
          <div className="pointer-events-none absolute -bottom-8 -right-6 h-32 w-44 -rotate-6 rounded-2xl bg-black/5" />
          <div className="relative">
            <h2 className="text-2xl font-extrabold sm:text-4xl" style={{ color: C.ink, ...font() }}>Powerful Tools. 100% Free.</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base" style={{ color: "#1A1A1A", opacity: 0.8 }}>Everything you need to work with PDFs and more — in one place.</p>
            <Link href="/tools" className="mt-6 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5" style={{ background: C.ink }}>
              Explore All Tools <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
