"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Image, Minimize2, Link2, Scissors, Layers, ImagePlay, ImageIcon,
  FileText, BookOpen, Code2, ChevronDown, ChevronRight, FileSpreadsheet,
  Braces, Link as LinkIcon, Code, Paintbrush, Regex, KeyRound, GitCompareArrows,
} from "lucide-react";

const pdfLinks = [
  { name: "Image to PDF",   href: "/tools/image-to-pdf",    icon: Image },
  { name: "Compress PDF",   href: "/tools/compress",         icon: Minimize2 },
  { name: "Merge PDF",      href: "/tools/merge",            icon: Link2 },
  { name: "Split PDF",      href: "/tools/split",            icon: Scissors },
  { name: "PDF to JPG",     href: "/tools/pdf-to-jpg",       icon: Layers },
  { name: "Excel to PDF",   href: "/tools/excel-to-pdf",     icon: FileSpreadsheet },
  { name: "PDF to Excel",   href: "/tools/pdf-to-excel",     icon: FileSpreadsheet },
];

const imageLinks = [
  { name: "Image to WebP",    href: "/tools/image-to-webp",    icon: ImagePlay },
  { name: "Image to Favicon", href: "/tools/image-to-favicon",  icon: ImageIcon },
  { name: "Image to JPG",     href: "/tools/image-to-jpg",     icon: ImageIcon },
  { name: "Image to PNG",     href: "/tools/image-to-png",     icon: ImageIcon },
  { name: "Image Compressor", href: "/tools/image-compressor", icon: ImageIcon },
  { name: "Image Resizer",    href: "/tools/image-resizer",    icon: ImageIcon },
  { name: "Image Cropper",    href: "/tools/image-cropper",    icon: ImageIcon },
];

const bookLinks = [
  { name: "ISBN Converter", href: "/tools/isbn-converter", icon: BookOpen },
  { name: "ISBN Validator", href: "/tools/isbn-validator", icon: BookOpen },
  { name: "Duplicate ISBN Finder", href: "/tools/duplicate-isbn-finder", icon: BookOpen },
  { name: "ISBN Country Identifier", href: "/tools/isbn-country-identifier", icon: BookOpen },
  { name: "ISBN Metadata Extractor", href: "/tools/isbn-metadata-extractor", icon: BookOpen },
  { name: "ISBN Range Checker", href: "/tools/isbn-range-checker", icon: BookOpen },
  { name: "Code Summarizer",      href: "/tools/code-summarizer",      icon: Code2 },
  { name: "ISBN Batch Generator", href: "/tools/isbn-batch-generator", icon: BookOpen },
];

const diffLinks = [
  { name: "Text & Code Diff", href: "/diff-checker/text", icon: GitCompareArrows },
];
const devLinks = [
  { name: "JSON Formatter", href: "/tools/json-formatter", icon: Braces },
  { name: "Base64 Encoder", href: "/tools/base64-encoder", icon: Code2 },
  { name: "URL Encoder",    href: "/tools/url-encoder",    icon: LinkIcon },
  { name: "HTML Formatter", href: "/tools/html-formatter", icon: Code },
  { name: "CSS Minifier",   href: "/tools/css-minifier",   icon: Paintbrush },
  { name: "Regex Tester",   href: "/tools/regex-tester",   icon: Regex },
  { name: "JWT Decoder",    href: "/tools/jwt-decoder",    icon: KeyRound },
];

export function Sidebar() {
  const pathname = usePathname();

  const isPdfPage   = pdfLinks.some(l => pathname === l.href);
  const isImagePage = imageLinks.some(l => pathname === l.href);
  const isBookPage  = bookLinks.some(l => pathname === l.href);
  const isDevPage   = devLinks.some(l => pathname === l.href);

  const [pdfOpen,   setPdfOpen]   = useState(isPdfPage || pathname === "/");
  const [imageOpen, setImageOpen] = useState(isImagePage);
  const [bookOpen,  setBookOpen]  = useState(isBookPage);
  const [devOpen,   setDevOpen]   = useState(isDevPage);
  const isDiffPage = pathname.startsWith("/diff-checker");
  const [diffOpen,  setDiffOpen]  = useState(isDiffPage);

  const NavItem = ({ href, icon: Icon, name }: { href: string; icon: React.ElementType; name: string }) => {
    const active = pathname === href;
    return (
      <Link href={href}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12.5px] transition-all group ${
          active ? "bg-[var(--inv-bg)] text-[var(--inv-txt)] font-semibold" : "text-[var(--txt-2)] hover:bg-[var(--hover-soft)] hover:text-[var(--txt)]"
        }`}>
        <Icon size={13} strokeWidth={active ? 2 : 1.8}
          className={active ? "text-accent" : "opacity-60 group-hover:opacity-80"} />
        <span className="flex-1 truncate">{name}</span>
      </Link>
    );
  };

  const Section = ({ title, links, open, onToggle }: {
    title: string;
    links: typeof pdfLinks;
    open: boolean;
    onToggle: () => void;
  }) => (
    <div className="mt-3 pt-3 border-t border-[var(--line)] first:mt-0 first:pt-0 first:border-0">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-[var(--hover-soft)] transition-colors group mb-1">
        <span className={`text-[10.5px] font-bold uppercase tracking-widest transition-colors ${open ? "text-accent" : "text-[var(--txt-2)] group-hover:text-[var(--txt)]"}`}>
          {title}
        </span>
        {open
          ? <ChevronDown size={11} className="text-[var(--txt-2)]" />
          : <ChevronRight size={11} className="text-[var(--txt-2)]" />}
      </button>
      {open && (
        <nav className="space-y-0.5 pl-1">
          {links.map(l => <NavItem key={l.href} {...l} />)}
        </nav>
      )}
    </div>
  );

  return (
    <aside className="w-[210px] shrink-0 hidden lg:block sticky top-14" style={{ height: "calc(100vh - 56px)" }}>
      <div className="bg-[var(--surface)] border-r border-[var(--line)] h-full flex flex-col overflow-y-auto pt-4 px-2 pb-4">
        <Section title="PDF Tools"       links={pdfLinks}   open={pdfOpen}   onToggle={() => setPdfOpen(!pdfOpen)} />
        <Section title="Image Tools"     links={imageLinks} open={imageOpen} onToggle={() => setImageOpen(!imageOpen)} />
        <Section title="Book & ISBN"     links={bookLinks}  open={bookOpen}  onToggle={() => setBookOpen(!bookOpen)} />
        <Section title="Developer Tools" links={devLinks}   open={devOpen}   onToggle={() => setDevOpen(!devOpen)} />
        <Section title="Diff Checker"    links={diffLinks}  open={diffOpen}  onToggle={() => setDiffOpen(!diffOpen)} />

        <div className="mt-auto pt-3 mx-1 bg-txt/5 border border-[var(--line)] rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <FileText size={12} className="text-accent" />
            <span className="text-[11px] font-bold text-[var(--txt)]">100% Private</span>
          </div>
          <p className="text-[11px] text-[var(--txt-2)] leading-snug">
            All processing happens in your browser. Nothing is ever uploaded.
          </p>
        </div>
      </div>
    </aside>
  );
}