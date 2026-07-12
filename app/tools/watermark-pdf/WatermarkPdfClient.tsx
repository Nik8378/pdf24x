"use client";
import { useState, useCallback } from "react";
import { Droplets, Upload, Download, RefreshCcw, X, Loader2 } from "lucide-react";

const C = { ink: "#1a1a1a", sub: "#6b6760", brand: "#FF6B5E", line: "#1c1c1c", surface: "#ffffff", cream: "#f4f1ea", redsoft: "#ffe7e3" };
const shadow = "3px 3px 0 0 #1c1c1c";

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

const POSITIONS = ["center", "top-left", "top-right", "bottom-left", "bottom-right"] as const;
type Position = typeof POSITIONS[number];

export default function WatermarkPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.3);
  const [color, setColor] = useState("#FF6B5E");
  const [position, setPosition] = useState<Position>("center");
  const [rotation, setRotation] = useState(-45);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (f.type !== "application/pdf") return;
    setFile(f); setResultUrl(null);
  }, []);

  const reset = () => { setFile(null); setResultUrl(null); };

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { r, g, b };
  };

  const getPosition = (pageWidth: number, pageHeight: number, pos: Position, fs: number) => {
    const pad = 40;
    switch (pos) {
      case "top-left": return { x: pad, y: pageHeight - pad - fs };
      case "top-right": return { x: pageWidth - pad - (text.length * fs * 0.5), y: pageHeight - pad - fs };
      case "bottom-left": return { x: pad, y: pad };
      case "bottom-right": return { x: pageWidth - pad - (text.length * fs * 0.5), y: pad };
      default: return { x: pageWidth / 2 - (text.length * fs * 0.3), y: pageHeight / 2 };
    }
  };

  const handleWatermark = async () => {
    if (!file || !text.trim()) return;
    setLoading(true);
    try {
      const { PDFDocument, rgb, degrees } = await import("pdf-lib");
      const { StandardFonts } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const { r, g, b } = hexToRgb(color);
      const pages = doc.getPages();
      for (const page of pages) {
        const { width, height } = page.getSize();
        const { x, y } = getPosition(width, height, position, fontSize);
        page.drawText(text, {
          x, y, size: fontSize, font,
          color: rgb(r, g, b),
          opacity,
          rotate: degrees(rotation),
        });
      }
      const out = await doc.save();
      setResultUrl(URL.createObjectURL(new Blob([out as BlobPart], { type: "application/pdf" })));
    } catch {
      alert("Failed to add watermark.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ background: "#FCE4EF", border: `1px solid ${C.line}`, boxShadow: shadow }}>
          <Droplets size={26} style={{ color: "#EC4899" }} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl" style={{ color: C.ink, fontFamily: "Archivo, Inter, sans-serif" }}>Watermark PDF</h1>
          <p className="mt-1 text-sm sm:text-base" style={{ color: C.sub }}>Add a custom text watermark to your PDF pages.</p>
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
      ) : (
        <div className="space-y-5">
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold" style={{ color: C.ink }}>Watermark Text</label>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. CONFIDENTIAL"
                className="w-full rounded-xl px-4 py-2.5 text-sm"
                style={{ border: `1px solid ${C.line}`, background: C.surface, color: C.ink, outline: "none" }} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold" style={{ color: C.ink }}>Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-16 cursor-pointer rounded-lg" style={{ border: `1px solid ${C.line}` }} />
                <span className="text-sm" style={{ color: C.sub }}>{color}</span>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold" style={{ color: C.ink }}>Font Size: {fontSize}px</label>
              <input type="range" min="20" max="100" value={fontSize} onChange={(e) => setFontSize(+e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold" style={{ color: C.ink }}>Opacity: {Math.round(opacity * 100)}%</label>
              <input type="range" min="0.05" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(+e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold" style={{ color: C.ink }}>Rotation: {rotation}°</label>
              <input type="range" min="-90" max="90" value={rotation} onChange={(e) => setRotation(+e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold" style={{ color: C.ink }}>Position</label>
              <div className="grid grid-cols-3 gap-2">
                {POSITIONS.map((pos) => (
                  <button key={pos} onClick={() => setPosition(pos)}
                    className="rounded-lg py-1.5 text-xs font-semibold capitalize transition-all"
                    style={{ border: `1px solid ${C.line}`, background: position === pos ? "#EC4899" : C.surface, color: position === pos ? "#fff" : C.ink }}>
                    {pos.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {resultUrl ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl p-8 text-center" style={{ border: `1px solid ${C.line}`, background: C.surface, boxShadow: shadow }}>
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "#E4F5EC" }}>
                <Droplets size={26} style={{ color: "#27AE60" }} />
              </span>
              <p className="text-base font-bold" style={{ color: C.ink }}>Watermark added successfully!</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <a href={resultUrl} download="watermarked.pdf"
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
                  style={{ background: "#EC4899", border: `1px solid ${C.line}`, boxShadow: shadow }}>
                  <Download size={16} />Download PDF
                </a>
                <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
                  style={{ border: `1px solid ${C.line}`, background: C.cream, color: C.ink, boxShadow: shadow }}>
                  <RefreshCcw size={15} />Watermark another
                </button>
              </div>
            </div>
          ) : (
            <button onClick={handleWatermark} disabled={loading || !text.trim()}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              style={{ background: "#EC4899", border: `1px solid ${C.line}`, boxShadow: shadow }}>
              {loading ? <><Loader2 size={16} className="animate-spin" />Adding watermark…</> : <><Droplets size={16} />Add Watermark</>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
