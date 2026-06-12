import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI PDF Assistant – Coming Soon",
  description: "Chat with your PDF documents using AI. Ask questions and get instant answers. Coming soon to PDF24x.",
  robots: { index: false },
};

export default function Page() {
  return (
    <div className="w-full flex gap-0 items-start">
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.6">
              <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2"/><path d="M12 8v4l3 3"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#1a1917] mb-2">AI PDF Assistant – Coming Soon</h1>
          <p className="text-[13.5px] text-[#7a7875] mb-6 leading-relaxed">
            Chat with your PDFs, ask questions, extract data, and summarize documents with AI. Under active development.
          </p>
          <Link href="/tools" className="inline-flex items-center gap-2 bg-[#1a1917] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity">
            ← See all tools
          </Link>
        </div>
      </main>
    </div>
  );
}
