import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
import Link from "next/link";

export const metadata: Metadata = {
  title: "OCR – Extract Text from PDF – Coming Soon",
  description: "Extract text from scanned PDF documents using OCR. Coming soon to PDF24x.",
  robots: { index: false },
};

export default function Page() {
  return (
    <div className="w-full flex gap-0 items-start">
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 bg-[var(--hover-soft)] border border-[var(--line)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-[var(--txt-2)]">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[var(--txt)] mb-2">Coming Soon</h1>
          <p className="text-[13.5px] text-[var(--txt-2)] mb-6 leading-relaxed">
            OCR text extraction is under development. Try our other free tools now.
          </p>
          <Link href="/tools" className="inline-flex items-center gap-2 bg-[var(--inv-bg)] text-[var(--inv-txt)] text-[13.5px] font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity">
            ← See all tools
          </Link>
        </div>
      </main>
    </div>
  );
}
