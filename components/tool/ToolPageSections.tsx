"use client";
import Link from "next/link";
import { ChevronRight, FileText, Minimize2, GitMerge, Split, FileImage, Image as ImageIcon, RotateCw, Unlock, Droplets } from "lucide-react";
import { useState } from "react";

const C = { ink: "#1a1a1a", sub: "#6b6760", brand: "#FF6B5E", line: "#1c1c1c", surface: "#ffffff", cream: "#f4f1ea" };
const shadow = "3px 3px 0 0 #1c1c1c";

const TOOL_META: Record<string, { icon: any; color: string; tint: string; label: string; href: string }> = {
  compress: { icon: Minimize2, color: "#3B82F6", tint: "#E5EEFC", label: "Compress PDF", href: "/tools/compress" },
  merge: { icon: GitMerge, color: "#F2994A", tint: "#FCEEDD", label: "Merge PDF", href: "/tools/merge" },
  split: { icon: Split, color: "#7B61FF", tint: "#ECE7FF", label: "Split PDF", href: "/tools/split" },
  "pdf-to-jpg": { icon: FileImage, color: "#EC4899", tint: "#FCE4EF", label: "PDF to JPG", href: "/tools/pdf-to-jpg" },
  "image-to-pdf": { icon: ImageIcon, color: "#27AE60", tint: "#E4F5EC", label: "Image to PDF", href: "/tools/image-to-pdf" },
  "rotate-pdf": { icon: RotateCw, color: "#EE4B3C", tint: "#ffe7e3", label: "Rotate PDF", href: "/tools/rotate-pdf" },
  "watermark-pdf": { icon: Droplets, color: "#EC4899", tint: "#FCE4EF", label: "Watermark PDF", href: "/tools/watermark-pdf" },
  "unlock-pdf": { icon: Unlock, color: "#3B82F6", tint: "#E5EEFC", label: "Unlock PDF", href: "/tools/unlock-pdf" },
};

interface HowToStep { title: string; desc: string; }
interface FAQItem { q: string; a: string; }
interface RelatedBlog { title: string; href: string; }

interface ToolPageSectionsProps {
  processingMode?: "browser" | "server";
  howToSteps?: HowToStep[];
  capabilities?: string[];
  useCases?: string[];
  relatedTools?: string[];
  faqs?: FAQItem[];
  relatedBlogs?: RelatedBlog[];
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-xs" style={{ color: C.sub }}>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={12} />}
            {item.href ? (
              <Link href={item.href} className="hover:underline" style={{ color: C.sub }}>{item.label}</Link>
            ) : (
              <span style={{ color: C.ink, fontWeight: 600 }}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function ProcessingBadge({ mode }: { mode: "browser" | "server" }) {
  return (
    <div className="mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium"
      style={{ background: C.cream, border: `1px solid ${C.line}`, color: C.sub }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: mode === "browser" ? "#27AE60" : "#3B82F6" }} />
      {mode === "browser"
        ? "Processed in your browser — your file is not sent to any server"
        : "Processed using the PDF24X server"}
    </div>
  );
}

function HowToSection({ steps }: { steps: HowToStep[] }) {
  return (
    <section className="mt-8 rounded-2xl bg-white p-6" style={{ border: `1px solid ${C.line}`, boxShadow: shadow }}>
      <h2 className="text-lg font-extrabold mb-4" style={{ color: C.ink, fontFamily: "Archivo, Inter, sans-serif" }}>How to Use</h2>
      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: C.brand }}>{i + 1}</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: C.ink }}>{step.title}</p>
              <p className="text-xs mt-0.5" style={{ color: C.sub }}>{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function UseCasesSection({ cases }: { cases: string[] }) {
  return (
    <section className="mt-4 rounded-2xl bg-white p-6" style={{ border: `1px solid ${C.line}`, boxShadow: shadow }}>
      <h2 className="text-lg font-extrabold mb-4" style={{ color: C.ink, fontFamily: "Archivo, Inter, sans-serif" }}>Common Use Cases</h2>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {cases.map((c, i) => (
          <li key={i} className="flex items-center gap-2 text-sm" style={{ color: C.sub }}>
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: C.brand }} />{c}
          </li>
        ))}
      </ul>
    </section>
  );
}

function RelatedToolsSection({ tools }: { tools: string[] }) {
  return (
    <section className="mt-4 rounded-2xl bg-white p-6" style={{ border: `1px solid ${C.line}`, boxShadow: shadow }}>
      <h2 className="text-lg font-extrabold mb-4" style={{ color: C.ink, fontFamily: "Archivo, Inter, sans-serif" }}>Related Tools</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tools.map(key => {
          const t = TOOL_META[key];
          if (!t) return null;
          return (
            <Link key={key} href={t.href} className="flex items-center gap-3 rounded-xl p-3 transition-all hover:-translate-y-0.5"
              style={{ border: `1px solid ${C.line}`, background: C.cream, boxShadow: shadow }}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: t.tint }}>
                <t.icon size={16} style={{ color: t.color }} />
              </span>
              <span className="text-sm font-semibold" style={{ color: C.ink }}>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function FAQSection({ faqs }: { faqs: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="mt-4 rounded-2xl bg-white p-6" style={{ border: `1px solid ${C.line}`, boxShadow: shadow }}>
      <h2 className="text-lg font-extrabold mb-4" style={{ color: C.ink, fontFamily: "Archivo, Inter, sans-serif" }}>Frequently Asked Questions</h2>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
            <button onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-semibold"
              style={{ color: C.ink, background: open === i ? C.cream : C.surface }}>
              {faq.q}
              <ChevronRight size={15} className={`shrink-0 transition-transform ${open === i ? "rotate-90" : ""}`} style={{ color: C.sub }} />
            </button>
            {open === i && (
              <div className="px-4 pb-3 pt-1 text-xs leading-relaxed" style={{ color: C.sub, background: C.surface }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function RelatedBlogsSection({ blogs }: { blogs: RelatedBlog[] }) {
  return (
    <section className="mt-4 rounded-2xl bg-white p-6" style={{ border: `1px solid ${C.line}`, boxShadow: shadow }}>
      <h2 className="text-lg font-extrabold mb-4" style={{ color: C.ink, fontFamily: "Archivo, Inter, sans-serif" }}>Related Guides</h2>
      <ul className="space-y-2">
        {blogs.map((b, i) => (
          <li key={i}>
            <Link href={b.href} className="flex items-center gap-2 text-sm font-medium hover:underline" style={{ color: C.brand }}>
              <ChevronRight size={14} />{b.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ToolPageSections({
  processingMode, howToSteps, useCases, relatedTools, faqs, relatedBlogs
}: ToolPageSectionsProps) {
  return (
    <div className="mt-2 pb-8">
      {processingMode && <ProcessingBadge mode={processingMode} />}
      {howToSteps && howToSteps.length > 0 && <HowToSection steps={howToSteps} />}
      {useCases && useCases.length > 0 && <UseCasesSection cases={useCases} />}
      {relatedTools && relatedTools.length > 0 && <RelatedToolsSection tools={relatedTools} />}
      {faqs && faqs.length > 0 && <FAQSection faqs={faqs} />}
      {relatedBlogs && relatedBlogs.length > 0 && <RelatedBlogsSection blogs={relatedBlogs} />}
    </div>
  );
}
