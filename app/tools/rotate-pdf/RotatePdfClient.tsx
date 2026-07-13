"use client";
import { useState, useCallback } from "react";
import ToolPageSections, { Breadcrumb } from "@/components/tool/ToolPageSections";
import { RotateCw, Upload, Download, RefreshCcw, X, Loader2 } from "lucide-react";

const C = { ink: "#1a1a1a", sub: "#6b6760", brand: "#FF6B5E", line: "#1c1c1c", surface: "#ffffff", cream: "#f4f1ea", redsoft: "#ffe7e3" };
const shadow = "3px 3px 0 0 #1c1c1c";

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

export default function RotatePdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [pageMode, setPageMode] = useState<"all" | "even" | "odd">("all");
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (f.type !== "application/pdf") return;
    setFile(f); setResultUrl(null);
  }, []);

  const reset = () => { setFile(null); setResultUrl(null); };

  const handleRotate = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const { PDFDocument, degrees } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const pages = doc.getPages();
      pages.forEach((page, i) => {
        const pageNum = i + 1;
        const shouldRotate =
          pageMode === "all" ||
          (pageMode === "even" && pageNum % 2 === 0) ||
          (pageMode === "odd" && pageNum % 2 !== 0);
        if (shouldRotate) {
          const current = page.getRotation().angle;
          page.setRotation(degrees((current + rotation) % 360));
        }
      });
      const out = await doc.save();
      setResultUrl(URL.createObjectURL(new Blob([out as BlobPart], { type: "application/pdf" })));
    } catch (e) {
      alert("Failed to rotate PDF. The file may be password protected.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "PDF Tools", href: "/tools" }, { label: "Rotate PDF" }]} />
      <div className="mb-8 flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ background: C.redsoft, border: `1px solid ${C.line}`, boxShadow: shadow }}>
          <RotateCw size={26} style={{ color: C.brand }} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl" style={{ color: C.ink, fontFamily: "Archivo, Inter, sans-serif" }}>Rotate PDF</h1>
          <p className="mt-1 text-sm sm:text-base" style={{ color: C.sub }}>Rotate all or specific pages of your PDF file.</p>
        </div>
      </div>

      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => document.getElementById("rotate-input")?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all"
          style={{ borderColor: dragging ? C.brand : C.line, background: dragging ? C.redsoft : C.surface }}
        >
          <input id="rotate-input" type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: C.redsoft }}>
            <Upload size={28} style={{ color: C.brand }} />
          </span>
          <p className="mt-4 text-base font-semibold" style={{ color: C.ink }}>Drop your PDF file here</p>
          <p className="mt-1 text-sm" style={{ color: C.sub }}>or click to browse</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ border: `1px solid ${C.line}`, background: C.surface, boxShadow: shadow }}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: C.redsoft }}>
              <RotateCw size={16} style={{ color: C.brand }} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold" style={{ color: C.ink }}>{file.name}</p>
              <p className="text-xs" style={{ color: C.sub }}>{formatBytes(file.size)}</p>
            </div>
            <button onClick={reset} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ border: `1px solid ${C.line}`, background: C.cream }}>
              <X size={15} style={{ color: C.sub }} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-bold" style={{ color: C.ink }}>Rotation angle</p>
              <div className="flex gap-3">
                {([90, 180, 270] as const).map((deg) => (
                  <button key={deg} onClick={() => setRotation(deg)}
                    className="flex-1 rounded-xl py-3 text-sm font-bold transition-all"
                    style={{ border: `1px solid ${C.line}`, background: rotation === deg ? C.brand : C.surface, color: rotation === deg ? "#fff" : C.ink, boxShadow: shadow }}>
                    {deg}°
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-bold" style={{ color: C.ink }}>Apply to pages</p>
              <div className="flex gap-3">
                {(["all", "odd", "even"] as const).map((m) => (
                  <button key={m} onClick={() => setPageMode(m)}
                    className="flex-1 rounded-xl py-3 text-sm font-bold capitalize transition-all"
                    style={{ border: `1px solid ${C.line}`, background: pageMode === m ? C.brand : C.surface, color: pageMode === m ? "#fff" : C.ink, boxShadow: shadow }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {resultUrl ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl p-8 text-center" style={{ border: `1px solid ${C.line}`, background: C.surface, boxShadow: shadow }}>
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "#E4F5EC" }}>
                <RotateCw size={26} style={{ color: "#27AE60" }} />
              </span>
              <p className="text-base font-bold" style={{ color: C.ink }}>PDF rotated successfully!</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <a href={resultUrl} download="rotated.pdf"
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
                  style={{ background: C.brand, border: `1px solid ${C.line}`, boxShadow: shadow }}>
                  <Download size={16} />Download PDF
                </a>
                <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
                  style={{ border: `1px solid ${C.line}`, background: C.cream, color: C.ink, boxShadow: shadow }}>
                  <RefreshCcw size={15} />Rotate another
                </button>
              </div>
            </div>
          ) : (
            <button onClick={handleRotate} disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
              style={{ background: C.brand, border: `1px solid ${C.line}`, boxShadow: shadow }}>
              {loading ? <><Loader2 size={16} className="animate-spin" />Rotating…</> : <><RotateCw size={16} />Rotate PDF</>}
            </button>
          )}
        </div>
      )}
      <ToolPageSections
        processingMode="browser"
        howToSteps={[
          { title: "Upload your PDF", desc: "Drop your PDF file or click to browse." },
          { title: "Choose rotation angle", desc: "Select 90°, 180°, or 270° rotation." },
          { title: "Select pages to rotate", desc: "Rotate all pages, only odd, or only even pages." },
          { title: "Download rotated PDF", desc: "Click Rotate PDF and download the result instantly." },
        ]}
        useCases={[
          "Fix upside-down scanned documents",
          "Correct orientation of photographed pages",
          "Rotate specific pages in a report",
          "Prepare documents for printing",
          "Fix sideways pages before sharing",
        ]}
        relatedTools={["merge", "split", "watermark-pdf"]}
        faqs={[
          { q: "Can I rotate only specific pages?", a: "Yes. You can rotate all pages, only odd-numbered pages, or only even-numbered pages. Select the option before rotating." },
          { q: "What rotation angles are supported?", a: "You can rotate pages by 90°, 180°, or 270° clockwise." },
          { q: "Does rotating a PDF reduce quality?", a: "No. Rotating a PDF only changes the page orientation metadata. No image re-encoding or quality loss occurs." },
          { q: "Is my file uploaded to a server?", a: "No. Rotate PDF processes your file entirely in your browser. Your file is never sent to any server." },
          { q: "Do I need to create an account?", a: "No account or sign-up is required. The tool is free to use." },
        ]}
      />
    </div>
  );
}
