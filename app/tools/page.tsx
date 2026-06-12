import React from "react";
import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Image, Minimize2, Link2, Scissors, Layers, ImagePlay, Shield, Zap,
  Lock, ImageIcon, BookOpen, Braces, Code2, Link as LinkIcon, Code,
  Paintbrush, Regex, KeyRound, FileSpreadsheet, ArrowRight, Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "All PDF, Image & Developer Tools – Free Online Tools",
  description:
    "Free online tools: image to PDF, compress PDF, merge PDF, split PDF, PDF to JPG, image to WebP, favicon generator, ISBN converter, JSON formatter, Base64 encoder, URL encoder, HTML formatter, CSS minifier, Regex tester, JWT decoder. All browser-based.",
  alternates: { canonical: "https://pdf24x.com/tools" },
};

const pdfTools = [
  { name: "Image to PDF",      desc: "Convert JPG, PNG, WEBP images to PDF",         icon: Image,           href: "/",                       color: "bg-orange-50 text-orange-500" },
  { name: "Compress PDF",      desc: "Reduce PDF file size significantly",             icon: Minimize2,       href: "/tools/compress",          color: "bg-blue-50 text-blue-500" },
  { name: "Merge PDF",         desc: "Combine multiple PDFs into one file",            icon: Link2,           href: "/tools/merge",             color: "bg-purple-50 text-purple-500" },
  { name: "Split PDF",         desc: "Extract or split PDF pages easily",              icon: Scissors,        href: "/tools/split",             color: "bg-green-50 text-green-500" },
  { name: "PDF to JPG",        desc: "Convert PDF pages to JPG images",                icon: Layers,          href: "/tools/pdf-to-jpg",        color: "bg-yellow-50 text-yellow-600" },
  { name: "Excel to PDF",      desc: "Convert Excel spreadsheets to PDF",              icon: FileSpreadsheet, href: "/tools/excel-to-pdf",      color: "bg-emerald-50 text-emerald-500" },
  { name: "PDF to Excel",      desc: "Extract tables from PDF to Excel",               icon: FileSpreadsheet, href: "/tools/pdf-to-excel",      color: "bg-teal-50 text-teal-500" },
];

const imageTools = [
  { name: "Image to WebP",     desc: "Convert any image format to WebP",              icon: ImagePlay,       href: "/tools/image-to-webp",     color: "bg-pink-50 text-pink-500" },
  { name: "Image to Favicon",  desc: "Convert any image to favicon.ico",              icon: ImageIcon,       href: "/tools/image-to-favicon",  color: "bg-indigo-50 text-indigo-500" },
];

const bookTools = [
  { name: "ISBN Converter",    desc: "Convert ISBN-10 to ISBN-13 and vice versa",     icon: BookOpen,        href: "/tools/isbn-converter",    color: "bg-amber-50 text-amber-600" },
];

const devTools = [
  { name: "JSON Formatter",    desc: "Format, validate and minify JSON",               icon: Braces,          href: "/tools/json-formatter",    color: "bg-blue-50 text-blue-600" },
  { name: "Base64 Encoder",    desc: "Encode or decode Base64 text and images",        icon: Code2,           href: "/tools/base64-encoder",    color: "bg-violet-50 text-violet-500" },
  { name: "URL Encoder",       desc: "Encode or decode URLs and query strings",        icon: LinkIcon,        href: "/tools/url-encoder",       color: "bg-cyan-50 text-cyan-600" },
  { name: "HTML Formatter",    desc: "Beautify or minify HTML code",                   icon: Code,            href: "/tools/html-formatter",    color: "bg-orange-50 text-orange-500" },
  { name: "CSS Minifier",      desc: "Minify or format CSS files",                     icon: Paintbrush,      href: "/tools/css-minifier",      color: "bg-pink-50 text-pink-500" },
  { name: "Regex Tester",      desc: "Test regex with live match highlighting",        icon: Regex,           href: "/tools/regex-tester",      color: "bg-green-50 text-green-600" },
  { name: "JWT Decoder",       desc: "Decode and inspect JSON Web Tokens",             icon: KeyRound,        href: "/tools/jwt-decoder",       color: "bg-red-50 text-red-500" },
];

function ToolCard({ tool }: { tool: typeof pdfTools[0] }) {
  return (
    <a href={tool.href}
      className="group bg-white border border-[#1a1917]/8 rounded-2xl p-4 sm:p-5 hover:border-accent/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 block relative overflow-hidden">
      {/* Subtle gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl" />
      <div className="relative">
        <div className={`w-10 h-10 ${tool.color} rounded-xl flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110`}>
          <tool.icon size={18} strokeWidth={1.8} />
        </div>
        <h3 className="text-[13.5px] font-bold text-[#1a1917] mb-1 group-hover:text-accent transition-colors">{tool.name}</h3>
        <p className="text-[12px] text-[#7a7875] leading-relaxed">{tool.desc}</p>
        <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0">
          <span className="text-[11.5px] font-semibold text-accent">Use tool</span>
          <ArrowRight size={11} className="text-accent" />
        </div>
      </div>
    </a>
  );
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex items-center gap-2">
        <h2 className="text-[15px] font-bold text-[#1a1917]">{title}</h2>
        <span className="text-[11px] font-bold text-accent bg-accent-bg border border-accent/20 rounded-full px-2 py-0.5">{count}</span>
      </div>
      <div className="flex-1 h-px bg-[#e5e3de]" />
    </div>
  );
}

export default function ToolsPage() {
  return (
    <div className="w-full flex gap-0 items-start">
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-10">

        {/* ── Hero Section ──────────────────────────── */}
        <div className="relative bg-[#1a1917] rounded-2xl px-6 py-8 mb-6 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-accent" />
                <span className="text-[11px] font-bold text-accent uppercase tracking-widest">All Tools</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Free Online Tools
              </h1>
              <p className="text-[13px] text-white/60 max-w-md">
                17 powerful browser-based tools. No uploads, no sign-ups, no watermarks — ever.
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {[
                { icon: Lock, text: "Files stay on device" },
                { icon: Shield, text: "No sign-up required" },
                { icon: Zap, text: "100% Free" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon size={12} className="text-green-400" />
                  <span className="text-[12px] text-white/70">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* ── PDF Tools ─────────────────────────────── */}
        <SectionHeader title="PDF Tools" count={pdfTools.length} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-8">
          {pdfTools.map(tool => <ToolCard key={tool.name} tool={tool} />)}
        </div>

        <div className="mb-8" />

        {/* ── Image Tools ───────────────────────────── */}
        <SectionHeader title="Image Tools" count={imageTools.length} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-8">
          {imageTools.map(tool => <ToolCard key={tool.name} tool={tool} />)}
        </div>

        {/* ── Book & ISBN ───────────────────────────── */}
        <SectionHeader title="Book & ISBN" count={bookTools.length} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-8">
          {bookTools.map(tool => <ToolCard key={tool.name} tool={tool} />)}
        </div>

        <div className="mb-8" />

        {/* ── Developer Tools ───────────────────────── */}
        <SectionHeader title="Developer Tools" count={devTools.length} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-8">
          {devTools.map(tool => <ToolCard key={tool.name} tool={tool} />)}
        </div>

        {/* ── Privacy Banner ────────────────────────── */}
        <div className="bg-gradient-to-r from-[#1a1917] to-[#2d2c29] rounded-2xl px-6 py-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-[14px] font-bold text-white mb-1">100% Private by Design</p>
            <p className="text-[12.5px] text-white/60">All processing happens in your browser. Your files never touch our servers.</p>
          </div>
          <div className="flex items-center gap-1.5 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2 shrink-0">
            <Shield size={13} className="text-green-400" />
            <span className="text-[12.5px] text-green-300 font-semibold">Privacy First</span>
          </div>
        </div>


        {/* ── Coming Soon ───────────────────────────── */}
        <div className="bg-accent-bg border border-accent/20 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="text-[14px] font-bold text-accent mb-0.5">More tools coming soon</p>
            <p className="text-[12.5px] text-[#7a7875]">Word Counter, Image Compressor, Unit Converter and more are under development.</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Zap size={13} className="text-accent" />
            <span className="text-[12px] text-accent font-semibold">Stay tuned</span>
          </div>
        </div>

      </main>
    </div>
  );
}
