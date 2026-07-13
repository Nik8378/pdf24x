"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

const C = { ink: "#1a1a1a", sub: "#6b6760", brand: "#FF6B5E", line: "#1c1c1c", surface: "#ffffff", cream: "#f4f1ea" };
const shadow = "3px 3px 0 0 #1c1c1c";

interface Tool {
  name: string;
  desc: string;
  href: string;
  category: string;
  aliases: string;
  iconColor: string;
}

const SEARCHABLE_TOOLS: Tool[] = [
  { name: "Compress PDF", desc: "Reduce PDF file size", href: "/tools/compress", category: "PDF Tools", aliases: "compress reduce shrink smaller size email", iconColor: "#3B82F6" },
  { name: "Merge PDF", desc: "Combine multiple PDFs into one", href: "/tools/merge", category: "PDF Tools", aliases: "merge combine join together", iconColor: "#F2994A" },
  { name: "Split PDF", desc: "Extract or split PDF pages", href: "/tools/split", category: "PDF Tools", aliases: "split separate extract pages", iconColor: "#7B61FF" },
  { name: "PDF to JPG", desc: "Convert PDF pages to JPG images", href: "/tools/pdf-to-jpg", category: "PDF Tools", aliases: "pdf to jpg jpeg image pages to image convert", iconColor: "#EC4899" },
  { name: "Image to PDF", desc: "Convert JPG, PNG images to PDF", href: "/tools/image-to-pdf", category: "PDF Tools", aliases: "image jpg jpeg png photo picture images to pdf convert", iconColor: "#27AE60" },
  { name: "Rotate PDF", desc: "Rotate PDF pages online", href: "/tools/rotate-pdf", category: "PDF Tools", aliases: "rotate orientation sideways upside down flip", iconColor: "#EE4B3C" },
  { name: "Watermark PDF", desc: "Add text watermark to PDF", href: "/tools/watermark-pdf", category: "PDF Tools", aliases: "watermark stamp confidential draft text mark", iconColor: "#EC4899" },
  { name: "Unlock PDF", desc: "Remove PDF password protection", href: "/tools/unlock-pdf", category: "PDF Tools", aliases: "unlock password remove password protected decrypt", iconColor: "#3B82F6" },
  { name: "Excel to PDF", desc: "Convert Excel spreadsheets to PDF", href: "/tools/excel-to-pdf", category: "PDF Tools", aliases: "excel xlsx xls spreadsheet convert", iconColor: "#27AE60" },
  { name: "PDF to Excel", desc: "Extract tables from PDF to Excel", href: "/tools/pdf-to-excel", category: "PDF Tools", aliases: "pdf excel xlsx tables extract", iconColor: "#0EA5E9" },
  { name: "Image to WebP", desc: "Convert images to WebP format", href: "/tools/image-to-webp", category: "Image Tools", aliases: "image webp convert optimize compress jpg png", iconColor: "#EC4899" },
  { name: "Image to Favicon", desc: "Convert image to favicon.ico", href: "/tools/image-to-favicon", category: "Image Tools", aliases: "favicon ico image convert icon browser tab", iconColor: "#7B61FF" },
  { name: "JSON Formatter", desc: "Format and validate JSON", href: "/tools/json-formatter", category: "Developer Tools", aliases: "json format validate beautify pretty print", iconColor: "#F2994A" },
  { name: "Base64 Encoder", desc: "Encode and decode Base64", href: "/tools/base64-encoder", category: "Developer Tools", aliases: "base64 encode decode string binary", iconColor: "#3B82F6" },
  { name: "URL Encoder", desc: "Encode and decode URLs", href: "/tools/url-encoder", category: "Developer Tools", aliases: "url encode decode percent encoding uri", iconColor: "#27AE60" },
  { name: "HTML Formatter", desc: "Format and beautify HTML", href: "/tools/html-formatter", category: "Developer Tools", aliases: "html format beautify indent pretty print", iconColor: "#EE4B3C" },
  { name: "CSS Minifier", desc: "Minify CSS for production", href: "/tools/css-minifier", category: "Developer Tools", aliases: "css minify compress optimize production", iconColor: "#7B61FF" },
  { name: "Regex Tester", desc: "Test regular expressions", href: "/tools/regex-tester", category: "Developer Tools", aliases: "regex regexp regular expression test match pattern", iconColor: "#EC4899" },
  { name: "JWT Decoder", desc: "Decode and inspect JWT tokens", href: "/tools/jwt-decoder", category: "Developer Tools", aliases: "jwt token decode inspect auth authentication", iconColor: "#F2994A" },
  { name: "ISBN Converter", desc: "Convert between ISBN-10 and ISBN-13", href: "/tools/isbn-converter", category: "Publisher Tools", aliases: "isbn book convert 10 13 publisher", iconColor: "#F2994A" },
];

export default function ToolSearch() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase().replace(/\s+/g, " ");
  const results = q.length > 0
    ? SEARCHABLE_TOOLS.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.aliases.toLowerCase().includes(q)
      )
    : [];

  const hasQuery = query.trim().length > 0;

  return (
    <div className="mb-6">
      {/* Search input */}
      <div className="relative max-w-xl">
        <label htmlFor="tool-search" className="sr-only">Search tools</label>
        <div className="flex items-center rounded-xl bg-white" style={{ border: `1px solid ${C.line}`, boxShadow: shadow }}>
          <Search size={17} className="ml-3 shrink-0" style={{ color: C.sub }} aria-hidden="true" />
          <input
            ref={inputRef}
            id="tool-search"
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tools — compress, merge, json, base64..."
            aria-label="Search tools"
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm"
            style={{ color: C.ink, outline: "none" }}
          />
          {hasQuery && (
            <button
              type="button"
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              aria-label="Clear search"
              className="mr-2 flex h-6 w-6 items-center justify-center rounded-md"
              style={{ color: C.sub }}
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {hasQuery && (
        <div className="mt-4">
          {results.length > 0 ? (
            <>
              <p className="mb-3 text-xs" style={{ color: C.sub }}>
                {results.length} result{results.length !== 1 ? "s" : ""} for &quot;{query.trim()}&quot;
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {results.map(tool => (
                  <Link key={tool.href} href={tool.href}
                    className="flex items-center gap-3 rounded-xl bg-white p-4 transition-all hover:-translate-y-0.5"
                    style={{ border: `1px solid ${C.line}`, boxShadow: shadow }}>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                      style={{ background: tool.iconColor }}>
                      {tool.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold" style={{ color: C.ink }}>{tool.name}</p>
                      <p className="text-xs" style={{ color: C.sub }}>{tool.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm" style={{ color: C.sub }}>
              No tools found for &quot;{query.trim()}&quot;. Browse the categories below.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
