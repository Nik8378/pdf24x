"use client";
import { useState, useCallback } from "react";
import { FileText, Loader2, Download, RefreshCcw, X, Info } from "lucide-react";

const C = { ink: "var(--txt)", sub: "var(--txt-2)", brand: "#FF6B5E", line: "var(--line-strong)", surface: "var(--surface)", cream: "var(--cream)", redsoft: "#ffe7e3" };
const shadow = "3px 3px 0 0 var(--line-strong)";

// TODO: Replace with your deployed FastAPI backend URL when available
// e.g. "https://api.pdf24x.com"
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

function formatBytes(bytes: number) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0; let n = bytes;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function PdfToWordClient() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle"|"converting"|"done"|"error">("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((newFile: File) => {
    if (newFile.type !== "application/pdf") return;
    setFile(newFile);
    setStatus("idle");
    setResultUrl(null);
    setErrorMessage("");
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setResultUrl(null);
    setErrorMessage("");
  };

  const handleConvert = async () => {
    if (!file) return;

    if (!API_BASE) {
      setErrorMessage("PDF to Word conversion requires a backend server. This feature will be available once the backend is deployed. Please check back soon.");
      setStatus("error");
      return;
    }

    setStatus("converting");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/api/pdf/to-word`, { method: "POST", body: formData });
      if (!res.ok) {
        let detail = "Conversion failed.";
        try { const d = await res.json(); detail = d.detail || detail; } catch {}
        throw new Error(detail);
      }
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
      setStatus("done");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ background: C.redsoft, border: `1px solid ${C.line}`, boxShadow: shadow }}>
          <FileText size={26} style={{ color: C.brand }} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl" style={{ color: C.ink, fontFamily: "Archivo, Inter, sans-serif" }}>PDF to Word</h1>
          <p className="mt-1 text-sm sm:text-base" style={{ color: C.sub }}>Convert your PDF into an editable Word document.</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="mb-5 flex items-start gap-3 rounded-xl p-4 text-sm" style={{ background: C.cream, border: `1px solid ${C.line}` }}>
        <Info size={16} className="mt-0.5 shrink-0" style={{ color: C.brand }} />
        <p style={{ color: C.sub }}>
          Works best on standard documents — letters, reports, articles with regular text and simple tables.
          Complex multi-column layouts or scanned PDFs may need some manual cleanup afterward.
        </p>
      </div>

      {/* Dropzone */}
      {!file && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById("pdf-word-input")?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all"
          style={{ borderColor: dragging ? C.brand : C.line, background: dragging ? C.redsoft : C.surface }}
        >
          <input id="pdf-word-input" type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: C.redsoft }}>
            <FileText size={28} style={{ color: C.brand }} />
          </span>
          <p className="mt-4 text-base font-semibold" style={{ color: C.ink }}>Drop your PDF file here</p>
          <p className="mt-1 text-sm" style={{ color: C.sub }}>or click to browse — one PDF at a time</p>
        </div>
      )}

      {/* File selected */}
      {file && status !== "done" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ border: `1px solid ${C.line}`, background: C.surface, boxShadow: shadow }}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: C.redsoft }}>
              <FileText size={16} style={{ color: C.brand }} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold" style={{ color: C.ink }}>{file.name}</p>
              <p className="text-xs" style={{ color: C.sub }}>{formatBytes(file.size)}</p>
            </div>
            <button type="button" onClick={reset} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ border: `1px solid ${C.line}`, background: C.cream, color: C.sub }}>
              <X size={15} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={status === "converting"}
              onClick={handleConvert}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
              style={{ background: C.brand, border: `1px solid ${C.line}`, boxShadow: shadow }}
            >
              {status === "converting" ? (
                <><Loader2 size={16} className="animate-spin" />Converting… this can take a moment</>
              ) : (
                <><FileText size={16} />Convert to Word</>
              )}
            </button>
            <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold" style={{ border: `1px solid ${C.line}`, background: C.cream, color: C.ink, boxShadow: shadow }}>
              <RefreshCcw size={15} />Start over
            </button>
          </div>

          {status === "error" && (
            <p className="rounded-xl px-4 py-3 text-sm font-medium" style={{ border: `1px solid ${C.line}`, background: C.redsoft, color: C.ink }}>
              {errorMessage}
            </p>
          )}
        </div>
      )}

      {/* Done */}
      {status === "done" && resultUrl && (
        <div className="flex flex-col items-center gap-4 rounded-2xl p-10 text-center" style={{ border: `1px solid ${C.line}`, background: C.surface, boxShadow: shadow }}>
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "#E4F5EC" }}>
            <FileText size={26} style={{ color: "var(--ok)" }} />
          </span>
          <p className="text-base font-bold" style={{ color: C.ink }}>Your Word document is ready!</p>
          <p className="max-w-sm text-sm" style={{ color: C.sub }}>
            Double-check formatting once you open it — some manual cleanup may be needed depending on the original PDF layout.
          </p>
          <a
            href={resultUrl}
            download="converted.docx"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
            style={{ background: C.brand, border: `1px solid ${C.line}`, boxShadow: shadow }}
          >
            <Download size={16} />Download Word document
          </a>
          <button type="button" onClick={reset} className="text-sm font-semibold" style={{ color: C.sub }}>
            Convert another file
          </button>
        </div>
      )}
    </div>
  );
}
