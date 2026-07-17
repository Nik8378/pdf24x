"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ImageDropzone } from "@/components/image/ImageDropzone";
import ToolPageSections from "@/components/tool/ToolPageSections";
import {
  loadImage, drawToCanvas, canvasToBlob, fmtBytes, savingsPct, replaceExt, genId,
  downloadBlob, ACCEPT_ALL, type LoadedImage,
} from "@/lib/image/engine";
import {
  Download, Trash2, Loader2, CheckCircle, AlertCircle, RefreshCw, Image as ImageIcon,
  Target, Wand2, Package, Eye,
} from "lucide-react";

type Status = "pending" | "converting" | "done" | "error";
type OutFmt = "auto" | "jpeg" | "webp" | "png" | "avif";
type Mode = "quality" | "target" | "auto";

interface FmtResult { type: string; ext: string; blob: Blob; }
interface Item {
  id: string;
  file: File;
  previewUrl: string;
  loaded?: LoadedImage;
  outBlob?: Blob;
  outUrl?: string;
  outSize?: number;
  outType?: string;
  formatComparison?: { fmt: string; size: number }[];
  status: Status;
  error?: string;
  keptOriginal?: boolean;
}

function pickOutputType(src: string, chosen: OutFmt): { type: string; ext: string } {
  if (chosen === "jpeg") return { type: "image/jpeg", ext: "jpg" };
  if (chosen === "webp") return { type: "image/webp", ext: "webp" };
  if (chosen === "png") return { type: "image/png", ext: "png" };
  if (chosen === "avif") return { type: "image/avif", ext: "avif" };
  const s = src.toLowerCase();
  if (s.includes("png")) return { type: "image/png", ext: "png" };
  if (s.includes("webp")) return { type: "image/webp", ext: "webp" };
  return { type: "image/jpeg", ext: "jpg" };
}

async function encode(loaded: LoadedImage, type: string, q: number | undefined, maxDim: number): Promise<Blob> {
  const scale = maxDim > 0 && (loaded.width > maxDim || loaded.height > maxDim)
    ? maxDim / Math.max(loaded.width, loaded.height) : 1;
  const targetWidth = Math.round(loaded.width * scale);
  const targetHeight = Math.round(loaded.height * scale);
  const canvas = drawToCanvas(loaded, {
    targetWidth: scale < 1 ? targetWidth : undefined,
    targetHeight: scale < 1 ? targetHeight : undefined,
    background: type === "image/jpeg" ? "#ffffff" : undefined,
  });
  return canvasToBlob(canvas, type, type === "image/png" ? undefined : q);
}

async function compressToTarget(loaded: LoadedImage, type: string, targetBytes: number, maxDim: number): Promise<Blob> {
  let lo = 0.3, hi = 0.98, best: Blob | null = null;
  for (let i = 0; i < 7; i++) {
    const q = (lo + hi) / 2;
    const blob = await encode(loaded, type, q, maxDim);
    if (blob.size > targetBytes) hi = q; else { best = blob; lo = q; }
  }
  return best ?? (await encode(loaded, type, 0.3, maxDim));
}

// Auto-detect best strategy per image
function autoPreset(loaded: LoadedImage, originalType: string): { fmt: string; q: number; maxDim: number } {
  const pixels = loaded.width * loaded.height;
  const isScreenshot = /png/i.test(originalType);
  if (isScreenshot) return { fmt: "image/webp", q: 0.85, maxDim: 2400 };
  if (pixels > 4_000_000) return { fmt: "image/webp", q: 0.72, maxDim: 2400 };
  return { fmt: "image/webp", q: 0.78, maxDim: 0 };
}

export default function ImageCompressorClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<Mode>("quality");
  const [quality, setQuality] = useState(0.7);
  const [targetKB, setTargetKB] = useState(200);
  const [outFmt, setOutFmt] = useState<OutFmt>("auto");
  const [maxDim, setMaxDim] = useState(0); // 0 = no limit
  const [downloadName, setDownloadName] = useState("");
  const [previewItemId, setPreviewItemId] = useState<string | null>(null);
  const [previewX, setPreviewX] = useState(50);
  const outFmtRef = useRef(outFmt);
  outFmtRef.current = outFmt;

  const addFiles = useCallback((files: File[]) => {
    const additions = files.slice(0, 50).map((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
      const isHeic = ext === "heic" || ext === "heif" || f.type.includes("heic") || f.type.includes("heif");
      return { id: genId(), file: f, previewUrl: isHeic ? "" : URL.createObjectURL(f), status: "pending" as Status };
    });
    setItems((prev) => [...prev, ...additions]);
  }, []);

  const removeItem = (id: string) => {
    setItems((prev) => {
      const t = prev.find((i) => i.id === id);
      if (t?.outUrl) URL.revokeObjectURL(t.outUrl);
      if (t?.previewUrl) URL.revokeObjectURL(t.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
    if (previewItemId === id) setPreviewItemId(null);
  };
  const clearAll = () => {
    items.forEach((i) => { if (i.outUrl) URL.revokeObjectURL(i.outUrl); if (i.previewUrl) URL.revokeObjectURL(i.previewUrl); });
    setItems([]);
    setPreviewItemId(null);
  };

  const compressOne = useCallback(async (item: Item, m: Mode, q: number, tKB: number, fmt: OutFmt, mDim: number): Promise<Item> => {
    try {
      const loaded = item.loaded ?? (await loadImage(item.file));
      const outPick = pickOutputType(item.file.type || item.file.name, fmt);
      let blob: Blob;
      let outType = outPick.type;

      if (m === "auto") {
        const preset = autoPreset(loaded, item.file.type || item.file.name);
        outType = preset.fmt;
        blob = await encode(loaded, preset.fmt, preset.q, preset.maxDim);
      } else if (m === "target" && outPick.type !== "image/png") {
        blob = await compressToTarget(loaded, outPick.type, tKB * 1024, mDim);
      } else {
        blob = await encode(loaded, outPick.type, q, mDim);
      }

      // Format comparison: encode small sample at same quality for 3 formats
      const cmp: { fmt: string; size: number }[] = [];
      const sampleFormats = ["image/jpeg", "image/webp"];
      for (const t of sampleFormats) {
        try {
          const b = await encode(loaded, t, m === "target" ? 0.7 : q, mDim);
          cmp.push({ fmt: t.split("/")[1].toUpperCase(), size: b.size });
        } catch { /* skip */ }
      }
      cmp.push({ fmt: "ORIGINAL", size: item.file.size });

      // Keep original if compressed is bigger AND no format change requested
      let finalBlob = blob;
      let keptOriginal = false;
      if (blob.size >= item.file.size && (fmt === "auto" || outType === item.file.type)) {
        finalBlob = item.file;
        keptOriginal = true;
      }

      if (item.outUrl) URL.revokeObjectURL(item.outUrl);
      const url = URL.createObjectURL(finalBlob);
      return {
        ...item, loaded,
        outBlob: finalBlob, outUrl: url, outSize: finalBlob.size, outType,
        formatComparison: cmp,
        keptOriginal,
        status: "done",
      };
    } catch (e) {
      return { ...item, status: "error", error: (e as Error).message || "Compression failed" };
    }
  }, []);

  const compressAll = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    const pending = items.filter((i) => i.status === "pending" || i.status === "error");
    for (const it of pending) {
      setItems((prev) => prev.map((p) => (p.id === it.id ? { ...p, status: "converting" } : p)));
      const done = await compressOne(it, mode, quality, targetKB, outFmt, maxDim);
      setItems((prev) => prev.map((p) => (p.id === it.id ? done : p)));
    }
    setBusy(false);
  }, [busy, items, mode, quality, targetKB, outFmt, maxDim, compressOne]);

  // Live re-compress on setting change
  useEffect(() => {
    if (busy) return;
    const doneItems = items.filter((i) => i.status === "done");
    if (!doneItems.length) return;
    const t = setTimeout(async () => {
      for (const it of doneItems) {
        const redone = await compressOne(it, mode, quality, targetKB, outFmt, maxDim);
        setItems((prev) => prev.map((p) => (p.id === it.id ? redone : p)));
      }
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, quality, targetKB, outFmt, maxDim]);

  const extForBlob = (item: Item): string => {
    if (item.keptOriginal) {
      return item.file.name.split(".").pop() || "jpg";
    }
    if (item.outType === "image/webp") return "webp";
    if (item.outType === "image/png") return "png";
    if (item.outType === "image/avif") return "avif";
    return "jpg";
  };

  const downloadOne = (item: Item, index?: number) => {
    if (!item.outBlob) return;
    const ext = extForBlob(item);
    const custom = downloadName.trim();
    const name = custom
      ? (index !== undefined ? `${custom}-${index + 1}.${ext}` : `${custom}.${ext}`)
      : replaceExt(item.file.name, ext);
    downloadBlob(item.outBlob, name);
  };

  const downloadAllZip = async () => {
    const done = items.filter((i) => i.status === "done" && i.outBlob);
    if (!done.length) return;
    if (done.length === 1) return downloadOne(done[0]);
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (let i = 0; i < done.length; i++) {
      const it = done[i];
      const ext = extForBlob(it);
      const custom = downloadName.trim();
      const name = custom
        ? (done.length > 1 ? `${custom}-${i + 1}.${ext}` : `${custom}.${ext}`)
        : replaceExt(it.file.name, ext);
      zip.file(name, it.outBlob!);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, `${downloadName.trim() || "compressed-images"}.zip`);
  };

  const totalOrig = items.reduce((s, i) => s + i.file.size, 0);
  const totalOut = items.reduce((s, i) => s + (i.outSize ?? 0), 0);
  const doneCount = items.filter((i) => i.status === "done").length;

  const previewItem = items.find((i) => i.id === previewItemId);

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--txt)]">Image Compressor</h1>
            <p className="text-[13px] text-[var(--txt-2)]">
              Reduce image file size with adjustable quality, target-size mode, or fully automatic optimization. Resize during compression, strip metadata, compare formats side-by-side. Batch download as ZIP. 100% private.
            </p>
          </div>

          {items.length === 0 && (
            <ImageDropzone onFiles={addFiles} accept={ACCEPT_ALL} hint="Up to 50 images · 25 MB each · JPG, PNG, WebP, HEIC, AVIF" />
          )}

          {items.length > 0 && (
            <>
              {/* Settings */}
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <div className="flex rounded-lg border border-[var(--line)] p-0.5 text-[12px] font-semibold">
                    <button onClick={() => setMode("auto")} className={`flex items-center gap-1 rounded-md px-3 py-1 ${mode === "auto" ? "bg-[var(--inv-bg)] text-[var(--inv-txt)]" : "text-[var(--txt-2)] hover:text-[var(--txt)]"}`}>
                      <Wand2 size={12} /> Auto
                    </button>
                    <button onClick={() => setMode("quality")} className={`rounded-md px-3 py-1 ${mode === "quality" ? "bg-[var(--inv-bg)] text-[var(--inv-txt)]" : "text-[var(--txt-2)] hover:text-[var(--txt)]"}`}>Quality</button>
                    <button onClick={() => setMode("target")} className={`rounded-md px-3 py-1 ${mode === "target" ? "bg-[var(--inv-bg)] text-[var(--inv-txt)]" : "text-[var(--txt-2)] hover:text-[var(--txt)]"}`}>Target size</button>
                  </div>
                  {mode !== "auto" && (
                    <label className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--txt-2)]">
                      Output:
                      <select value={outFmt} onChange={(e) => setOutFmt(e.target.value as OutFmt)}
                        className="rounded-md border border-[var(--line-mid)] bg-[var(--surface-2)] px-1.5 py-0.5 text-[12px] font-semibold text-[var(--txt)] outline-none">
                        <option value="auto">Same as input</option>
                        <option value="jpeg">JPG</option>
                        <option value="webp">WebP (best)</option>
                        <option value="png">PNG (lossless)</option>
                      </select>
                    </label>
                  )}
                </div>

                {mode === "auto" && (
                  <p className="rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 text-[12px] text-[var(--txt-2)]">
                    <strong className="text-[var(--txt)]">Auto mode</strong> chooses the best format, quality, and resize automatically per image. Screenshots → WebP 85%, photos → WebP 72–78%, large images resized to 2400px max.
                  </p>
                )}

                {mode === "quality" && (
                  <div>
                    <label className="mb-1.5 flex items-center justify-between text-[12px] font-semibold text-[var(--txt)]">
                      Quality
                      <span className="font-mono text-[11.5px] text-[var(--txt-2)]">{Math.round(quality * 100)}%</span>
                    </label>
                    <input type="range" min={0.3} max={0.98} step={0.02} value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} className="w-full accent-[#EE4B3C]" />
                  </div>
                )}

                {mode === "target" && (
                  <div>
                    <label className="mb-1.5 flex items-center justify-between text-[12px] font-semibold text-[var(--txt)]">
                      <span className="flex items-center gap-1.5"><Target size={13} /> Target size per image (KB)</span>
                      <span className="font-mono text-[11.5px] text-[var(--txt-2)]">{targetKB} KB</span>
                    </label>
                    <input type="range" min={20} max={2000} step={10} value={targetKB} onChange={(e) => setTargetKB(parseInt(e.target.value))} className="w-full accent-[#EE4B3C]" />
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {[50, 100, 200, 500, 1000].map((v) => (
                        <button key={v} onClick={() => setTargetKB(v)} className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${targetKB === v ? "border-[#EE4B3C] bg-[var(--accent-soft)] text-[#EE4B3C]" : "border-[var(--line-mid)] text-[var(--txt-2)] hover:border-[#EE4B3C]/40"}`}>{v} KB</button>
                      ))}
                    </div>
                  </div>
                )}

                {mode !== "auto" && (
                  <div className="mt-3 border-t border-[var(--line)] pt-3">
                    <label className="mb-1.5 flex items-center justify-between text-[12px] font-semibold text-[var(--txt)]">
                      Resize on compress (max dimension)
                      <span className="font-mono text-[11.5px] text-[var(--txt-2)]">{maxDim === 0 ? "No limit" : maxDim + " px"}</span>
                    </label>
                    <input type="range" min={0} max={4000} step={100} value={maxDim} onChange={(e) => setMaxDim(parseInt(e.target.value))} className="w-full accent-[#EE4B3C]" />
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {[0, 800, 1200, 1920, 2400].map((v) => (
                        <button key={v} onClick={() => setMaxDim(v)} className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${maxDim === v ? "border-[#EE4B3C] bg-[var(--accent-soft)] text-[#EE4B3C]" : "border-[var(--line-mid)] text-[var(--txt-2)] hover:border-[#EE4B3C]/40"}`}>{v === 0 ? "No limit" : v + "px"}</button>
                      ))}
                    </div>
                    <p className="mt-1.5 text-[11.5px] text-[var(--txt-2)]">
                      Resizes the longest edge. Combining resize + quality gives the biggest file-size wins. EXIF is stripped automatically during re-encoding.
                    </p>
                  </div>
                )}
              </div>

              {/* Files */}
              <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold text-[var(--txt)]">
                    {items.length} image{items.length === 1 ? "" : "s"} · {fmtBytes(totalOrig)}
                    {doneCount > 0 && totalOut > 0 && (
                      <span className="ml-2 font-normal text-[var(--txt-2)]">
                        → {fmtBytes(totalOut)} <span className={savingsPct(totalOrig, totalOut) >= 0 ? "text-[#27AE60]" : "text-[#C0392B]"}>({savingsPct(totalOrig, totalOut) >= 0 ? "−" : "+"}{Math.abs(savingsPct(totalOrig, totalOut))}%)</span>
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-2.5 py-1.5 text-[12px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40">
                      <ImageIcon size={13} /> Add more
                      <input type="file" accept={ACCEPT_ALL} multiple className="hidden"
                        onChange={(e) => { if (e.target.files?.length) addFiles(Array.from(e.target.files)); e.target.value = ""; }} />
                    </label>
                    <button onClick={clearAll} className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-2.5 py-1.5 text-[12px] font-semibold text-[var(--txt-2)] hover:border-[#EE4B3C]/40 hover:text-[#EE4B3C]">
                      <Trash2 size={13} /> Clear
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((it) => (
                    <ItemCard key={it.id} item={it} onRemove={() => removeItem(it.id)} onDownload={() => downloadOne(it)} onPreview={() => setPreviewItemId(it.id)} />
                  ))}
                </div>
              </div>

              {/* Filename */}
              <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                <label className="mb-1.5 block text-[12px] font-semibold text-[var(--txt)]">
                  Download filename <span className="ml-1 font-normal text-[var(--txt-3)]">(optional)</span>
                </label>
                <input type="text" value={downloadName}
                  onChange={(e) => setDownloadName(e.target.value.replace(/[^\w\- .]/g, "").slice(0, 60))}
                  placeholder="Leave empty to keep original filenames"
                  className="w-full rounded-md border border-[var(--line-mid)] bg-[var(--surface-2)] px-2 py-1.5 text-[13px] text-[var(--txt)] outline-none focus:border-[#EE4B3C]/50" />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={compressAll} disabled={busy || items.every((i) => i.status === "done")}
                  className="flex items-center gap-1.5 rounded-lg bg-[#EE4B3C] px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90 disabled:opacity-40">
                  {busy ? <><Loader2 size={14} className="animate-spin" /> Compressing…</> : <>Compress {items.filter((i) => i.status !== "done").length || "all"}</>}
                </button>
                <button onClick={downloadAllZip} disabled={doneCount === 0}
                  className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-4 py-2 text-[13px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40 disabled:opacity-40">
                  {doneCount > 1 ? <Package size={14} /> : <Download size={14} />} {doneCount > 1 ? `Download ZIP (${doneCount})` : `Download (${doneCount})`}
                </button>
              </div>
            </>
          )}

          {/* Before/after slider modal */}
          {previewItem && previewItem.outUrl && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPreviewItemId(null)}>
              <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-[var(--surface)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2.5">
                  <p className="text-[14px] font-bold text-[var(--txt)]">Before / After · {previewItem.file.name}</p>
                  <button onClick={() => setPreviewItemId(null)} className="rounded-md p-1.5 text-[var(--txt-2)] hover:bg-[var(--hover-soft)]">✕</button>
                </div>
                <div className="p-3">
                  <div className="relative select-none overflow-hidden rounded-xl border border-[var(--line)]" style={{ userSelect: "none" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewItem.previewUrl} alt="original" className="block w-full max-h-[65vh] object-contain bg-[#f4f3f0]" />
                    <div className="absolute inset-0 overflow-hidden" style={{ width: `${previewX}%` }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewItem.outUrl} alt="compressed" style={{ width: `${100 / (previewX/100)}%`, maxWidth: "none" }} className="h-full object-contain bg-[#f4f3f0]" />
                    </div>
                    <div className="absolute inset-y-0 w-0.5 bg-[#EE4B3C] pointer-events-none" style={{ left: `${previewX}%` }}>
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-[#EE4B3C] flex items-center justify-center text-white text-[10px] font-bold">⇄</div>
                    </div>
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">COMPRESSED · {fmtBytes(previewItem.outSize ?? 0)}</div>
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">ORIGINAL · {fmtBytes(previewItem.file.size)}</div>
                  </div>
                  <input type="range" min={0} max={100} value={previewX} onChange={(e) => setPreviewX(parseInt(e.target.value))} className="mt-3 w-full accent-[#EE4B3C]" />
                  {previewItem.formatComparison && previewItem.formatComparison.length > 0 && (
                    <div className="mt-3 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-3">
                      <p className="mb-1.5 text-[11.5px] font-bold uppercase tracking-wide text-[var(--txt-2)]">Format comparison at current settings</p>
                      <div className="flex flex-wrap gap-2">
                        {previewItem.formatComparison.map((f) => {
                          const pct = savingsPct(previewItem.file.size, f.size);
                          const isWinner = f.size === Math.min(...previewItem.formatComparison!.map((x) => x.size));
                          return (
                            <div key={f.fmt} className={`rounded-md border px-2 py-1 text-[11.5px] ${isWinner ? "border-[#27AE60] bg-[#E9F9EF]" : "border-[var(--line-mid)] bg-[var(--surface)]"}`}>
                              <span className="font-mono font-bold text-[var(--txt)]">{f.fmt}</span>
                              <span className="ml-1.5 text-[var(--txt-2)]">{fmtBytes(f.size)}</span>
                              {f.fmt !== "ORIGINAL" && <span className={`ml-1.5 font-semibold ${pct > 0 ? "text-[#27AE60]" : "text-[#C0392B]"}`}>{pct > 0 ? "−" : "+"}{Math.abs(pct)}%</span>}
                              {isWinner && <span className="ml-1.5 text-[10px] font-bold text-[#27AE60]">BEST</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <p className="mt-6 text-xs text-[var(--txt-2)]">🔒 100% private — images are compressed locally in your browser.</p>

          <ToolPageSections
            processingMode="browser"
            howToSteps={[
              { title: "Upload images", desc: "Drag and drop or browse. Up to 50 images per batch." },
              { title: "Choose a mode", desc: "Auto: fully automatic per-image optimization. Quality: manual slider. Target size: set a KB limit." },
              { title: "Optionally resize", desc: "Cap the max dimension (e.g. 1920px) to save even more. Great for web upload." },
              { title: "Preview and pick a format", desc: "Click Preview on any image to see a before/after slider and JPG vs WebP size comparison." },
              { title: "Compress and download", desc: "Get individual files or all files in a single ZIP." },
            ]}
            capabilities={[
              "Three modes: Auto (per-image smart), Quality slider, Target size (binary search)",
              "Resize during compress — combining resize + quality gives biggest savings",
              "EXIF metadata stripped automatically (privacy + smaller files)",
              "Before/after slider preview with pixel-accurate comparison",
              "JPG vs WebP format comparison per image",
              "Keeps original if output would be bigger (no wasted downloads)",
              "Batch download as ZIP file",
              "Live re-compress on setting change",
            ]}
            useCases={[
              "Shrink photos for email/messaging size limits",
              "Optimize blog and article images for Core Web Vitals",
              "Batch compress e-commerce product photos to a target size",
              "Meet strict upload limits on job portals, government forms, exams",
              "Standardize a folder of images before web upload",
              "Reduce phone camera photos before backing up to cloud",
            ]}
            relatedTools={["image-to-jpg","image-to-png","image-resizer"]}
            faqs={[
              { q: "What's the Auto mode?", a: "Auto analyzes each image and picks the best format, quality, and resize target. Screenshots become WebP at 85%, large photos are resized to 2400px and encoded at 72–78%. It's the fastest way to get great results without touching settings." },
              { q: "Why did the compressor keep my original file?", a: "If re-encoding would produce a larger file than the source (common with already-optimized JPGs or small screenshots), we skip the re-encode and keep the original. Try changing the output format to WebP or lowering the quality to force a smaller size." },
              { q: "Does compression remove EXIF/GPS data?", a: "Yes. Any re-encoded image has its metadata stripped — smaller file and better privacy. The 'keep original' path preserves metadata since the file is untouched." },
              { q: "How does resize during compress work?", a: "You cap the longest edge (e.g. 1920px). If the image is smaller, nothing changes. If it's bigger, we downscale before encoding — usually saving 60–80% versus quality alone." },
              { q: "Is a ZIP download slower for big batches?", a: "ZIP creation runs in your browser; a batch of 50 medium-size images takes 3–8 seconds to package. For fewer files, individual downloads are faster." },
              { q: "Which format is best?", a: "WebP is usually 25–35% smaller than JPG at the same visual quality with wide modern browser support. Click Preview on any image to see the exact comparison for that file." },
            ]}
          />
        </main>
      </div>
    </>
  );
}

function ItemCard({ item, onRemove, onDownload, onPreview }: { item: Item; onRemove: () => void; onDownload: () => void; onPreview: () => void }) {
  const savings = item.outSize ? savingsPct(item.file.size, item.outSize) : 0;
  return (
    <div className="flex gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-2.5">
      <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)]">
        {item.outUrl || item.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.outUrl || item.previewUrl} alt="" className="h-full w-full object-contain" />
        ) : (
          <span title="HEIC preview appears after conversion"><ImageIcon size={20} className="text-[var(--txt-3)]" /></span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-[var(--txt)]">{item.file.name}</p>
        <p className="text-[11.5px] text-[var(--txt-2)]">
          {fmtBytes(item.file.size)}
          {item.outSize !== undefined && (
            <> → <span className="font-mono">{fmtBytes(item.outSize)}</span>
              {savings > 0 && <span className="ml-1 text-[#27AE60]">−{savings}%</span>}
              {savings < 0 && <span className="ml-1 text-[#C0392B]">+{Math.abs(savings)}%</span>}
              {savings === 0 && item.keptOriginal && <span className="ml-1 text-[var(--txt-3)]">(kept original)</span>}
            </>
          )}
        </p>
        <div className="mt-1 flex items-center gap-2">
          {item.status === "converting" && <span className="flex items-center gap-1 text-[11px] text-[var(--txt-2)]"><Loader2 size={11} className="animate-spin" /> Compressing…</span>}
          {item.status === "done" && <span className="flex items-center gap-1 text-[11px] text-[#27AE60]"><CheckCircle size={11} /> Ready</span>}
          {item.status === "error" && <span className="flex items-center gap-1 text-[11px] text-[#C0392B]" title={item.error}><AlertCircle size={11} /> {item.error?.slice(0, 30) ?? "Failed"}</span>}
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        {item.status === "done" && item.outUrl && (
          <button onClick={onPreview} title="Before/after preview" className="rounded-md p-1.5 text-[var(--txt-2)] hover:bg-[var(--hover-soft)] hover:text-[var(--txt)]">
            <Eye size={14} />
          </button>
        )}
        {item.status === "done" && (
          <button onClick={onDownload} title="Download" className="rounded-md p-1.5 text-[var(--txt-2)] hover:bg-[var(--hover-soft)] hover:text-[var(--txt)]">
            <Download size={14} />
          </button>
        )}
        {item.status === "error" && (
          <button onClick={onDownload} title="Retry" className="rounded-md p-1.5 text-[var(--txt-2)] hover:bg-[var(--hover-soft)] hover:text-[var(--txt)]">
            <RefreshCw size={14} />
          </button>
        )}
        <button onClick={onRemove} title="Remove" className="rounded-md p-1.5 text-[var(--txt-2)] hover:bg-[var(--hover-soft)] hover:text-[#EE4B3C]">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
