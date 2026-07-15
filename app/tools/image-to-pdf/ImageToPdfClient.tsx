"use client";
import ToolPageSections from "@/components/tool/ToolPageSections";
import { Sidebar } from "@/components/layout/Sidebar";
import { UploadZone } from "@/components/tool/UploadZone";
import { ImageList } from "@/components/tool/ImageList";
import { SettingsPanel } from "@/components/tool/SettingsPanel";
import { ConvertButton, ProgressOverlay, Toast } from "@/components/tool/ConvertButton";
import { TrustBadges } from "@/components/tool/TrustBadges";
import { useClipboardPaste } from "@/components/tool/useClipboardPaste";
import { useAppStore } from "@/store/useAppStore";
import { FileText, ChevronDown } from "lucide-react";
import { useState } from "react";

function HowItWorks() {
  const steps = [
    { n: "1", title: "Upload Images", desc: "Drag & drop, browse files, or paste from clipboard" },
    { n: "2", title: "Arrange & Configure", desc: "Reorder pages, rotate images, pick your PDF settings" },
    { n: "3", title: "Download PDF", desc: "Click Convert — your PDF downloads instantly" },
  ];
  return (
    <section className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 mt-4 shadow-sm">
      <h2 className="text-[13px] font-bold text-[var(--txt)] uppercase tracking-widest mb-4 opacity-40">How It Works</h2>
      <div className="flex flex-col sm:flex-row gap-4">
        {steps.map((s) => (
          <div key={s.n} className="flex sm:flex-col items-start gap-3 sm:gap-2 flex-1">
            <div className="w-7 h-7 rounded-full bg-accent-bg border border-accent/20 flex items-center justify-center shrink-0">
              <span className="text-[12px] font-bold text-accent">{s.n}</span>
            </div>
            <div>
              <p className="text-[13px] font-bold text-[var(--txt)]">{s.title}</p>
              <p className="text-[12px] text-[var(--txt-2)] mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    { q: "What image formats are supported?", a: "JPG, JPEG, PNG, WebP, GIF, BMP and TIFF images are supported." },
    { q: "Is there a file size limit?", a: "Each image can be up to 50MB. You can add up to 50 images per conversion." },
    { q: "Are my images uploaded to a server?", a: "No. All processing happens entirely in your browser. Your images never leave your device." },
  ];
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="mt-4">
      <h2 className="text-[13px] font-bold text-[var(--txt)] uppercase tracking-widest mb-3 opacity-40">FAQ</h2>
      <div className="space-y-2">
        {faqs.map((f, i) => (
          <div key={i} className="bg-[var(--surface)] border border-[var(--line)] rounded-xl overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-4 py-3 text-left">
              <span className="text-[13px] font-medium text-[var(--txt)]">{f.q}</span>
              <ChevronDown size={15} className={`text-[var(--txt-2)] transition-transform ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && <p className="px-4 pb-3 text-[12.5px] text-[var(--txt-2)] leading-relaxed">{f.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ImageToPdfClient() {
  useClipboardPaste();
  const { images } = useAppStore();
  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-center shrink-0">
              <FileText size={15} className="text-orange-500" />
            </div>
            <h1 className="text-[17px] font-bold text-[var(--txt)]">Image to PDF</h1>
          </div>
          <p className="text-[12.5px] text-[var(--txt-2)] mb-4 ml-10">
            Convert JPG, PNG, WebP and other images to PDF. Add multiple images, reorder them, and download as one PDF file.
          </p>
          <UploadZone />
          {images.length > 0 && (
            <div className="mt-3 flex flex-col lg:flex-row gap-3 items-start">
              <div className="flex-1 min-w-0"><ImageList /></div>
              <div className="w-full lg:w-[220px] shrink-0 space-y-3">
                <SettingsPanel />
                <ConvertButton />
              </div>
            </div>
          )}
          <TrustBadges />
          <HowItWorks />
          <FAQ />
  
      <div className="mx-4 sm:mx-6 lg:mx-8 mt-4">
        <ToolPageSections
          relatedTools={["pdf-to-jpg", "merge", "compress"]}
          relatedBlogs={[
            { title: "How to Convert JPG and PNG Images to PDF", href: "/blog/how-to-convert-jpg-png-to-pdf-free" },
          ]}
        />
      </div>
      </main>
      </div>
      <ProgressOverlay />
      <Toast />
    </>
  );
}
