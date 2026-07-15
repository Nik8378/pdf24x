"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  UploadCloud, Trash2, Download, Image as ImageIcon,
  CheckCircle, AlertCircle, RefreshCw, X
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────
type Status = "pending" | "converting" | "done" | "error";
interface ImageItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  previewUrl: string;
  webpUrl?: string;
  webpSize?: number;
  status: Status;
  error?: string;
  format: string;
}

// ─── Helpers ──────────────────────────────────────────────
function genId() { return Math.random().toString(36).slice(2, 10); }
function fmtBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}
function savings(orig: number, conv: number) {
  const pct = Math.round((1 - conv / orig) * 100);
  return pct > 0 ? `-${pct}%` : `+${Math.abs(pct)}%`;
}
function detectFormat(file: File): string {
  const mime = file.type.toLowerCase();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (mime.includes("jpeg") || mime.includes("jpg") || ext === "jpg" || ext === "jpeg") return "JPG";
  if (mime.includes("png")  || ext === "png")  return "PNG";
  if (mime.includes("gif")  || ext === "gif")  return "GIF";
  if (mime.includes("bmp")  || ext === "bmp")  return "BMP";
  if (mime.includes("tiff") || ext === "tiff" || ext === "tif") return "TIFF";
  if (mime.includes("avif") || ext === "avif") return "AVIF";
  if (mime.includes("svg")  || ext === "svg")  return "SVG";
  if (mime.includes("ico")  || ext === "ico")  return "ICO";
  if (mime.includes("heic") || ext === "heic" || ext === "heif") return "HEIC";
  if (mime.includes("webp") || ext === "webp") return "WEBP";
  return mime.split("/")[1]?.toUpperCase() ?? "IMG";
}

const ACCEPTED = [
  "image/jpeg","image/jpg","image/png","image/gif","image/bmp",
  "image/tiff","image/avif","image/svg+xml","image/x-icon",
  "image/heic","image/heif","image/webp",
];
const ACCEPT_STR = ".jpg,.jpeg,.png,.gif,.bmp,.tiff,.tif,.avif,.svg,.ico,.heic,.heif,.webp,image/*";

const qualityPresets = [
  { label: "Maximum", value: 1.0,  desc: "Lossless — largest file" },
  { label: "High",    value: 0.92, desc: "Near-lossless — recommended" },
  { label: "Balanced",value: 0.80, desc: "Great quality, smaller file" },
  { label: "Small",   value: 0.60, desc: "Noticeably smaller, good quality" },
  { label: "Tiny",    value: 0.40, desc: "Smallest size, reduced quality" },
];

// ─── Convert one image to WebP using Canvas ───────────────
async function convertToWebP(file: File, quality: number): Promise<{ url: string; size: number }> {
  return new Promise((resolve, reject) => {
    const _isSvg = file.type === "image/svg+xml" || file.name.endsWith(".svg");
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width  = img.naturalWidth  || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d")!;
      // Fill white background for formats with transparency if quality < 1
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Conversion failed")); return; }
          const webpUrl = URL.createObjectURL(blob);
          resolve({ url: webpUrl, size: blob.size });
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image — format may not be supported in this browser"));
    };

    img.src = url;
  });
}

// ─── Single image row ─────────────────────────────────────
function ImageRow({
  item, quality, onRemove, onRetry,
}: {
  item: ImageItem;
  quality: number;
  onRemove: () => void;
  onRetry: () => void;
}) {
  const saved = item.webpSize !== undefined
    ? savings(item.originalSize, item.webpSize)
    : null;
  const savedPositive = saved?.startsWith("-");

  return (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl px-3 py-3 flex items-center gap-3 hover:border-[var(--line-mid)] transition-all">
      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--hover-soft)] border border-[var(--line)] shrink-0 flex items-center justify-center">
        {item.previewUrl
          ? <img src={item.previewUrl} alt={item.name} className="w-full h-full object-cover" />
          : <ImageIcon size={18} className="text-[var(--txt-2)]" />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[var(--txt)] truncate">{item.name}</p>
        <div className="flex items-center gap-2 flex-wrap mt-0.5">
          <span className="text-[10.5px] font-bold bg-[var(--hover-soft)] text-[var(--txt-2)] px-1.5 py-0.5 rounded">
            {item.format}
          </span>
          <span className="text-[11.5px] text-[var(--txt-2)]">{fmtBytes(item.originalSize)}</span>
          {item.webpSize !== undefined && (
            <>
              <span className="text-[11px] text-[var(--txt-2)]">→</span>
              <span className="text-[11.5px] text-[var(--txt)] font-medium">{fmtBytes(item.webpSize)}</span>
              <span className={`text-[10.5px] font-bold px-1.5 py-0.5 rounded ${savedPositive ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                {saved}
              </span>
            </>
          )}
        </div>
        {item.error && (
          <p className="text-[11px] text-red-500 mt-0.5">{item.error}</p>
        )}
      </div>

      {/* Status & actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {item.status === "converting" && (
          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full spin" />
        )}
        {item.status === "done" && (
          <>
            <CheckCircle size={15} className="text-green-600" />
            <a href={item.webpUrl!}
              download={item.name.replace(/\.[^.]+$/, ".webp")}
              className="p-1.5 rounded-lg text-accent hover:bg-accent-bg transition-colors"
              title="Download WebP">
              <Download size={14} />
            </a>
          </>
        )}
        {item.status === "error" && (
          <button onClick={onRetry}
            className="p-1.5 rounded-lg text-[var(--txt-2)] hover:text-accent hover:bg-accent-bg transition-colors"
            title="Retry">
            <RefreshCw size={14} />
          </button>
        )}
        {item.status === "pending" && (
          <AlertCircle size={14} className="text-[var(--inv-txt)]" />
        )}
        <button onClick={onRemove}
          className="p-1.5 rounded-lg text-[var(--txt-2)] hover:text-red-500 hover:bg-red-50 transition-colors">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────
export default function ImageToWebpClient() {
  const [items, setItems]         = useState<ImageItem[]>([]);
  const [dragging, setDragging]   = useState(false);
  const [qualityIdx, setQualityIdx] = useState(1); // High by default
  const [converting, setConverting] = useState(false);
  const [toast, setToast]         = useState<{ msg: string; type: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quality = qualityPresets[qualityIdx].value;

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      items.forEach((i) => {
        if (i.previewUrl) URL.revokeObjectURL(i.previewUrl);
        if (i.webpUrl)    URL.revokeObjectURL(i.webpUrl);
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = useCallback((files: File[]) => {
    const valid = files.filter((f) => {
      const ok = ACCEPTED.includes(f.type) || f.name.match(/\.(jpg|jpeg|png|gif|bmp|tiff?|avif|svg|ico|heic|heif|webp)$/i);
      return ok;
    });
    const rejected = files.length - valid.length;
    if (rejected > 0) showToast(`${rejected} file(s) skipped — unsupported format`, "error");
    if (!valid.length) return;

    const newItems: ImageItem[] = valid.map((f) => ({
      id: genId(),
      file: f,
      name: f.name,
      originalSize: f.size,
      previewUrl: URL.createObjectURL(f),
      status: "pending",
      format: detectFormat(f),
    }));
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, [addFiles]);

  const onPaste = useCallback((e: ClipboardEvent) => {
    const files: File[] = [];
    e.clipboardData?.items && Array.from(e.clipboardData.items).forEach((item) => {
      if (item.kind === "file") { const f = item.getAsFile(); if (f) files.push(f); }
    });
    if (files.length) addFiles(files);
  }, [addFiles]);

  useEffect(() => {
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [onPaste]);

  const convertItem = useCallback(async (id: string, q: number) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, status: "converting" } : i));
    const item = items.find((i) => i.id === id);
    if (!item) return;
    try {
      const { url, size } = await convertToWebP(item.file, q);
      // Revoke old webpUrl if exists
      if (item.webpUrl) URL.revokeObjectURL(item.webpUrl);
      setItems((prev) => prev.map((i) =>
        i.id === id ? { ...i, status: "done", webpUrl: url, webpSize: size } : i
      ));
    } catch (err: unknown) {
      setItems((prev) => prev.map((i) =>
        i.id === id ? { ...i, status: "error", error: err instanceof Error ? err.message : "Conversion failed" } : i
      ));
    }
  }, [items]);

  const handleConvertAll = async () => {
    const toConvert = items.filter((i) => i.status !== "done");
    if (!toConvert.length) { showToast("All images already converted!", "info"); return; }
    setConverting(true);
    for (const item of toConvert) {
      await convertItem(item.id, quality);
    }
    setConverting(false);
    showToast(`Converted ${toConvert.length} image${toConvert.length > 1 ? "s" : ""} to WebP!`);
  };

  const handleDownloadAll = () => {
    const done = items.filter((i) => i.status === "done" && i.webpUrl);
    if (!done.length) return;
    done.forEach((item) => {
      const a = document.createElement("a");
      a.href = item.webpUrl!;
      a.download = item.name.replace(/\.[^.]+$/, ".webp");
      a.click();
    });
    showToast(`Downloading ${done.length} WebP file${done.length > 1 ? "s" : ""}…`);
  };

  const removeItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
    if (item?.webpUrl)    URL.revokeObjectURL(item.webpUrl);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearAll = () => {
    items.forEach((i) => {
      if (i.previewUrl) URL.revokeObjectURL(i.previewUrl);
      if (i.webpUrl)    URL.revokeObjectURL(i.webpUrl);
    });
    setItems([]);
  };

  const doneCount    = items.filter((i) => i.status === "done").length;
  const pendingCount = items.filter((i) => i.status !== "done").length;
  const totalSaved   = items.reduce((acc, i) => {
    if (i.status === "done" && i.webpSize !== undefined)
      return acc + Math.max(0, i.originalSize - i.webpSize);
    return acc;
  }, 0);

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-8">

          {/* Header */}
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--txt)]">Image to WebP Converter</h1>
            <p className="text-[13px] text-[var(--txt-2)] mt-0.5">
              Convert JPG, PNG, GIF, BMP, TIFF, AVIF, SVG and any image to WebP. Free, private, instant.
            </p>
          </div>

          <div className="flex flex-col xl:flex-row gap-4 items-start">

            {/* Left — upload + list */}
            <div className="flex-1 min-w-0 w-full space-y-3">

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all shadow-sm flex flex-col items-center justify-center min-h-[200px] ${dragging ? "border-accent bg-accent-light scale-[1.01]" : "border-[var(--line-mid)] bg-[var(--surface)] hover:border-accent hover:bg-accent-light"}`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPT_STR}
                  multiple
                  className="hidden"
                  onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
                />
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all ${dragging ? "bg-accent-bg" : "bg-[var(--hover-soft)]"}`}>
                  <UploadCloud size={22} strokeWidth={1.8} className={dragging ? "text-accent" : "text-[var(--txt-2)]"} />
                </div>
                <p className="text-[14px] font-semibold text-[var(--txt)] mb-1">
                  {dragging ? "Drop images here" : "Drag & drop images here"}
                </p>
                <p className="text-[12.5px] text-[var(--txt-2)] mb-4">
                  or click to browse · paste from clipboard also works
                </p>
                {/* Format pills */}
                <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                  {["JPG","PNG","GIF","BMP","TIFF","AVIF","SVG","ICO","HEIC","WEBP"].map((f) => (
                    <span key={f} className="text-[10.5px] font-medium text-[var(--txt-2)] bg-[var(--hover-soft)] border border-[var(--line)] rounded px-2 py-0.5">
                      {f}
                    </span>
                  ))}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold text-[13.5px] px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <UploadCloud size={15} strokeWidth={2} /> Choose Images
                </button>
                <p className="mt-3 text-[11.5px] text-[var(--txt-2)]">No file size limit · Multiple images · All formats</p>
              </div>

              {/* Stats bar */}
              {items.length > 0 && (
                <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl px-4 py-3 flex items-center gap-4 flex-wrap shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-[12.5px] font-semibold text-[var(--txt)]">{items.length} image{items.length !== 1 ? "s" : ""}</span>
                  </div>
                  {doneCount > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-[12.5px] text-[var(--txt-2)]">{doneCount} converted</span>
                    </div>
                  )}
                  {totalSaved > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12.5px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                        {fmtBytes(totalSaved)} saved
                      </span>
                    </div>
                  )}
                  <div className="flex-1" />
                  <button
                    onClick={clearAll}
                    className="text-[12px] text-[var(--txt-2)] hover:text-red-500 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={12} /> Clear all
                  </button>
                </div>
              )}

              {/* Image list */}
              {items.length > 0 && (
                <div className="space-y-1.5">
                  {items.map((item) => (
                    <ImageRow
                      key={item.id}
                      item={item}
                      quality={quality}
                      onRemove={() => removeItem(item.id)}
                      onRetry={() => convertItem(item.id, quality)}
                    />
                  ))}
                </div>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                {[
                  ["All Formats", "JPG, PNG, GIF, BMP, TIFF, AVIF, SVG & more"],
                  ["Up to 80% Smaller", "WebP compresses dramatically vs JPG/PNG"],
                  ["100% Private", "Converted in your browser — never uploaded"],
                  ["Bulk Convert", "Convert dozens of images at once"],
                ].map(([t, d]) => (
                  <div key={t} className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-3 shadow-sm">
                    <p className="text-[12px] font-bold text-[var(--txt)] mb-0.5">{t}</p>
                    <p className="text-[11px] text-[var(--txt-2)]">{d}</p>
                  </div>
                ))}
              </div>

              {/* SEO content */}
              <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-sm mt-2">
                <h2 className="text-[15px] font-bold text-[var(--txt)] mb-2">Why Convert Images to WebP?</h2>
                <p className="text-[13px] text-[var(--txt-2)] leading-relaxed">
                  WebP is a modern image format developed by Google that provides superior compression for images on the web. WebP images are typically <strong className="text-[var(--txt)]">25–35% smaller than JPEG</strong> and <strong className="text-[var(--txt)]">up to 80% smaller than PNG</strong> at equivalent visual quality. This makes your website load faster, reduces bandwidth costs, and improves your Google PageSpeed score. All major browsers support WebP — Chrome, Firefox, Safari, Edge and Opera.
                </p>
              </div>
            </div>

            {/* Right — settings */}
            <div className="w-full xl:w-[280px] shrink-0 xl:sticky xl:top-14">
              <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-2.5 border-b border-[var(--line)]">
                  <ImageIcon size={14} className="text-[var(--txt-2)]" />
                  <h3 className="text-[13px] font-bold text-[var(--txt)]">Conversion Settings</h3>
                </div>

                {/* Quality */}
                <div className="mb-4">
                  <p className="text-[10.5px] font-bold text-[var(--txt)] uppercase tracking-widest opacity-50 mb-2">
                    Output Quality
                  </p>
                  <div className="space-y-1.5">
                    {qualityPresets.map((preset, idx) => (
                      <button
                        key={preset.label}
                        onClick={() => setQualityIdx(idx)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all ${qualityIdx === idx ? "border-accent bg-gradient-to-r from-accent-light to-amber-50/60 shadow-sm" : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-mid)] hover:bg-[var(--hover-soft)]"}`}
                      >
                        <div>
                          <p className="text-[13px] font-bold text-[var(--txt)]">{preset.label}</p>
                          <p className="text-[11px] text-[var(--txt-2)]">{preset.desc}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 transition-all ${qualityIdx === idx ? "border-accent bg-accent" : "border-[var(--line-mid)]"}`}>
                          {qualityIdx === idx && <div className="w-1.5 h-1.5 rounded-full bg-[var(--surface)]" />}
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-[var(--txt-2)] mt-2 text-center">
                    Quality: <strong className="text-[var(--txt)]">{Math.round(quality * 100)}%</strong>
                  </p>
                </div>

                {/* Convert button */}
                <div className="space-y-2 border-t border-[var(--line)] pt-3">
                  <button
                    onClick={handleConvertAll}
                    disabled={!items.length || converting}
                    className={`w-full flex items-center justify-center gap-2 font-semibold text-[14px] py-3 rounded-full transition-all ${!items.length || converting ? "bg-[var(--hover-soft)] text-[var(--txt-2)] cursor-not-allowed" : "bg-accent hover:bg-accent-dark text-white shadow-md hover:shadow-lg"}`}
                  >
                    {converting
                      ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full spin" /> Converting…</>
                      : <><ImageIcon size={16} /> {items.length ? `Convert ${pendingCount > 0 ? pendingCount : items.length} to WebP →` : "Convert to WebP →"}</>
                    }
                  </button>

                  {doneCount > 0 && (
                    <button
                      onClick={handleDownloadAll}
                      className="w-full flex items-center justify-center gap-2 font-semibold text-[13.5px] py-2.5 rounded-full border border-accent text-accent hover:bg-accent-bg transition-all"
                    >
                      <Download size={15} /> Download All ({doneCount})
                    </button>
                  )}

                  <p className="text-center text-[11px] text-[var(--txt-2)]">
                    Converted in your browser — never uploaded
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-20 lg:bottom-5 right-4 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[13.5px] font-medium max-w-sm z-[200] toast-enter ${toast.type === "success" ? "bg-green-700 text-white" : toast.type === "error" ? "bg-red-600 text-white" : "bg-[var(--inv-bg)] text-[var(--inv-txt)]"}`}>
          {toast.type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {toast.msg}
        </div>
      )}
    </>
  );
}
