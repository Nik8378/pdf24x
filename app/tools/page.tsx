import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText, Image as ImageIcon, Minimize2, GitMerge, Split, FileImage,
  RotateCw, Unlock, ShieldCheck, Droplets, Crop, Grid3x3, FileSpreadsheet,
  Code, ImagePlay, Palette, BookOpen, Code2, Braces, Link as LinkIcon,
  Paintbrush, Binary, KeyRound, Search, Mic, Globe,
} from "lucide-react";

export const metadata: Metadata = {
  title: "All Tools | PDF24X — Free Online PDF & Developer Tools",
  description: "Browse all 200+ free online tools — PDF converter, image tools, developer utilities and more. No sign up, no installs.",
  alternates: { canonical: "https://pdf24x.com/tools" },
};

const C = { ink: "#1a1a1a", sub: "#6b6760", brand: "#FF6B5E", line: "#1c1c1c", surface: "#ffffff", cream: "#f4f1ea" };
const shadow = "3px 3px 0 0 #1c1c1c";
const font = { fontFamily: "Archivo, Inter, sans-serif" };

const TOOL_CATEGORIES = [
  {
    title: "PDF Tools",
    emoji: "📄",
    tools: [
      { icon: ImageIcon, color: "#EE4B3C", tint: "#ffe7e3", name: "Image to PDF", desc: "Convert JPG, PNG, WEBP images to PDF", href: "/tools/image-to-pdf" },
      { icon: Minimize2, color: "#3B82F6", tint: "#E5EEFC", name: "Compress PDF", desc: "Reduce PDF file size significantly", href: "/tools/compress" },
      { icon: GitMerge, color: "#F2994A", tint: "#FCEEDD", name: "Merge PDF", desc: "Combine multiple PDFs into one file", href: "/tools/merge" },
      { icon: Split, color: "#7B61FF", tint: "#ECE7FF", name: "Split PDF", desc: "Extract or split PDF pages easily", href: "/tools/split" },
      { icon: FileImage, color: "#EC4899", tint: "#FCE4EF", name: "PDF to JPG", desc: "Convert PDF pages to JPG images", href: "/tools/pdf-to-jpg" },
      { icon: FileText, color: "#EE4B3C", tint: "#ffe7e3", name: "PDF to Word", desc: "Convert PDF to editable Word document", href: "/tools/pdf-to-word" },
      { icon: FileSpreadsheet, color: "#27AE60", tint: "#E4F5EC", name: "Excel to PDF", desc: "Convert Excel spreadsheets to PDF", href: "/tools/excel-to-pdf" },
      { icon: FileSpreadsheet, color: "#0EA5E9", tint: "#E0F2FE", name: "PDF to Excel", desc: "Extract tables from PDF to Excel", href: "/tools/pdf-to-excel" },
      { icon: RotateCw, color: "#EE4B3C", tint: "#ffe7e3", name: "Rotate PDF", desc: "Rotate pages of your PDF file", href: "/tools" },
      { icon: Unlock, color: "#3B82F6", tint: "#E5EEFC", name: "Unlock PDF", desc: "Remove password from secured PDF", href: "/tools" },
      { icon: ShieldCheck, color: "#27AE60", tint: "#E4F5EC", name: "Protect PDF", desc: "Add password protection to PDF", href: "/tools" },
      { icon: Droplets, color: "#EC4899", tint: "#FCE4EF", name: "Watermark PDF", desc: "Add text or image watermark to PDF", href: "/tools" },
    ],
  },
  {
    title: "Image Tools",
    emoji: "🖼️",
    tools: [
      { icon: ImagePlay, color: "#EC4899", tint: "#FCE4EF", name: "Image to WebP", desc: "Convert any image format to WebP", href: "/tools/image-to-webp" },
      { icon: Palette, color: "#7B61FF", tint: "#ECE7FF", name: "Image to Favicon", desc: "Convert any image to favicon.ico", href: "/tools/image-to-favicon" },
    ],
  },
  {
    title: "Developer Tools",
    emoji: "💻",
    tools: [
      { icon: Braces, color: "#F2994A", tint: "#FCEEDD", name: "JSON Formatter", desc: "Format and validate JSON data", href: "/tools/json-formatter" },
      { icon: Binary, color: "#3B82F6", tint: "#E5EEFC", name: "Base64 Encoder", desc: "Encode and decode Base64 strings", href: "/tools/base64-encoder" },
      { icon: LinkIcon, color: "#27AE60", tint: "#E4F5EC", name: "URL Encoder", desc: "Encode and decode URLs", href: "/tools/url-encoder" },
      { icon: Code2, color: "#EE4B3C", tint: "#ffe7e3", name: "HTML Formatter", desc: "Format and beautify HTML code", href: "/tools/html-formatter" },
      { icon: Paintbrush, color: "#7B61FF", tint: "#ECE7FF", name: "CSS Minifier", desc: "Minify CSS for production", href: "/tools/css-minifier" },
      { icon: Search, color: "#EC4899", tint: "#FCE4EF", name: "Regex Tester", desc: "Test regular expressions", href: "/tools/regex-tester" },
      { icon: KeyRound, color: "#F2994A", tint: "#FCEEDD", name: "JWT Decoder", desc: "Decode and inspect JWT tokens", href: "/tools/jwt-decoder" },
    ],
  },
  {
    title: "Publisher Tools",
    emoji: "📚",
    tools: [
      { icon: BookOpen, color: "#F2994A", tint: "#FCEEDD", name: "ISBN Converter", desc: "Convert between ISBN-10 and ISBN-13", href: "/tools/isbn-converter" },
    ],
  },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" style={{ background: C.cream }}>
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold sm:text-4xl" style={{ color: C.ink, ...font }}>All Tools</h1>
        <p className="mt-3 text-base" style={{ color: C.sub }}>200+ free tools for PDF, images, and developers. No sign up, no installs.</p>
      </div>

      <div className="space-y-12">
        {TOOL_CATEGORIES.map(cat => (
          <section key={cat.title} id={cat.title.toLowerCase().replace(/ /g, "-")}>
            <div className="mb-6 flex items-center gap-2">
              <span className="text-xl">{cat.emoji}</span>
              <h2 className="text-xl font-extrabold sm:text-2xl" style={{ color: C.ink, ...font }}>{cat.title}</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {cat.tools.map(tool => (
                <Link key={tool.name} href={tool.href} className="group rounded-2xl bg-white p-5 transition-all hover:-translate-y-1" style={{ border: `1px solid ${C.line}`, boxShadow: shadow }}>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: tool.tint }}>
                    <tool.icon size={21} style={{ color: tool.color }} />
                  </span>
                  <h3 className="mt-4 text-base font-bold" style={{ color: C.ink }}>{tool.name}</h3>
                  <p className="mt-1.5 text-sm leading-snug" style={{ color: C.sub }}>{tool.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
