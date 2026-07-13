"use client";
import ToolPageSections from "@/components/tool/ToolPageSections";
import { useState, useRef, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Layers, UploadCloud, Trash2, FileText, Info, Download } from "lucide-react";

function fmtBytes(b: number) {
  return b < 1024 * 1024
    ? (b / 1024).toFixed(1) + " KB"
    : (b / (1024 * 1024)).toFixed(2) + " MB";
}

function parseRange(input: string, total: number): number[] {
  const pages = new Set<number>();
  input.split(",").forEach((part) => {
    const t = part.trim();
    if (t.includes("-")) {
      const [s, e] = t.split("-").map(Number);
      for (let i = s; i <= Math.min(e, total); i++) if (i >= 1) pages.add(i - 1);
    } else {
      const n = parseInt(t);
      if (!isNaN(n) && n >= 1 && n <= total) pages.add(n - 1);
    }
  });
  return Array.from(pages).sort((a, b) => a - b);
}

export default function PdfToJpgClient() {
  const [pdf, setPdf] = useState<{ name: string; size: number; file: File; pages: number } | null>(null);
  const [quality, setQuality] = useState("high");
  const [pageRange, setPageRange] = useState<"all" | "custom">("all");
  const [customRange, setCustomRange] = useState("");
  const [resolution, setResolution] = useState("150");
  const [colorMode, setColorMode] = useState("color");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previews, setPreviews] = useState<{ url: string; page: number }[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const qualityMap: Record<string, number> = { low: 0.5, medium: 0.75, high: 0.92, maximum: 1.0 };

  const handleFile = useCallback(async (f: File) => {
    if (f.type !== "application/pdf") { showToast("Please upload a PDF file", "error"); return; }
    if (f.size > 100 * 1024 * 1024) { showToast("File too large. Max 100MB.", "error"); return; }
    try {
      // @ts-expect-error -- pdfjs-dist ESM import
      const pdfjsLib = await import("pdfjs-dist/build/pdf.min.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;
      const bytes = await f.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
      setPdf({ name: f.name, size: f.size, file: f, pages: doc.numPages });
      setPreviews([]);
      showToast("PDF loaded — ready to convert");
    } catch {
      showToast("Could not read PDF. File may be corrupted.", "error");
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0]; if (f) handleFile(f);
  };

  const handleConvert = async () => {
    if (!pdf) return;
    setLoading(true);
    setProgress(0);
    const newPreviews: { url: string; page: number }[] = [];
    try {
      // @ts-expect-error -- pdfjs-dist ESM import
      const pdfjsLib = await import("pdfjs-dist/build/pdf.min.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;
      const bytes = await pdf.file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
      const total = doc.numPages;
      const scale = parseInt(resolution) / 72;
      const q = qualityMap[quality] ?? 0.92;

      const pagesToConvert =
        pageRange === "all"
          ? Array.from({ length: total }, (_, i) => i)
          : parseRange(customRange, total);

      for (let idx = 0; idx < pagesToConvert.length; idx++) {
        const pageIdx = pagesToConvert[idx];
        setProgress(Math.round(((idx + 1) / pagesToConvert.length) * 100));
        const page = await doc.getPage(pageIdx + 1);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;

        if (colorMode === "grayscale") {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          for (let i = 0; i < imgData.data.length; i += 4) {
            const avg = 0.299 * imgData.data[i] + 0.587 * imgData.data[i + 1] + 0.114 * imgData.data[i + 2];
            imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = avg;
          }
          ctx.putImageData(imgData, 0, 0);
        }

        const dataUrl = canvas.toDataURL("image/jpeg", q);
        const fname = `${pdf.name.replace(".pdf", "")}-page-${pageIdx + 1}.jpg`;

        if (newPreviews.length < 6) newPreviews.push({ url: dataUrl, page: pageIdx + 1 });

        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = fname;
        a.click();
        await new Promise((r) => setTimeout(r, 80));
      }

      setPreviews(newPreviews);
      showToast(`Converted ${pagesToConvert.length} page${pagesToConvert.length > 1 ? "s" : ""} to JPG!`);
    } catch (err) {
      console.error(err);
      showToast("Conversion failed. Please try again.", "error");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1a1917]">PDF to JPG</h1>
            <p className="text-[13px] text-[#7a7875]">Convert PDF pages to high-quality JPG images. Free and private.</p>
          </div>

          <div className="flex flex-col xl:flex-row gap-4 items-start">
            <div className="flex-1 min-w-0 w-full space-y-4">
              {/* Upload */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all shadow-sm flex flex-col items-center justify-center min-h-[200px] ${dragging ? "border-accent bg-accent-light" : "border-[#1a1917]/15 bg-white hover:border-accent hover:bg-accent-light"}`}
              >
                <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                <div className="w-11 h-11 rounded-full bg-[#f4f3f0] flex items-center justify-center mb-3">
                  <UploadCloud size={20} className="text-[#7a7875]" />
                </div>
                <p className="text-[14px] font-semibold text-[#1a1917] mb-1">Drag & drop your PDF here</p>
                <p className="text-[12.5px] text-[#7a7875] mb-4">or click to browse file</p>
                <button onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold text-[13.5px] px-6 py-2.5 rounded-full shadow-md transition-all">
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
                    <p className="text-[11.5px] text-[#7a7875]">{fmtBytes(pdf.size)} · {pdf.pages} pages</p>
                  </div>
                  <button onClick={() => { setPdf(null); setPreviews([]); }}
                    className="p-2 rounded-lg text-[#7a7875] hover:text-red-500 hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}

              {/* Progress */}
              {loading && (
                <div className="bg-white border border-[#1a1917]/10 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[13px] font-semibold text-[#1a1917]">Converting pages…</p>
                    <p className="text-[13px] text-accent font-bold">{progress}%</p>
                  </div>
                  <div className="h-1.5 bg-[#f4f3f0] rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {/* Previews */}
              {previews.length > 0 && (
                <div className="bg-white border border-[#1a1917]/10 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[13px] font-bold text-[#1a1917]">Conversion Preview</p>
                    <span className="text-[11.5px] text-[#7a7875]">{pdf?.pages} pages total</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {previews.map((p) => (
                      <div key={p.page} className="border border-[#1a1917]/10 rounded-lg overflow-hidden">
                        <img src={p.url} alt={`Page ${p.page}`} className="w-full object-cover" />
                        <p className="text-[10.5px] text-[#7a7875] text-center py-1">p.{p.page}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-start gap-1.5 mt-3 text-[11.5px] text-[#7a7875] bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    <Info size={12} className="text-blue-500 shrink-0 mt-0.5" />
                    Files were downloaded automatically. Check your Downloads folder.
                  </div>
                </div>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[["Real Rendering", "Uses PDF.js — actual page content"],
                  ["High Resolution", "Up to 300 DPI print quality"],
                  ["100% Private", "Files never leave your device"],
                  ["All Pages", "Convert single pages or all at once"],
                ].map(([t, d]) => (
                  <div key={t} className="bg-white border border-[#1a1917]/10 rounded-xl p-3 shadow-sm">
                    <p className="text-[12px] font-bold text-[#1a1917] mb-0.5">{t}</p>
                    <p className="text-[11px] text-[#7a7875]">{d}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings sidebar */}
            <div className="w-full xl:w-[280px] shrink-0 xl:sticky xl:top-14">
              <div className="bg-white border border-[#1a1917]/10 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-[#1a1917]/8">
                  <Layers size={14} className="text-[#7a7875]" />
                  <h3 className="text-[13px] font-bold text-[#1a1917]">Conversion Settings</h3>
                </div>

                <div className="space-y-3.5">
                  {/* Quality */}
                  <div>
                    <p className="text-[10.5px] font-bold text-[#1a1917] uppercase tracking-widest opacity-50 mb-2">Image Quality</p>
                    <select value={quality} onChange={(e) => setQuality(e.target.value)}
                      className="w-full bg-[#f4f3f0] border border-[#1a1917]/12 rounded-lg px-3 py-2 text-[13px] text-[#1a1917] appearance-none focus:outline-none focus:border-accent"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237a7875' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>
                      <option value="low">Low (smaller file)</option>
                      <option value="medium">Medium</option>
                      <option value="high">High (recommended)</option>
                      <option value="maximum">Maximum quality</option>
                    </select>
                    <p className="text-[11px] text-[#7a7875] mt-1">Higher quality = larger file size.</p>
                  </div>

                  {/* Resolution */}
                  <div>
                    <p className="text-[10.5px] font-bold text-[#1a1917] uppercase tracking-widest opacity-50 mb-2">Resolution (DPI)</p>
                    <div className="flex border border-[#1a1917]/12 rounded-lg overflow-hidden">
                      {["72", "96", "150", "300"].map((r) => (
                        <button key={r} onClick={() => setResolution(r)}
                          className={`flex-1 py-1.5 text-[12px] font-medium transition-colors border-r border-[#1a1917]/10 last:border-0 ${resolution === r ? "bg-txt text-white" : "bg-white text-[#4a4845] hover:bg-[#f4f3f0]"}`}>
                          {r}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-[#7a7875] mt-1">150 = screen, 300 = print quality.</p>
                  </div>

                  {/* Page Range */}
                  <div>
                    <p className="text-[10.5px] font-bold text-[#1a1917] uppercase tracking-widest opacity-50 mb-2">Page Range</p>
                    {[["all", "All Pages"], ["custom", "Custom Range"]].map(([val, label]) => (
                      <label key={val} className="flex items-center gap-2 mb-2 cursor-pointer"
                        onClick={() => setPageRange(val as "all" | "custom")}>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${pageRange === val ? "border-accent bg-accent" : "border-[#d4d2cb]"}`}>
                          {pageRange === val && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-[12.5px] text-[#1a1917]">{label}</span>
                      </label>
                    ))}
                    {pageRange === "custom" && (
                      <input value={customRange} onChange={(e) => setCustomRange(e.target.value)}
                        className="w-full bg-[#f4f3f0] border border-[#1a1917]/12 rounded-lg px-3 py-2 text-[13px] text-[#1a1917] focus:outline-none focus:border-accent mt-1"
                        placeholder="e.g. 1-5, 8, 10-12" />
                    )}
                  </div>

                  {/* Color Mode */}
                  <div>
                    <p className="text-[10.5px] font-bold text-[#1a1917] uppercase tracking-widest opacity-50 mb-2">Color Mode</p>
                    <div className="flex border border-[#1a1917]/12 rounded-lg overflow-hidden">
                      {["color", "grayscale"].map((m) => (
                        <button key={m} onClick={() => setColorMode(m)}
                          className={`flex-1 py-1.5 text-[12px] font-medium transition-colors border-r border-[#1a1917]/10 last:border-0 capitalize ${colorMode === m ? "bg-txt text-white" : "bg-white text-[#4a4845] hover:bg-[#f4f3f0]"}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#1a1917]/8 mt-3 pt-3">
                  <button onClick={handleConvert} disabled={!pdf || loading}
                    className={`w-full flex items-center justify-center gap-2 font-semibold text-[14px] py-3 rounded-full transition-all ${!pdf || loading ? "bg-[#f4f3f0] text-[#7a7875] cursor-not-allowed" : "bg-accent hover:bg-accent-dark text-white shadow-md"}`}>
                    {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full spin" /> : <Download size={16} />}
                    {loading ? `Converting… ${progress}%` : "Convert to JPG →"}
                  </button>
                  <p className="text-center text-[11px] text-[#7a7875] mt-2">Files processed locally — never uploaded.</p>
                </div>
              </div>
            </div>
          </div>
  
      <div className="mx-4 sm:mx-6 lg:mx-8 mt-4">
        <ToolPageSections
          breadcrumb={[]}
          relatedTools={["image-to-pdf", "compress", "split"]}
          relatedBlogs={[
            { title: "How to Convert JPG and PNG Images to PDF", href: "/blog/how-to-convert-jpg-png-to-pdf-free" },
          ]}
        />
      </div>
      </main>
      </div>
      {toast && (
        <div className={`fixed bottom-20 lg:bottom-5 right-4 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[13.5px] font-medium z-[200] toast-enter ${toast.type === "success" ? "bg-green-700 text-white" : "bg-red-600 text-white"}`}>
          {toast.msg}
        </div>
      )}
    </>
  );
}
