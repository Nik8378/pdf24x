import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Diff Checker Tools – Compare Text, Files & More",
  description:
    "Free online comparison tools. Compare text, code and files to find differences instantly — private, fast, and entirely in your browser.",
  alternates: { canonical: "https://pdf24x.com/diff-checker" },
};

const tools = [
  {
    icon: FileText, color: "#EE4B3C", tint: "#ffe7e3",
    name: "Text Diff Checker",
    desc: "Compare two texts line by line with word-level highlighting, ignore options and exportable reports.",
    href: "/diff-checker/text",
  },
];

export default function Page() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[var(--txt)] sm:text-3xl">Diff Checker Tools</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--txt-2)]">
          Professional comparison tools to find differences between texts, files and data — free,
          fast, and 100% private. Everything runs in your browser; nothing is ever uploaded.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <Link key={t.href} href={t.href}
            className="group rounded-2xl border bg-[var(--surface)] p-5 transition-all hover:-translate-y-1"
            style={{ border: "1px solid var(--line-strong)", boxShadow: "3px 3px 0 0 var(--line-strong)" }}>
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: t.tint }}>
              <t.icon size={20} style={{ color: t.color }} />
            </span>
            <p className="text-[15px] font-bold text-[var(--txt)]">{t.name}</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--txt-2)]">{t.desc}</p>
          </Link>
        ))}
      </div>
      <p className="mt-8 text-[13px] text-[var(--txt-2)]">
        More comparison tools — Images, Documents, Excel, Folders, JSON and Code — are being added to this category.
      </p>
    </div>
  );
}
