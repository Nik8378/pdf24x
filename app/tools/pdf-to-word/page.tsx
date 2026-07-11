import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ArrowRight, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "PDF to Word Converter | PDF24X",
  description: "Convert PDF files to editable Word documents. Free PDF to Word converter — coming soon to PDF24X.",
  alternates: { canonical: "https://pdf24x.com/tools/pdf-to-word" },
};

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "#ffe7e3", border: "1px solid #1c1c1c", boxShadow: "3px 3px 0 0 #1c1c1c" }}>
        <FileText size={30} style={{ color: "#FF6B5E" }} />
      </span>
      <h1 className="text-3xl font-extrabold sm:text-4xl" style={{ color: "#1a1a1a", fontFamily: "Archivo, Inter, sans-serif" }}>
        PDF to Word
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm sm:text-base" style={{ color: "#6b6760" }}>
        Convert PDF files into fully editable Word documents (.docx). Preserves text, formatting, and layout.
      </p>

      <div className="mx-auto mt-10 max-w-sm rounded-2xl bg-white p-8" style={{ border: "1px solid #1c1c1c", boxShadow: "3px 3px 0 0 #1c1c1c" }}>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "#ffe7e3" }}>
          <Clock size={24} style={{ color: "#FF6B5E" }} />
        </div>
        <p className="text-base font-bold" style={{ color: "#1a1a1a" }}>Coming Soon</p>
        <p className="mt-2 text-sm" style={{ color: "#6b6760" }}>
          PDF to Word conversion is currently under development. We are working on bringing you the best quality conversion. Try our other free tools in the meantime.
        </p>
        <Link href="/tools" className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5" style={{ background: "#FF6B5E", border: "1px solid #1c1c1c", boxShadow: "3px 3px 0 0 #1c1c1c" }}>
          Explore All Tools <ArrowRight size={16} />
        </Link>
      </div>

      <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-4 text-left sm:grid-cols-3">
        {[
          { title: "Compress PDF", path: "/tools/compress", desc: "Reduce PDF file size" },
          { title: "Merge PDF", path: "/tools/merge", desc: "Combine multiple PDFs" },
          { title: "Split PDF", path: "/tools/split", desc: "Extract PDF pages" },
        ].map(tool => (
          <Link key={tool.title} href={tool.path} className="rounded-xl bg-white p-4 transition-all hover:-translate-y-0.5" style={{ border: "1px solid #1c1c1c", boxShadow: "3px 3px 0 0 #1c1c1c" }}>
            <p className="text-sm font-bold" style={{ color: "#1a1a1a" }}>{tool.title}</p>
            <p className="mt-1 text-xs" style={{ color: "#6b6760" }}>{tool.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
