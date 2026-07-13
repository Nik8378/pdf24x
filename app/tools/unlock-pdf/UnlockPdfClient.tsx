"use client";
import { useState, useCallback } from "react";
import ToolPageSections, { Breadcrumb } from "@/components/tool/ToolPageSections";
import { Unlock, Upload, Download, RefreshCcw, X, Loader2, Info, CheckCircle2, Maximize2 } from "lucide-react";

const C = { ink: "#1a1a1a", sub: "#6b6760", brand: "#FF6B5E", line: "#1c1c1c", surface: "#ffffff", cream: "#f4f1ea", redsoft: "#ffe7e3" };
const shadow = "3px 3px 0 0 #1c1c1c";
const API = process.env.NEXT_PUBLIC_API_URL || "";

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

const USE_CASES = [
  "Open without typing password every time",
  "Share freely without revealing the password",
  "Print or edit a restricted PDF",
  "Use with other tools that don't support passwords",
];

export default function UnlockPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (f.type !== "application/pdf") return;
    setFile(f); setResultUrl(null); setError("");
  }, []);

  const reset = () => { setFile(null); setResultUrl(null); setError(""); setPassword(""); };

  const handleUnlock = async () => {
    if (!file) return;
    setLoading(true); setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("password", password);
      const res = await fetch(`${API}/api/pdf/unlock`, { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to unlock PDF. Check your password and try again.");
      }
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "PDF Tools", href: "/tools" }, { label: "Unlock PDF" }]} />
      <div className="mb-8 flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ background: "#E5EEFC", border: `1px solid ${C.line}`, boxShadow: shadow }}>
          <Unlock size={26} style={{ color: "#3B82F6" }} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl" style={{ color: C.ink, fontFamily: "Archivo, Inter, sans-serif" }}>Unlock PDF</h1>
          <p className="mt-1 text-sm sm:text-base" style={{ color: C.sub }}>Permanently remove password protection from your PDF.</p>
        </div>
      </div>

      {/* Why use this */}
      {!resultUrl && (
        <div className="mb-6 rounded-xl p-4" style={{ background: C.cream, border: `1px solid ${C.line}` }}>
          <div className="flex items-start gap-3">
            <Info size={16} className="mt-0.5 shrink-0" style={{ color: "#3B82F6" }} />
            <div>
              <p className="text-sm font-bold" style={{ color: C.ink }}>Why use this tool if you know the password?</p>
              <ul className="mt-2 space-y-1">
                {USE_CASES.map(u => (
                  <li key={u} className="flex items-center gap-2 text-xs" style={{ color: C.sub }}>
                    <CheckCircle2 size={13} style={{ color: "#3B82F6" }} />{u}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {!file ? (
        <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => document.getElementById("unlock-input")?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all"
          style={{ borderColor: dragging ? "#3B82F6" : C.line, background: dragging ? "#E5EEFC" : C.surface }}>
          <input id="unlock-input" type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "#E5EEFC" }}>
            <Upload size={28} style={{ color: "#3B82F6" }} />
          </span>
          <p className="mt-4 text-base font-semibold" style={{ color: C.ink }}>Drop your password-protected PDF here</p>
          <p className="mt-1 text-sm" style={{ color: C.sub }}>or click to browse</p>
        </div>
      ) : !resultUrl ? (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ border: `1px solid ${C.line}`, background: C.surface, boxShadow: shadow }}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: "#E5EEFC" }}>
              <Unlock size={16} style={{ color: "#3B82F6" }} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold" style={{ color: C.ink }}>{file.name}</p>
              <p className="text-xs" style={{ color: C.sub }}>{formatBytes(file.size)}</p>
            </div>
            <button onClick={reset} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ border: `1px solid ${C.line}`, background: C.cream }}>
              <X size={15} style={{ color: C.sub }} />
            </button>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold" style={{ color: C.ink }}>PDF Password</label>
            <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              placeholder="Enter the current PDF password"
              className="w-full max-w-md rounded-xl px-4 py-2.5 text-sm"
              style={{ border: `1px solid ${C.line}`, background: C.surface, color: C.ink, outline: "none" }} />
            <p className="mt-1.5 text-xs" style={{ color: C.sub }}>Leave empty if the PDF only has edit/print restrictions but no open password.</p>
          </div>

          {error && <p className="rounded-xl px-4 py-3 text-sm" style={{ border: `1px solid ${C.line}`, background: C.redsoft, color: C.ink }}>{error}</p>}

          <div className="flex flex-wrap gap-3">
            <button onClick={handleUnlock} disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50 transition-all hover:-translate-y-0.5"
              style={{ background: "#3B82F6", border: `1px solid ${C.line}`, boxShadow: shadow }}>
              {loading ? <><Loader2 size={16} className="animate-spin" />Unlocking…</> : <><Unlock size={16} />Unlock PDF</>}
            </button>
            <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
              style={{ border: `1px solid ${C.line}`, background: C.cream, color: C.ink, boxShadow: shadow }}>
              <RefreshCcw size={15} />Start over
            </button>
          </div>
        </div>
      ) : (
        /* Result: side-by-side layout */
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          {/* Left: actions */}
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl p-8 text-center" style={{ border: `1px solid ${C.line}`, background: C.surface, boxShadow: shadow }}>
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "#E4F5EC" }}>
              <Unlock size={26} style={{ color: "#27AE60" }} />
            </span>
            <p className="text-base font-bold" style={{ color: C.ink }}>PDF unlocked successfully!</p>
            <p className="text-sm max-w-xs" style={{ color: C.sub }}>Password protection has been permanently removed. The file can now be opened by anyone.</p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <a href={resultUrl} download="unlocked.pdf"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                style={{ background: "#3B82F6", border: `1px solid ${C.line}`, boxShadow: shadow }}>
                <Download size={16} />Download Unlocked PDF
              </a>
              <button onClick={() => setModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold lg:hidden"
                style={{ border: `1px solid ${C.line}`, background: C.cream, color: C.ink, boxShadow: shadow }}>
                <Maximize2 size={15} />Preview PDF
              </button>
              <button onClick={reset}
                className="text-sm font-semibold transition-colors"
                style={{ color: C.sub }}>
                Unlock another file
              </button>
            </div>
          </div>

          {/* Right: preview */}
          <div className="hidden lg:flex flex-col overflow-hidden rounded-2xl" style={{ border: `1px solid ${C.line}`, boxShadow: shadow }}>
            <div className="flex items-center justify-between border-b px-4 py-2" style={{ borderColor: C.line, background: C.cream }}>
              <span className="text-xs font-semibold" style={{ color: C.sub }}>PDF Preview</span>
              <button onClick={() => setModalOpen(true)} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold" style={{ border: `1px solid ${C.line}`, background: C.surface, color: C.sub }}>
                <Maximize2 size={11} />Full screen
              </button>
            </div>
            <iframe src={resultUrl} className="flex-1 w-full" style={{ minHeight: "70vh" }} />
          </div>
        </div>
      )}

      {/* Fullscreen modal */}
      {modalOpen && resultUrl && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: C.line, background: C.cream }}>
            <span className="text-sm font-semibold" style={{ color: C.ink }}>Unlocked PDF Preview</span>
            <button onClick={() => setModalOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ border: `1px solid ${C.line}`, background: C.surface }}>
              <X size={16} style={{ color: C.sub }} />
            </button>
          </div>
          <iframe src={resultUrl} className="flex-1 w-full bg-white" />
        </div>
      )}
      <ToolPageSections
        processingMode="server"
        howToSteps={[
          { title: "Upload your protected PDF", desc: "Drop a password-protected PDF or click to browse." },
          { title: "Enter the current password", desc: "You must know the existing password to remove it." },
          { title: "Remove password protection", desc: "Click Unlock PDF to process the file." },
          { title: "Download the unlocked PDF", desc: "Download your PDF — it can now be opened without a password." },
        ]}
        useCases={[
          "Open a PDF without typing the password every time",
          "Share a document without sharing the password",
          "Use a locked PDF with other tools",
          "Print a password-protected PDF",
          "Remove restrictions from a PDF you own",
        ]}
        relatedTools={["compress", "merge", "split"]}
        faqs={[
          { q: "Do I need to know the password to use this tool?", a: "Yes. This tool removes password protection from PDFs where you already know the password. It cannot crack or guess unknown passwords." },
          { q: "What happens to my file after processing?", a: "Your file is processed on a secure server and deleted after processing. It is not stored or shared." },
          { q: "Is this tool legal to use?", a: "You should only unlock PDFs that you own or have permission to modify. Removing protection from documents you do not own may be restricted by law." },
          { q: "Can it remove edit and print restrictions?", a: "When a PDF is unlocked with the correct password and saved without encryption, access restrictions are typically removed. Results may vary depending on how the original PDF was protected." },
          { q: "Do I need to create an account?", a: "No. The tool is free to use without registration." },
        ]}
      />
    </div>
  );
}
