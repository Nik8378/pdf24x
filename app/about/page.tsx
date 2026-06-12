import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
import { Shield, Zap, Lock, Globe, Code2, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "About PDF24x – Free Browser-Based PDF & Developer Tools",
  description: "Learn about PDF24x — a free, privacy-first platform offering PDF tools, image converters, and developer utilities. All processing happens in your browser. No uploads, no sign-up.",
  alternates: { canonical: "https://pdf24x.com/about" },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return (
    <div className="w-full flex gap-0 items-start">
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-12 max-w-4xl">

        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1917] mb-3">About PDF24x</h1>
        <p className="text-[15px] text-[#7a7875] mb-8 leading-relaxed">
          PDF24x is a free, privacy-first platform offering powerful PDF tools, image converters, and developer utilities — all running entirely in your browser.
        </p>

        {/* Mission */}
        <div className="bg-[#1a1917] rounded-2xl p-6 mb-8">
          <h2 className="text-[18px] font-bold text-white mb-3">Our Mission</h2>
          <p className="text-[14px] text-white/80 leading-relaxed">
            We believe powerful productivity tools should be free, fast, and private. PDF24x was built to give everyone access to professional-grade document and developer tools without subscriptions, without watermarks, and without compromising your privacy.
          </p>
        </div>

        {/* Core Values */}
        <h2 className="text-[18px] font-bold text-[#1a1917] mb-4">Why PDF24x?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Lock, title: "100% Private", desc: "All files are processed locally in your browser. Nothing is ever uploaded to our servers." },
            { icon: Zap, title: "Instant & Fast", desc: "No waiting for uploads or server processing. Everything happens instantly in your browser." },
            { icon: Shield, title: "No Sign-Up", desc: "Use all tools without creating an account or providing any personal information." },
            { icon: Globe, title: "Always Free", desc: "All tools are completely free to use. No hidden fees, no premium tiers, no watermarks." },
            { icon: Code2, title: "Developer Friendly", desc: "Built by developers for developers — with JSON formatter, JWT decoder, Regex tester and more." },
            { icon: FileText, title: "No Watermarks", desc: "Your converted files are clean and professional — no PDF24x branding added." },
          ].map(item => (
            <div key={item.title} className="bg-white border border-[#1a1917]/10 rounded-2xl p-5">
              <item.icon size={20} className="text-accent mb-3" />
              <h3 className="text-[14px] font-bold text-[#1a1917] mb-1">{item.title}</h3>
              <p className="text-[12.5px] text-[#7a7875] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Tools */}
        <h2 className="text-[18px] font-bold text-[#1a1917] mb-4">Our Tools</h2>
        <div className="bg-white border border-[#1a1917]/10 rounded-2xl overflow-hidden mb-8">
          {[
            { category: "PDF Tools", tools: "Image to PDF, Compress PDF, Merge PDF, Split PDF, PDF to JPG, Excel to PDF, PDF to Excel" },
            { category: "Image Tools", tools: "Image to WebP, Image to Favicon" },
            { category: "Book & ISBN", tools: "ISBN Converter (ISBN-10 ↔ ISBN-13)" },
            { category: "Developer Tools", tools: "JSON Formatter, Base64 Encoder/Decoder, URL Encoder/Decoder, HTML Formatter, CSS Minifier, Regex Tester, JWT Decoder" },
          ].map((item, i) => (
            <div key={item.category} className={`flex items-start gap-4 px-5 py-4 ${i % 2 === 0 ? "bg-white" : "bg-[#f9f9f9]"} border-b border-[#e5e3de] last:border-0`}>
              <div className="w-32 shrink-0">
                <span className="text-[12px] font-bold text-accent">{item.category}</span>
              </div>
              <p className="text-[13px] text-[#4a4845]">{item.tools}</p>
            </div>
          ))}
        </div>

        {/* Tech */}
        <h2 className="text-[18px] font-bold text-[#1a1917] mb-4">Built With</h2>
        <div className="bg-white border border-[#1a1917]/10 rounded-2xl p-5 mb-8">
          <div className="flex flex-wrap gap-2">
            {["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "pdf-lib", "pdfjs-dist", "SheetJS", "Zustand", "Lucide React"].map(tech => (
              <span key={tech} className="text-[12px] font-medium text-[#4a4845] bg-[#f4f3f0] border border-[#e5e3de] rounded-full px-3 py-1">{tech}</span>
            ))}
          </div>
          <p className="text-[12.5px] text-[#7a7875] mt-4">PDF24x is built using modern web technologies and runs entirely client-side — no backend servers process your files.</p>
        </div>

        {/* Contact */}
        <div className="bg-accent-bg border border-accent/20 rounded-2xl p-6">
          <h2 className="text-[16px] font-bold text-accent mb-2">Get in Touch</h2>
          <p className="text-[13px] text-[#4a4845] mb-3">Have feedback, suggestions, or found a bug? We&apos;d love to hear from you.</p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold text-[13px] px-5 py-2.5 rounded-full transition-all">
            Contact Us →
          </a>
        </div>

      </main>
    </div>
  );
}
