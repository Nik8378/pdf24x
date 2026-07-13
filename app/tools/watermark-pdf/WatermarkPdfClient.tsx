"use client";
import { useState, useCallback } from "react";
import ToolPageSections, { Breadcrumb } from "@/components/tool/ToolPageSections";
import { Droplets, Upload, Download, RefreshCcw, X, Loader2, Maximize2 } from "lucide-react";

const C = { ink: "#1a1a1a", sub: "#6b6760", brand: "#FF6B5E", line: "#1c1c1c", surface: "#ffffff", cream: "#f4f1ea", redsoft: "#ffe7e3" };
const shadow = "3px 3px 0 0 #1c1c1c";
const API = process.env.NEXT_PUBLIC_API_URL || "";

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

const POSITIONS = [
  { value: "center", label: "Center" },
  { value: "top-left", label: "Top Left" },
  { value: "top-right", label: "Top Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" },
];

const PAGE_OPTIONS = [
  { value: "all", label: "All Pages" },
  { value: "odd", label: "Odd Pages" },
  { value: "even", label: "Even Pages" },
];

const PRESET_TEXTS = ["CONFIDENTIAL", "DRAFT", "COPY", "APPROVED", "REJECTED", "TOP SECRET"];
const PRESET_COLORS = ["#FF0000", "#FF6B5E", "#0000FF", "#27AE60", "#F2994A", "#1a1a1a", "#6b6760"];

export default function WatermarkPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.3);
  const [color, setColor] = useState("#FF0000");
  const [position, setPosition] = useState("center");
  const [rotation, setRotation] = useState(-45);
  const [pages, setPages] = useState("all");
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (f.type !== "application/pdf") return;
    setFile(f); setResultUrl(null); setError("");
  }, []);

  const reset = () => { setFile(null); setResultUrl(null); setError(""); };

  const handleWatermark = async () => {
    if (!file || !text.trim()) return;
    setLoading(true); setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("text", text.trim());
      formData.append("font_size", String(fontSize));
      formData.append("opacity", String(opacity));
      formData.append("color", color);
      formData.append("position", position);
      formData.append("rotation", String(rotation));
      formData.append("pages", pages);
      const res = await fetch(`${API}/api/pdf/watermark`, { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to add watermark.");
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "PDF Tools", href: "/tools" }, { label: "Watermark PDF" }]} />
      <div className="mb-8 flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ background: "#FCE4EF", border: `1px solid ${C.line}`, boxShadow: shadow }}>
          <Droplets size={26} style={{ color: "#EC4899" }} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl" style={{ color: C.ink, fontFamily: "Archivo, Inter, sans-serif" }}>Watermark PDF</h1>
          <p className="mt-1 text-sm sm:text-base" style={{ color: C.sub }}>Add a custom text watermark to your PDF pages with full control.</p>
        </div>
      </div>

      {!file ? (
        <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => document.getElementById("watermark-input")?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all"
          style={{ borderColor: dragging ? "#EC4899" : C.line, background: dragging ? "#FCE4EF" : C.surface }}>
          <input id="watermark-input" type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "#FCE4EF" }}>
            <Upload size={28} style={{ color: "#EC4899" }} />
          </span>
          <p className="mt-4 text-base font-semibold" style={{ color: C.ink }}>Drop your PDF file here</p>
          <p className="mt-1 text-sm" style={{ color: C.sub }}>or click to browse</p>
        </div>
      ) : !resultUrl ? (
        <div className="space-y-5">
          {/* File row */}
          <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ border: `1px solid ${C.line}`, background: C.surface, boxShadow: shadow }}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: "#FCE4EF" }}>
              <Droplets size={16} style={{ color: "#EC4899" }} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold" style={{ color: C.ink }}>{file.name}</p>
              <p className="text-xs" style={{ color: C.sub }}>{formatBytes(file.size)}</p>
            </div>
            <button onClick={reset} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ border: `1px solid ${C.line}`, background: C.cream }}>
              <X size={15} style={{ color: C.sub }} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Left: text settings */}
            <div className="space-y-4 rounded-2xl p-5" style={{ border: `1px solid ${C.line}`, background: C.surface, boxShadow: shadow }}>
              <h3 className="text-sm font-bold" style={{ color: C.ink }}>Watermark Text</h3>

              {/* Preset texts */}
              <div>
                <p className="mb-2 text-xs font-semibold" style={{ color: C.sub }}>Quick presets</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TEXTS.map(t => (
                    <button key={t} onClick={() => setText(t)}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                      style={{ border: `1px solid ${C.line}`, background: text === t ? "#EC4899" : C.cream, color: text === t ? "#fff" : C.ink }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold" style={{ color: C.ink }}>Custom text</label>
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter watermark text"
                  className="w-full rounded-xl px-4 py-2.5 text-sm"
                  style={{ border: `1px solid ${C.line}`, background: C.cream, color: C.ink, outline: "none" }} />
              </div>

              {/* Color */}
              <div>
                <label className="mb-2 block text-xs font-semibold" style={{ color: C.ink }}>Color</label>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2 flex-wrap">
                    {PRESET_COLORS.map(c => (
                      <button key={c} onClick={() => setColor(c)}
                        className="h-7 w-7 rounded-full transition-all"
                        style={{ background: c, border: color === c ? `3px solid ${C.ink}` : `2px solid transparent`, outline: color === c ? `2px solid white` : "none", outlineOffset: "-4px" }} />
                    ))}
                  </div>
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded-lg shrink-0" style={{ border: `1px solid ${C.line}` }} />
                </div>
              </div>
            </div>

            {/* Right: position & style */}
            <div className="space-y-4 rounded-2xl p-5" style={{ border: `1px solid ${C.line}`, background: C.surface, boxShadow: shadow }}>
              <h3 className="text-sm font-bold" style={{ color: C.ink }}>Style & Position</h3>

              <div>
                <label className="mb-1.5 block text-xs font-semibold" style={{ color: C.ink }}>Font Size: {fontSize}px</label>
                <input type="range" min="20" max="120" value={fontSize} onChange={(e) => setFontSize(+e.target.value)} className="w-full" />
                <div className="flex justify-between text-xs mt-1" style={{ color: C.sub }}><span>Small</span><span>Large</span></div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold" style={{ color: C.ink }}>Opacity: {Math.round(opacity * 100)}%</label>
                <input type="range" min="0.05" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(+e.target.value)} className="w-full" />
                <div className="flex justify-between text-xs mt-1" style={{ color: C.sub }}><span>Subtle</span><span>Bold</span></div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold" style={{ color: C.ink }}>Rotation</label>
                <div className="flex gap-2">
                  {[0, 45, 90, 270, 315].map(r => (
                    <button key={r} onClick={() => setRotation(r)}
                      className="flex-1 rounded-lg py-2 text-xs font-semibold transition-all"
                      style={{ border: `1px solid ${C.line}`, background: rotation === r ? "#EC4899" : C.cream, color: rotation === r ? "#fff" : C.ink }}>
                      {r}°
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold" style={{ color: C.ink }}>Position</label>
                <div className="grid grid-cols-3 gap-2">
                  {POSITIONS.map(p => (
                    <button key={p.value} onClick={() => setPosition(p.value)}
                      className="rounded-lg py-2 text-xs font-semibold transition-all"
                      style={{ border: `1px solid ${C.line}`, background: position === p.value ? "#EC4899" : C.cream, color: position === p.value ? "#fff" : C.ink }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold" style={{ color: C.ink }}>Apply to</label>
                <div className="flex gap-2">
                  {PAGE_OPTIONS.map(p => (
                    <button key={p.value} onClick={() => setPages(p.value)}
                      className="flex-1 rounded-lg py-2 text-xs font-semibold transition-all"
                      style={{ border: `1px solid ${C.line}`, background: pages === p.value ? "#EC4899" : C.cream, color: pages === p.value ? "#fff" : C.ink }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview text */}
          <div className="rounded-xl p-4 text-center" style={{ border: `1px solid ${C.line}`, background: C.cream }}>
            <p className="text-xs font-semibold mb-2" style={{ color: C.sub }}>PREVIEW</p>
            <div className="relative inline-block bg-white rounded-lg px-8 py-6 w-full max-w-sm overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
              <div className="text-xs text-gray-300 text-left space-y-1 mb-2">
                <div className="h-2 bg-gray-200 rounded w-3/4" />
                <div className="h-2 bg-gray-200 rounded w-full" />
                <div className="h-2 bg-gray-200 rounded w-2/3" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="font-bold whitespace-nowrap" style={{
                  color, opacity, fontSize: Math.min(fontSize * 0.4, 32),
                  transform: `rotate(${rotation}deg)`, fontFamily: "Arial, sans-serif"
                }}>{text || "WATERMARK"}</span>
              </div>
              <div className="text-xs text-gray-300 text-left space-y-1 mt-2">
                <div className="h-2 bg-gray-200 rounded w-full" />
                <div className="h-2 bg-gray-200 rounded w-4/5" />
              </div>
            </div>
          </div>

          {error && <p className="rounded-xl px-4 py-3 text-sm" style={{ border: `1px solid ${C.line}`, background: C.redsoft, color: C.ink }}>{error}</p>}

          <div className="flex flex-wrap gap-3">
            <button onClick={handleWatermark} disabled={loading || !text.trim()}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50 transition-all hover:-translate-y-0.5"
              style={{ background: "#EC4899", border: `1px solid ${C.line}`, boxShadow: shadow }}>
              {loading ? <><Loader2 size={16} className="animate-spin" />Adding watermark…</> : <><Droplets size={16} />Add Watermark</>}
            </button>
            <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
              style={{ border: `1px solid ${C.line}`, background: C.cream, color: C.ink, boxShadow: shadow }}>
              <RefreshCcw size={15} />Start over
            </button>
          </div>
        </div>
      ) : (
        /* Result with preview */
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl p-8 text-center" style={{ border: `1px solid ${C.line}`, background: C.surface, boxShadow: shadow }}>
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "#E4F5EC" }}>
              <Droplets size={26} style={{ color: "#27AE60" }} />
            </span>
            <p className="text-base font-bold" style={{ color: C.ink }}>Watermark added!</p>
            <p className="text-sm" style={{ color: C.sub }}>Your PDF has been watermarked with &quot;{text}&quot;</p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <a href={resultUrl} download="watermarked.pdf"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                style={{ background: "#EC4899", border: `1px solid ${C.line}`, boxShadow: shadow }}>
                <Download size={16} />Download PDF
              </a>
              <button onClick={() => setModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold lg:hidden"
                style={{ border: `1px solid ${C.line}`, background: C.cream, color: C.ink, boxShadow: shadow }}>
                <Maximize2 size={15} />Preview PDF
              </button>
              <button onClick={reset} className="text-sm font-semibold" style={{ color: C.sub }}>
                Watermark another file
              </button>
            </div>
          </div>
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

      {/* Modal */}
      {modalOpen && resultUrl && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: C.line, background: C.cream }}>
            <span className="text-sm font-semibold" style={{ color: C.ink }}>Watermarked PDF</span>
            <button onClick={() => setModalOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ border: `1px solid ${C.line}`, background: C.surface }}>
              <X size={16} style={{ color: C.sub }} />
            </button>
          </div>
          <iframe src={resultUrl} className="flex-1 w-full bg-white" />
        </div>
      )}
      <ToolPageSections
        breadcrumb={[]}
        processingMode="server"
        howToSteps={[
          { title: "Upload your PDF", desc: "Drop your PDF or click to browse." },
          { title: "Set watermark text", desc: "Choose from presets like CONFIDENTIAL or enter custom text." },
          { title: "Customise appearance", desc: "Set color, font size, opacity, position, and rotation." },
          { title: "Select pages", desc: "Apply to all pages, odd pages, or even pages." },
          { title: "Download watermarked PDF", desc: "Click Add Watermark and download the result." },
        ]}
        useCases={[
          "Mark documents as CONFIDENTIAL or DRAFT",
          "Brand PDFs with a company name",
          "Indicate document status before sharing",
          "Protect documents from unauthorised redistribution",
          "Add review status to report drafts",
        ]}
        relatedTools={["rotate-pdf", "compress", "merge"]}
        faqs={[
          { q: "What text can I use as a watermark?", a: "You can use any text including CONFIDENTIAL, DRAFT, COPY, APPROVED, your company name, or any custom text." },
          { q: "Can I control watermark position?", a: "Yes. You can place the watermark at the center, top-left, top-right, bottom-left, or bottom-right of each page." },
          { q: "Can I control opacity?", a: "Yes. The opacity slider lets you control how visible or subtle the watermark appears." },
          { q: "Does watermarking affect PDF quality?", a: "No. The watermark is added as a text overlay. The underlying PDF content is not re-encoded or compressed." },
          { q: "Do I need to create an account?", a: "No. The tool is free to use without registration." },
        ]}
      />
    </div>
  );
}
