import type { Metadata } from "next";
import Link from "next/link";
import { Image, Minimize2, Link2, Scissors, Layers, FileText, Shield, Zap, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "PDF24x – Free PDF Tools Online",
  description: "All the PDF tools you need. Free, private, no uploads.",
};

const tools = [
  { name: "Image to PDF", desc: "Convert JPG, PNG, WEBP to PDF", href: "/", icon: Image, color: "bg-orange-50", iconColor: "text-accent" },
  { name: "Compress PDF", desc: "Reduce PDF file size", href: "/tools/compress", icon: Minimize2, color: "bg-blue-50", iconColor: "text-blue-600" },
  { name: "Merge PDF", desc: "Combine multiple PDFs", href: "/tools/merge", icon: Link2, color: "bg-green-50", iconColor: "text-green-600" },
  { name: "Split PDF", desc: "Extract or split pages", href: "/tools/split", icon: Scissors, color: "bg-purple-50", iconColor: "text-purple-600" },
  { name: "PDF to JPG", desc: "Convert pages to images", href: "/tools/pdf-to-jpg", icon: Layers, color: "bg-pink-50", iconColor: "text-pink-600" },
];

const features = [
  { icon: Shield, title: "100% Private", desc: "Files never leave your browser." },
  { icon: Zap, title: "Lightning Fast", desc: "Processed locally in seconds." },
  { icon: Star, title: "Original Quality", desc: "No hidden compression." },
  { icon: FileText, title: "Completely Free", desc: "No sign-up, no limits." },
];

export default function HomePage() {
  return (
    <div className="w-full">
      <div className="bg-white border-b border-[#1a1917]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-accent-bg text-accent text-[12px] font-semibold px-3 py-1 rounded-full mb-4 border border-accent/20">
            <span className="w-1.5 h-1.5 bg-accent rounded-full" />Free · Private · No Sign-up
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[#1a1917] mb-4 leading-tight">
            Every PDF Tool You Need.<br className="hidden sm:block" /> All in One Place.
          </h1>
          <p className="text-[#7a7875] text-[15px] sm:text-[17px] max-w-xl mx-auto mb-8 leading-relaxed">
            Convert, compress, merge, split your PDFs — free, private, in your browser.
          </p>
          <Link href="#tools" className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold text-[15px] px-7 py-3 rounded-full transition-all shadow-md hover:shadow-lg">
            Get Started Free →
          </Link>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12" id="tools">
        <h2 className="text-[13px] font-bold uppercase tracking-widest text-[#7a7875] mb-6 text-center">PDF Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href}
              className="group bg-white border border-[#1a1917]/10 rounded-2xl p-4 sm:p-5 hover:border-accent/40 hover:shadow-lg transition-all hover:-translate-y-0.5 flex flex-col items-center text-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <tool.icon size={22} strokeWidth={1.8} className={tool.iconColor} />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#1a1917] leading-snug mb-1">{tool.name}</p>
                <p className="text-[11.5px] text-[#7a7875] leading-snug hidden sm:block">{tool.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="bg-white border-y border-[#1a1917]/10 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="text-center">
                <div className="w-10 h-10 bg-accent-bg rounded-xl flex items-center justify-center mx-auto mb-3">
                  <f.icon size={18} strokeWidth={1.8} className="text-accent" />
                </div>
                <p className="text-[13px] font-bold text-[#1a1917] mb-1">{f.title}</p>
                <p className="text-[12px] text-[#7a7875] leading-snug">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <footer className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-accent rounded flex items-center justify-center">
            <FileText size={12} color="white" strokeWidth={2.2} />
          </div>
          <span className="text-[13px] font-semibold text-[#1a1917]">PDF24x</span>
          <span className="text-[12px] text-[#7a7875]">© 2025</span>
        </div>
        <div className="flex gap-4 text-[12.5px] text-[#7a7875]">
          <Link href="/tools" className="hover:text-[#1a1917]">All Tools</Link>
          <Link href="/blog" className="hover:text-[#1a1917]">Blog</Link>
        </div>
      </footer>
    </div>
  );
}
