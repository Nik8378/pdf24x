"use client";
import { useState, useCallback } from "react";
import { Unlock, Upload, Download, RefreshCcw, X, Loader2, Info } from "lucide-react";

const C = { ink: "#1a1a1a", sub: "#6b6760", brand: "#FF6B5E", line: "#1c1c1c", surface: "#ffffff", cream: "#f4f1ea", redsoft: "#ffe7e3" };
const shadow = "3px 3px 0 0 #1c1c1c";

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

export default function UnlockPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (f.type !== "application/pdf") return;
    setFile(f); setResultUrl(null); setError("");
  }, []);

  const reset = () => { setFile(null); setResultUrl(null); setError(""); setPassword(""); };

  const handleUnlock = async () => {
    if (!file) return;
    setLoading(true); setError("");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      let doc;
      try {
        doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      } catch {
        setError("Incorrect password or the PDF cannot be unlocked.");
        setLoading(false); return;
      }
      const out = await doc.save();
      setResultUrl(URL.createObjectURL(new Blob([out as BlobPart], { type: "application/pdf" })));
    } catch {
      setError("Failed to unlock PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ background: "#E5EEFC", border: `1px solid ${C.line}`, boxShadow: shadow }}>
          <Unlock size={26} style={{ color: "#3B82F6" }} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl" style={{ color: C.ink, fontFamily: "Archivo, Inter, sans-serif" }}>Unlock PDF</h1>
          <p className="mt-1 text-sm sm:text-base" style={{ color: C.sub }}>Remove password protection from your PDF file.</p>
        </div>
      </div>

      <div className="mb-5 flex items-start gap-3 rounded-xl p-4 text-sm" style={{ background: C.cream, border: `1px solid ${C.line}` }}>
        <Info size={16} className="mt-0.5 shrink-0" style={{ color: C.brand }} />
        <p style={{ color: C.sub }}>You must know the password to unlock the PDF. This tool removes password protection so you can open the file without a password in future.</p>
      </div>

      {!file ? (
        <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => document.getElementById("unlock-input")?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all"
          style={{ borderColor: dragging ? C.brand : C.line, background: dragging ? C.redsoft : C.surface }}>
          <input id="unlock-input" type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "#E5EEFC" }}>
            <Upload size={28} style={{ color: "#3B82F6" }} />
          </span>
          <p className="mt-4 text-base font-semibold" style={{ color: C.ink }}>Drop your PDF file here</p>
          <p className="mt-1 text-sm" style={{ color: C.sub }}>or click to browse</p>
        </div>
      ) : (
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
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter the PDF password"
              className="w-full max-w-md rounded-xl px-4 py-2.5 text-sm"
              style={{ border: `1px solid ${C.line}`, background: C.surface, color: C.ink, outline: "none" }} />
          </div>

          {error && <p className="rounded-xl px-4 py-3 text-sm" style={{ border: `1px solid ${C.line}`, background: C.redsoft, color: C.ink }}>{error}</p>}

          {resultUrl ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl p-8 text-center" style={{ border: `1px solid ${C.line}`, background: C.surface, boxShadow: shadow }}>
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "#E4F5EC" }}>
                <Unlock size={26} style={{ color: "#27AE60" }} />
              </span>
              <p className="text-base font-bold" style={{ color: C.ink }}>PDF unlocked successfully!</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <a href={resultUrl} download="unlocked.pdf"
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
                  style={{ background: C.brand, border: `1px solid ${C.line}`, boxShadow: shadow }}>
                  <Download size={16} />Download PDF
                </a>
                <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
                  style={{ border: `1px solid ${C.line}`, background: C.cream, color: C.ink, boxShadow: shadow }}>
                  <RefreshCcw size={15} />Unlock another
                </button>
              </div>
            </div>
          ) : (
            <button onClick={handleUnlock} disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              style={{ background: "#3B82F6", border: `1px solid ${C.line}`, boxShadow: shadow }}>
              {loading ? <><Loader2 size={16} className="animate-spin" />Unlocking…</> : <><Unlock size={16} />Unlock PDF</>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
