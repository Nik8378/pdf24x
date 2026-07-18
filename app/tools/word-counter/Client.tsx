"use client";
import { useState, useMemo, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import ToolPageSections from "@/components/tool/ToolPageSections";
import { Type, Trash2, Copy, Check, Upload, X } from "lucide-react";

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1a1917] text-white shadow-2xl text-[13px] font-medium animate-in slide-in-from-bottom-4 duration-300">
      <Check size={15} className="text-green-400 shrink-0" />
      {msg}
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100"><X size={13} /></button>
    </div>
  );
}

export default function Client() {
  const [text, setText] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  };

  const stats = useMemo(() => {
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const sentences = text === "" ? 0 : (text.match(/[.!?]+/g) || []).length;
    const paragraphs = text === "" ? 0 : text.split(/\n\s*\n/).filter(p => p.trim()).length || (text.trim() ? 1 : 0);
    const lines = text === "" ? 0 : text.split("\n").length;
    const readTime = Math.ceil(words / 200);
    const speakTime = Math.ceil(words / 130);
    return { words, chars, charsNoSpace, sentences, paragraphs, lines, readTime, speakTime };
  }, [text]);

  const copy = () => { navigator.clipboard.writeText(text); showToast("Text copied to clipboard!"); };

  const loadFile = (f: File) => {
    const r = new FileReader();
    r.onload = e => { setText(e.target?.result as string ?? ""); showToast("File loaded!"); };
    r.readAsText(f);
  };

  const statItems = [
    { label: "Words", val: stats.words.toLocaleString(), color: "text-[#6366F1]", bg: "bg-[#EEF2FF]" },
    { label: "Characters", val: stats.chars.toLocaleString(), color: "text-[#EC4899]", bg: "bg-[#FCE4EF]" },
    { label: "No Spaces", val: stats.charsNoSpace.toLocaleString(), color: "text-[#F59E0B]", bg: "bg-[#FEF3C7]" },
    { label: "Sentences", val: stats.sentences.toLocaleString(), color: "text-[#10B981]", bg: "bg-[#D1FAE5]" },
    { label: "Paragraphs", val: stats.paragraphs.toLocaleString(), color: "text-[#8B5CF6]", bg: "bg-[#EDE9FE]" },
    { label: "Lines", val: stats.lines.toLocaleString(), color: "text-[#0EA5E9]", bg: "bg-[#E0F2FE]" },
    { label: "Read Time", val: `~${stats.readTime} min`, color: "text-[#EF4444]", bg: "bg-[#FEE2E2]" },
    { label: "Speak Time", val: `~${stats.speakTime} min`, color: "text-[#F2994A]", bg: "bg-[#FCEEDD]" },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 px-6 py-6 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF2FF]">
              <Type size={20} className="text-[#6366F1]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--txt)]">Word Counter</h1>
              <p className="text-[12px] text-[var(--txt-2)]">Count words, characters, sentences and more</p>
            </div>
          </div>
          <button onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--txt)] text-[13px] font-medium hover:bg-[var(--bg-2)] transition-colors">
            <Upload size={14} /> Upload .txt
          </button>
          <input ref={fileRef} type="file" accept=".txt,.md,.csv" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f); }} />
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-4">
          {statItems.map(({ label, val, color, bg }) => (
            <div key={label} className={`rounded-2xl ${bg} px-3 py-3 text-center`}>
              <p className={`text-xl font-bold ${color}`}>{val}</p>
              <p className="text-[10px] text-[#6b6760] mt-0.5 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Editor */}
        <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] bg-[var(--bg)]">
            <span className="text-[12px] font-semibold text-[var(--txt-2)] uppercase tracking-wide">Your Text</span>
            <div className="flex gap-3">
              <button onClick={copy} disabled={!text}
                className="flex items-center gap-1.5 text-[12px] text-[var(--txt-2)] hover:text-accent disabled:opacity-30 transition-colors">
                <Copy size={13} /> Copy
              </button>
              <button onClick={() => setText("")} disabled={!text}
                className="flex items-center gap-1.5 text-[12px] text-[var(--txt-2)] hover:text-red-500 disabled:opacity-30 transition-colors">
                <Trash2 size={13} /> Clear
              </button>
            </div>
          </div>
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="Paste or type your text here…"
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
            onDragOver={e => e.preventDefault()}
            className="w-full h-72 p-4 bg-transparent text-[var(--txt)] text-[14px] resize-none focus:outline-none placeholder:text-[var(--txt-2)]/40" />
          <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border)] bg-[var(--bg)]">
            <span className="text-[11px] text-[var(--txt-2)]">{stats.words} words · {stats.chars} characters</span>
            <span className="text-[11px] text-[var(--txt-2)]">Drag & drop a .txt file</span>
          </div>
        </div>

        <ToolPageSections
          howToSteps={[
            { title: "Paste Your Text", desc: "Type or paste any text, or drag & drop a .txt file." },
            { title: "See Live Stats", desc: "All counts update instantly as you type." },
            { title: "Copy or Clear", desc: "Use the toolbar to copy or clear the text." },
          ]}
          faqs={[
            { q: "Does this count spaces?", a: "Yes — Characters includes spaces. No Spaces excludes them." },
            { q: "How is read time calculated?", a: "Based on 200 words per minute average reading speed." },
            { q: "Is my text stored?", a: "No. Everything runs in your browser. Nothing is sent anywhere." },
          ]}
          relatedTools={["percentage-calculator", "unit-converter", "age-calculator"]}
        />
      </main>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
