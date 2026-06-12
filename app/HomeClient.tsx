"use client";
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { UploadZone } from "@/components/tool/UploadZone";
import { ImageList } from "@/components/tool/ImageList";
import { SettingsPanel } from "@/components/tool/SettingsPanel";
import {
  ConvertButton,
  ProgressOverlay,
  Toast,
} from "@/components/tool/ConvertButton";
import { TrustBadges } from "@/components/tool/TrustBadges";
import { useClipboardPaste } from "@/components/tool/useClipboardPaste";
import { useAppStore } from "@/store/useAppStore";
import { FileText, ChevronDown } from "lucide-react";

function HowItWorks() {
  const steps = [
    {
      n: "1",
      title: "Upload Images",
      desc: "Drag & drop, browse files, or paste from clipboard",
    },
    {
      n: "2",
      title: "Arrange & Configure",
      desc: "Reorder pages, rotate images, pick your PDF settings",
    },
    {
      n: "3",
      title: "Download PDF",
      desc: "Click Convert — your PDF downloads instantly",
    },
  ];
  return (
    <section className="bg-white border border-[#1a1917]/10 rounded-2xl p-5 mt-4 shadow-sm">
      <h2 className="text-[13px] font-bold text-[#1a1917] uppercase tracking-widest mb-4 opacity-40">
        How It Works
      </h2>
      <div className="flex flex-col sm:flex-row gap-4">
        {steps.map((s) => (
          <div
            key={s.n}
            className="flex sm:flex-col items-start gap-3 sm:gap-2 flex-1"
          >
            <div className="w-7 h-7 rounded-full bg-accent-bg border border-accent/20 flex items-center justify-center shrink-0">
              <span className="text-[12px] font-bold text-accent">{s.n}</span>
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#1a1917]">{s.title}</p>
              <p className="text-[12px] text-[#7a7875] mt-0.5 leading-snug">
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "Does converting reduce image quality?",
      a: 'No. PDF24x uses your image at its original resolution by default. Only if you choose "Balanced" or "Smallest" quality is any compression applied.',
    },
    {
      q: "Are my files uploaded to a server?",
      a: "Never. All processing happens entirely in your browser using JavaScript. Your files never leave your device — there is no server involved.",
    },
    {
      q: "How many images can I convert at once?",
      a: "There's no hard limit. You can add as many images as you like. Performance depends on your device's available memory.",
    },
    {
      q: "Which image formats are supported?",
      a: "JPG, JPEG, PNG, WEBP, and BMP are all supported.",
    },
    {
      q: "Can I reorder pages before converting?",
      a: "Yes. Drag and drop any image in the list to change its order. The PDF pages will follow the order you set.",
    },
    {
      q: "Can I use this on mobile?",
      a: "Yes. PDF24x is fully responsive and works on phones, tablets, and desktops.",
    },
    {
      q: "Is it really free?",
      a: "Yes, completely free. No account needed, no watermarks, no restrictions — ever.",
    },
  ];
  const [open, setOpen] = useState<number>(0);
  return (
    <section className="bg-white border border-[#1a1917]/10 rounded-2xl p-5 mt-4 shadow-sm">
      <h2 className="text-[13px] font-bold text-[#1a1917] uppercase tracking-widest mb-4 opacity-40">
        FAQ
      </h2>
      <div className="divide-y divide-[#e5e3de]">
        {faqs.map((faq, i) => (
          <div key={faq.q}>
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              className="w-full flex items-center justify-between py-3.5 text-left gap-4"
              aria-expanded={open === i}
            >
              <span className="text-[13.5px] font-bold text-[#1a1917]">
                {faq.q}
              </span>
              <span
                className={`text-[#4a4845] shrink-0 transition-transform duration-200 ${
                  open === i ? "rotate-180" : ""
                }`}
              >
                <ChevronDown size={15} strokeWidth={2} />
              </span>
            </button>
            {open === i && (
              <p className="text-[13px] text-[#4a4845] leading-relaxed pb-4">
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomeClient() {
  useClipboardPaste();
  const images = useAppStore((s) => s.images);
  const hasImages = images.length > 0;

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5">
          <div className="mb-3">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1a1917]">
              Image to PDF Converter
            </h1>
            <p className="text-[13px] text-[#7a7875] mt-0.5">
              Convert JPG, PNG and WEBP images into high-quality PDFs. Free,
              private, instant.
            </p>
          </div>

          <div className="flex flex-col xl:flex-row gap-4 xl:items-start">
            {/* Main area */}
            <div className="flex-1 min-w-0 w-full">
              <UploadZone />
              {hasImages && (
                <div className="mt-2 flex justify-end">
                  <UploadZone compact />
                </div>
              )}
              <ImageList />
              {!hasImages && (
                <div className="mt-4">
                  <TrustBadges />
                </div>
              )}
            </div>

            {/* Settings panel */}
            <div className="w-full xl:w-[280px] shrink-0 xl:sticky xl:top-14">
              <div className="bg-white border border-[#1a1917]/10 rounded-2xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-[#e5e3de]">
                  <FileText
                    size={14}
                    strokeWidth={1.8}
                    className="text-[#7a7875]"
                  />
                  <h3 className="text-[13px] font-bold text-[#1a1917] tracking-tight">
                    PDF Settings
                  </h3>
                </div>
                <SettingsPanel />
                <div className="border-t border-[#e5e3de] mt-3 pt-3">
                  <ConvertButton />
                </div>
              </div>

              {/* Privacy badge mobile */}
              {!hasImages && (
                <div className="xl:hidden mt-3 bg-[#f4f3f0] border border-[#e5e3de] rounded-xl p-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
                  <p className="text-[12px] text-[#7a7875]">
                    Files processed locally — nothing is uploaded
                  </p>
                </div>
              )}
            </div>
          </div>

          <HowItWorks />
          <FAQ />
          
          {/* SEO content block */}
          <section className="mt-6 bg-white border border-[#1a1917]/10 rounded-2xl p-5 shadow-sm">
            <h2 className="text-[15px] font-bold text-[#1a1917] mb-2">
              The best free image to PDF converter
            </h2>
            <p className="text-[13px] text-[#7a7875] leading-relaxed">
              PDF24x converts your JPG, PNG, WEBP and BMP images into
              professional PDF files directly in your browser — no account
              required, no file size limits, and no ads on the tool. Your files
              are never uploaded to any server. Combine multiple images into a
              single PDF, control page size (A4, Letter, Legal), set margins,
              choose image fit, and adjust quality — all for free.
            </p>
          </section>
        </main>
      </div>
      <ProgressOverlay />
      <Toast />
    </>
  );
}
