"use client";
import { useState, useRef, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Minimize2, UploadCloud, Trash2, FileText, Info } from "lucide-react";

type Level = "extreme" | "strong" | "medium";
interface PDFFile { name: string; size: number; file: File; }

function fmtBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

const LEVEL_CONFIG: Record<Level, { label: string; badge: string; badgeColor: string; desc: string; quality: number }> = {
  extreme: { label: "Extreme Compression", badge: "Smallest Size", badgeColor: "bg-accent-bg text-accent", desc: "Maximum compression for sharing and email. Quality is reduced.", quality: 0.3 },
  strong:  { label: "Strong Compression",  badge: "Recommended",  badgeColor: "bg-green-100 text-green-700", desc: "Great balance between size and quality. Perfect for most uses.", quality: 0.6 },
  medium:  { label: "Medium Compression",  badge: "",             badgeColor: "", desc: "Good quality with moderate size reduction. Ideal for documents.", quality: 0.82 },
};

export default function CompressClient() {
  const [pdf, setPdf] = useState<PDFFile | null>(null);
  const [level, setLevel] = useState<Level>("strong");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ original: number; compressed: number } | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFile = useCallback((f: File) => {
    if (f.type !== "application/pdf") { showToast("Please upload a PDF file", "error"); return; }
    if (f.size > 100 * 1024 * 1024) { showToast("File too large. Max 100MB.", "error"); return; }
    setPdf({ name: f.name, size: f.size, file: f });
    setResult(null);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0]; if (f) handleFile(f);
  };

  const handleCompress = async () => {
    if (!pdf) return;
    setLoading(true);
    setProgress(5);
    try {
      // Load PDF.js to render pages as images then rebuild PDF
      // @ts-expect-error -- pdfjs-dist ESM import
      const pdfjsLib = await import("pdfjs-dist/build/pdf.min.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;
      const { PDFDocument } = await import("pdf-lib");

      const q = LEVEL_CONFIG[level].quality;
      const bytes = await pdf.file.arrayBuffer();
      setProgress(10);

      const srcDoc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
      const numPages = srcDoc.numPages;

      // Scale: extreme=0.8, strong=1.0, medium=1.2 (relative render scale)
      const renderScale = level === "extreme" ? 0.8 : level === "strong" ? 1.0 : 1.2;

      const newDoc = await PDFDocument.create();

      for (let i = 1; i <= numPages; i++) {
        setProgress(10 + Math.round(((i - 1) / numPages) * 80));
        const page = await srcDoc.getPage(i);
        const vp = page.getViewport({ scale: renderScale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(vp.width);
        canvas.height = Math.round(vp.height);
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        const dataUrl = canvas.toDataURL("image/jpeg", q);
        const imgBytes = Uint8Array.from(atob(dataUrl.split(",")[1]), (c) => c.charCodeAt(0));
        const embeddedImg = await newDoc.embedJpg(imgBytes);
        // Use original page size in points
        const origVp = page.getViewport({ scale: 1 });
        const newPage = newDoc.addPage([origVp.width, origVp.height]);
        newPage.drawImage(embeddedImg, { x: 0, y: 0, width: origVp.width, height: origVp.height });
      }

      setProgress(95);
      const compressed = await newDoc.save({ useObjectStreams: true });
      setProgress(100);

      const blob = new Blob([compressed.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = pdf.name.replace(".pdf", "_compressed.pdf");
      a.click();
      URL.revokeObjectURL(url);

      setResult({ original: pdf.size, compressed: compressed.byteLength });
      showToast("PDF compressed and downloaded!");
    } catch (err) {
      console.error(err);
      showToast("Compression failed. Please try again.", "error");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const savings = result ? Math.round((1 - result.compressed / result.original) * 100) : 0;

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1a1917]">Compress PDF</h1>
            <p className="text-[13px] text-[#7a7875]">Reduce PDF file size while maintaining the best possible quality.</p>
          </div>

          <div className="flex flex-col xl:flex-row gap-4 items-start">
            <div className="flex-1 min-w-0 w-full space-y-4">
              {/* Upload */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all shadow-sm flex flex-col items-center justify-center min-h-[220px] ${dragging ? "border-accent bg-accent-light" : "border-[#1a1917]/15 bg-white hover:border-accent hover:bg-accent-light"}`}
              >
                <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                <div className="w-11 h-11 rounded-full bg-[#f4f3f0] flex items-center justify-center mb-3">
                  <UploadCloud size={20} className="text-[#7a7875]" />
                </div>
                <p className="text-[14px] font-semibold text-[#1a1917] mb-1">Drag & drop your PDF here</p>
                <p className="text-[12.5px] text-[#7a7875] mb-4">or click to browse files</p>
                <button onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold text-[13.5px] px-6 py-2.5 rounded-full transition-all shadow-md">
                  <UploadCloud size={15} /> Choose PDF File
                </button>
                <p className="mt-3 text-[11.5px] text-[#7a7875]">Max file size: 100MB</p>
              </div>

              {/* File info */}
              {pdf && (
                <div className="bg-white border border-[#1a1917]/10 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1a1917] truncate">{pdf.name}</p>
                    <p className="text-[11.5px] text-[#7a7875]">{fmtBytes(pdf.size)}</p>
                  </div>
                  <button onClick={() => { setPdf(null); setResult(null); }}
                    className="p-2 rounded-lg text-[#7a7875] hover:text-red-500 hover:bg-red-50 transition-all">
                    <Trash2 size={15} />
                  </button>
                </div>
              )}

              {/* Progress */}
              {loading && (
                <div className="bg-white border border-[#1a1917]/10 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[13px] font-semibold text-[#1a1917]">Compressing PDF…</p>
                    <p className="text-[13px] text-accent font-bold">{progress}%</p>
                  </div>
                  <div className="h-1.5 bg-[#f4f3f0] rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-[11.5px] text-[#7a7875] mt-2">Re-encoding images at reduced quality…</p>
                </div>
              )}

              {/* Result */}
              {result && (
                <div className="bg-white border border-green-200 rounded-xl p-4 shadow-sm">
                  <p className="text-[13px] font-bold text-[#1a1917] mb-3">Compression Result</p>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[11px] text-[#7a7875]">Original</p>
                      <p className="text-[18px] font-bold text-[#1a1917]">{fmtBytes(result.original)}</p>
                    </div>
                    <div className="text-center">
                      <span className="text-[12px] font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        -{savings}% smaller
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-[#7a7875]">Compressed</p>
                      <p className="text-[18px] font-bold text-accent">{fmtBytes(result.compressed)}</p>
                    </div>
                  </div>
                  <div className="h-2 bg-[#f4f3f0] rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${100 - savings}%` }} />
                  </div>
                  <div className="flex items-start gap-1.5 mt-3 text-[11.5px] text-[#7a7875] bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                    <Info size={12} className="text-green-600 shrink-0 mt-0.5" />
                    Your compressed PDF was downloaded automatically.
                  </div>
                </div>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[["100% Private", "Files never leave your device"],
                  ["Real Compression", "Re-encodes images at target quality"],
                  ["No Watermarks", "Clean output, no branding added"],
                  ["All Browsers", "Works on desktop and mobile"]].map(([t, d]) => (
                  <div key={t} className="bg-white border border-[#1a1917]/10 rounded-xl p-3 shadow-sm">
                    <p className="text-[12px] font-bold text-[#1a1917] mb-0.5">{t}</p>
                    <p className="text-[11px] text-[#7a7875]">{d}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="w-full xl:w-[280px] shrink-0 xl:sticky xl:top-14">
              <div className="bg-white border border-[#1a1917]/10 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-2.5 border-b border-[#1a1917]/8">
                  <Minimize2 size={14} className="text-[#7a7875]" />
                  <h3 className="text-[13px] font-bold text-[#1a1917]">Compression Settings</h3>
                </div>

                <p className="text-[10.5px] font-bold text-[#1a1917] uppercase tracking-widest opacity-50 mb-2">Level</p>
                <div className="space-y-2 mb-4">
                  {(Object.keys(LEVEL_CONFIG) as Level[]).map((l) => (
                    <button key={l} onClick={() => setLevel(l)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all ${level === l ? "border-accent bg-gradient-to-r from-accent-light to-amber-50/60" : "border-[#1a1917]/10 hover:bg-[#f4f3f0]"}`}>
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${level === l ? "border-accent bg-accent" : "border-[#d4d2cb]"}`}>
                            {level === l && <div className="w-1 h-1 rounded-full bg-white" />}
                          </div>
                          <span className="text-[13px] font-bold text-[#1a1917]">{LEVEL_CONFIG[l].label}</span>
                        </div>
                        {LEVEL_CONFIG[l].badge && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${LEVEL_CONFIG[l].badgeColor}`}>
                            {LEVEL_CONFIG[l].badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#7a7875] ml-5">{LEVEL_CONFIG[l].desc}</p>
                    </button>
                  ))}
                </div>

                <div className="flex items-start gap-1.5 text-[11.5px] text-[#7a7875] bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-4">
                  <Info size={12} className="text-blue-500 shrink-0 mt-0.5" />
                  Compression works by re-rendering pages as JPEG images at reduced quality.
                </div>

                <div className="border-t border-[#1a1917]/8 pt-3">
                  <button onClick={handleCompress} disabled={!pdf || loading}
                    className={`w-full flex items-center justify-center gap-2 font-semibold text-[14px] py-3 rounded-full transition-all ${!pdf || loading ? "bg-[#f4f3f0] text-[#7a7875] cursor-not-allowed" : "bg-accent hover:bg-accent-dark text-white shadow-md hover:shadow-lg"}`}>
                    {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full spin" /> : <Minimize2 size={16} />}
                    {loading ? `Compressing… ${progress}%` : "Compress PDF →"}
                  </button>
                  <p className="text-center text-[11px] text-[#7a7875] mt-2">Your file is processed locally and never stored.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      {toast && (
        <div className={`fixed bottom-20 lg:bottom-5 right-4 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[13.5px] font-medium max-w-sm z-[200] toast-enter ${toast.type === "success" ? "bg-green-700 text-white" : "bg-red-600 text-white"}`}>
          {toast.msg}
        </div>
      )}
    </>
  );
}
