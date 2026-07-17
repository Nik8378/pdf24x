"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ImageDropzone } from "@/components/image/ImageDropzone";
import ToolPageSections from "@/components/tool/ToolPageSections";
import {
  loadImage, drawToCanvas, canvasToBlob, fmtBytes, replaceExt, genId,
  downloadBlob, ACCEPT_ALL, type LoadedImage,
} from "@/lib/image/engine";
import { Download, Trash2, Loader2, CheckCircle, AlertCircle, Image as ImageIcon, RotateCcw } from "lucide-react";

type Status = "pending" | "converting" | "done" | "error";
type OutFmt = "auto" | "jpeg" | "png" | "webp";

interface Item {
  id: string; file: File; previewUrl: string;
  loaded?: LoadedImage;
  outBlob?: Blob; outUrl?: string; outSize?: number;
  outWidth?: number; outHeight?: number;
  status: Status; error?: string;
}

interface Crop { x: number; y: number; w: number; h: number; } // in image pixels

const ASPECTS = [
  { label: "Free", value: 0 },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4/3 },
  { label: "3:2", value: 3/2 },
  { label: "16:9", value: 16/9 },
  { label: "9:16", value: 9/16 },
  { label: "4:5", value: 4/5 },
  { label: "3:4", value: 3/4 },
];

function pickOutput(src: string, fmt: OutFmt): { type: string; ext: string } {
  if (fmt === "jpeg") return { type: "image/jpeg", ext: "jpg" };
  if (fmt === "png") return { type: "image/png", ext: "png" };
  if (fmt === "webp") return { type: "image/webp", ext: "webp" };
  const s = src.toLowerCase();
  if (s.includes("png")) return { type: "image/png", ext: "png" };
  if (s.includes("webp")) return { type: "image/webp", ext: "webp" };
  return { type: "image/jpeg", ext: "jpg" };
}

// Adjust crop to match aspect if aspect > 0; keep center where possible
function fitAspect(c: Crop, aspect: number, imgW: number, imgH: number): Crop {
  if (aspect <= 0) return c;
  const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
  let w = c.w, h = w / aspect;
  if (h > c.h) { h = c.h; w = h * aspect; }
  let x = cx - w / 2, y = cy - h / 2;
  x = Math.max(0, Math.min(imgW - w, x));
  y = Math.max(0, Math.min(imgH - h, y));
  return { x, y, w, h };
}

export default function ImageCropperClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [aspect, setAspect] = useState(0);
  const [outFmt, setOutFmt] = useState<OutFmt>("auto");
  const [quality, setQuality] = useState(0.92);
  const [downloadName, setDownloadName] = useState("");
  const [crop, setCrop] = useState<Crop | null>(null);
  const [applyAll, setApplyAll] = useState(false); // apply same crop rectangle to all in batch (percentage-based)

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragMode = useRef<null | "move" | "nw" | "ne" | "sw" | "se">(null);
  const dragStart = useRef<{ x: number; y: number; c: Crop }>({ x: 0, y: 0, c: { x: 0, y: 0, w: 0, h: 0 } });

  const selected = items.find((i) => i.id === selectedId) || null;

  const addFiles = useCallback(async (files: File[]) => {
    const additions: Item[] = files.slice(0, 30).map((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
      const isHeic = ext === "heic" || ext === "heif";
      return { id: genId(), file: f, previewUrl: isHeic ? "" : URL.createObjectURL(f), status: "pending" };
    });
    setItems((prev) => [...prev, ...additions]);
    if (!selectedId && additions.length) setSelectedId(additions[0].id);
    // Preload first for crop
    if (additions.length) {
      try {
        const li = await loadImage(additions[0].file);
        setItems((prev) => prev.map((p) => p.id === additions[0].id ? { ...p, loaded: li } : p));
      } catch { /* ignore */ }
    }
  }, [selectedId]);

  // When selection changes, load image + init crop to full frame
  useEffect(() => {
    if (!selected) { setCrop(null); return; }
    (async () => {
      let li = selected.loaded;
      if (!li) {
        try { li = await loadImage(selected.file); setItems((prev) => prev.map((p) => p.id === selected.id ? { ...p, loaded: li } : p)); }
        catch { return; }
      }
      // Init crop covering ~80% of image
      const w = li!.width * 0.8, h = aspect > 0 ? w / aspect : li!.height * 0.8;
      const x = (li!.width - w) / 2, y = (li!.height - h) / 2;
      setCrop(fitAspect({ x, y, w, h }, aspect, li!.width, li!.height));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // If aspect changes, refit current crop
  useEffect(() => {
    if (!crop || !selected?.loaded) return;
    setCrop((c) => c ? fitAspect(c, aspect, selected.loaded!.width, selected.loaded!.height) : c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspect]);

  const removeItem = (id: string) => {
    setItems((prev) => {
      const t = prev.find((i) => i.id === id);
      if (t?.outUrl) URL.revokeObjectURL(t.outUrl);
      if (t?.previewUrl) URL.revokeObjectURL(t.previewUrl);
      const next = prev.filter((i) => i.id !== id);
      if (id === selectedId) setSelectedId(next[0]?.id ?? null);
      return next;
    });
  };
  const clearAll = () => {
    items.forEach((i) => { if (i.outUrl) URL.revokeObjectURL(i.outUrl); if (i.previewUrl) URL.revokeObjectURL(i.previewUrl); });
    setItems([]);
    setSelectedId(null);
    setCrop(null);
  };

  // Mouse/touch handlers for cropping
  const startDrag = (mode: NonNullable<typeof dragMode.current>) => (e: React.MouseEvent | React.TouchEvent) => {
    if (!crop) return;
    e.stopPropagation();
    e.preventDefault();
    const point = "touches" in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
    dragMode.current = mode;
    dragStart.current = { x: point.x, y: point.y, c: { ...crop } };
  };
  useEffect(() => {
    const move = (e: MouseEvent | TouchEvent) => {
      if (!dragMode.current || !crop || !selected?.loaded || !imgRef.current) return;
      const rect = imgRef.current.getBoundingClientRect();
      const scaleX = selected.loaded.width / rect.width;
      const scaleY = selected.loaded.height / rect.height;
      const point = "touches" in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
      const dx = (point.x - dragStart.current.x) * scaleX;
      const dy = (point.y - dragStart.current.y) * scaleY;
      const start = dragStart.current.c;
      const imgW = selected.loaded.width, imgH = selected.loaded.height;
      let nc: Crop = { ...start };
      if (dragMode.current === "move") {
        nc.x = Math.max(0, Math.min(imgW - start.w, start.x + dx));
        nc.y = Math.max(0, Math.min(imgH - start.h, start.y + dy));
      } else {
        // Resize corners
        let x1 = start.x, y1 = start.y, x2 = start.x + start.w, y2 = start.y + start.h;
        if (dragMode.current.includes("w")) x1 = Math.max(0, Math.min(x2 - 20, start.x + dx));
        if (dragMode.current.includes("e")) x2 = Math.min(imgW, Math.max(x1 + 20, start.x + start.w + dx));
        if (dragMode.current.includes("n")) y1 = Math.max(0, Math.min(y2 - 20, start.y + dy));
        if (dragMode.current.includes("s")) y2 = Math.min(imgH, Math.max(y1 + 20, start.y + start.h + dy));
        nc = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
        if (aspect > 0) nc = fitAspect(nc, aspect, imgW, imgH);
      }
      setCrop(nc);
    };
    const up = () => { dragMode.current = null; };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [crop, selected, aspect]);

  const cropOne = useCallback(async (item: Item, c: Crop): Promise<Item> => {
    try {
      const loaded = item.loaded ?? (await loadImage(item.file));
      // Clamp crop to image
      const cc = {
        x: Math.max(0, Math.min(loaded.width - 1, Math.round(c.x))),
        y: Math.max(0, Math.min(loaded.height - 1, Math.round(c.y))),
        w: Math.max(1, Math.round(c.w)),
        h: Math.max(1, Math.round(c.h)),
      };
      cc.w = Math.min(cc.w, loaded.width - cc.x);
      cc.h = Math.min(cc.h, loaded.height - cc.y);
      const out = pickOutput(item.file.type || item.file.name, outFmt);
      const canvas = drawToCanvas(loaded, { crop: cc, background: out.type === "image/jpeg" ? "#ffffff" : undefined });
      const blob = await canvasToBlob(canvas, out.type, out.type === "image/png" ? undefined : quality);
      return { ...item, loaded, outBlob: blob, outUrl: URL.createObjectURL(blob), outSize: blob.size, outWidth: cc.w, outHeight: cc.h, status: "done" };
    } catch (e) {
      return { ...item, status: "error", error: (e as Error).message || "Crop failed" };
    }
  }, [outFmt, quality]);

  const cropAll = useCallback(async () => {
    if (busy || !crop || !selected?.loaded) return;
    setBusy(true);
    if (!applyAll || items.length === 1) {
      // Only the selected image
      const it = items.find((i) => i.id === selectedId);
      if (it) {
        setItems((prev) => prev.map((p) => p.id === it.id ? { ...p, status: "converting" } : p));
        const done = await cropOne(it, crop);
        setItems((prev) => prev.map((p) => p.id === it.id ? done : p));
      }
    } else {
      // Apply same relative crop (percentages) to every image
      const rW = selected.loaded.width, rH = selected.loaded.height;
      const rel = { x: crop.x / rW, y: crop.y / rH, w: crop.w / rW, h: crop.h / rH };
      for (const it of items) {
        setItems((prev) => prev.map((p) => p.id === it.id ? { ...p, status: "converting" } : p));
        const li = it.loaded ?? (await (async () => {
          try { return await loadImage(it.file); } catch { return null; }
        })());
        if (!li) { setItems((prev) => prev.map((p) => p.id === it.id ? { ...p, status: "error", error: "Load failed" } : p)); continue; }
        const c: Crop = { x: rel.x * li.width, y: rel.y * li.height, w: rel.w * li.width, h: rel.h * li.height };
        const done = await cropOne({ ...it, loaded: li }, c);
        setItems((prev) => prev.map((p) => p.id === it.id ? done : p));
      }
    }
    setBusy(false);
  }, [busy, crop, items, selectedId, applyAll, selected, cropOne]);

  const downloadOne = (item: Item, index?: number) => {
    if (!item.outBlob) return;
    const out = pickOutput(item.file.type || item.file.name, outFmt);
    const custom = downloadName.trim();
    const name = custom
      ? (index !== undefined ? `${custom}-${index + 1}.${out.ext}` : `${custom}.${out.ext}`)
      : replaceExt(item.file.name, out.ext);
    downloadBlob(item.outBlob, name);
  };
  const downloadAll = async () => {
    const done = items.filter((i) => i.status === "done" && i.outBlob);
    for (let i = 0; i < done.length; i++) {
      downloadOne(done[i], done.length > 1 ? i : undefined);
      await new Promise((r) => setTimeout(r, 250));
    }
  };

  const resetCrop = () => {
    if (!selected?.loaded) return;
    const li = selected.loaded;
    const w = li.width * 0.8, h = aspect > 0 ? w / aspect : li.height * 0.8;
    setCrop(fitAspect({ x: (li.width - w) / 2, y: (li.height - h) / 2, w, h }, aspect, li.width, li.height));
  };

  const doneCount = items.filter((i) => i.status === "done").length;

  // Compute crop rectangle CSS position based on displayed image dimensions
  const cropStyle: React.CSSProperties = (() => {
    if (!crop || !selected?.loaded || !imgRef.current) return { display: "none" };
    const rect = imgRef.current.getBoundingClientRect();
    const container = containerRef.current?.getBoundingClientRect();
    if (!container) return { display: "none" };
    const scale = rect.width / selected.loaded.width;
    return {
      left: (rect.left - container.left) + crop.x * scale,
      top: (rect.top - container.top) + crop.y * scale,
      width: crop.w * scale,
      height: crop.h * scale,
    };
  })();

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--txt)]">Image Cropper</h1>
            <p className="text-[13px] text-[var(--txt-2)]">
              Crop images with aspect-ratio presets or freely. Drag corners to resize the crop, drag inside to move it. Batch supported — apply the same crop to every image. 100% private.
            </p>
          </div>

          {items.length === 0 && (
            <ImageDropzone onFiles={addFiles} accept={ACCEPT_ALL} hint="Up to 30 images · 25 MB each · JPG, PNG, WebP, HEIC, AVIF" />
          )}

          {items.length > 0 && (
            <>
              {/* Aspect + settings */}
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                <label className="mb-1.5 block text-[12px] font-semibold text-[var(--txt)]">Aspect ratio</label>
                <div className="flex flex-wrap gap-1.5">
                  {ASPECTS.map((a) => (
                    <button key={a.label} onClick={() => setAspect(a.value)}
                      className={`rounded-md border px-2 py-0.5 text-[11.5px] font-semibold ${aspect === a.value ? "border-[#EE4B3C] bg-[var(--accent-soft)] text-[#EE4B3C]" : "border-[var(--line-mid)] text-[var(--txt-2)] hover:border-[#EE4B3C]/40"}`}>
                      {a.label}
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--txt-2)]">
                    Output:
                    <select value={outFmt} onChange={(e) => setOutFmt(e.target.value as OutFmt)}
                      className="rounded-md border border-[var(--line-mid)] bg-[var(--surface-2)] px-1.5 py-0.5 text-[12px] font-semibold text-[var(--txt)] outline-none">
                      <option value="auto">Same as input</option>
                      <option value="jpeg">JPG</option>
                      <option value="png">PNG</option>
                      <option value="webp">WebP</option>
                    </select>
                  </label>
                  {outFmt !== "png" && (
                    <label className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--txt-2)]">
                      Quality:
                      <input type="range" min={0.3} max={0.98} step={0.02} value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} className="w-32 accent-[#EE4B3C]" />
                      <span className="font-mono text-[11.5px]">{Math.round(quality * 100)}%</span>
                    </label>
                  )}
                  {items.length > 1 && (
                    <label className="flex cursor-pointer items-center gap-1.5 text-[12px] font-medium text-[var(--txt-2)]" title="Apply the same crop rectangle (as % of image) to all images">
                      <input type="checkbox" checked={applyAll} onChange={(e) => setApplyAll(e.target.checked)} className="accent-[#EE4B3C]" />
                      Apply to all
                    </label>
                  )}
                  <button onClick={resetCrop} className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-2.5 py-1 text-[12px] font-semibold text-[var(--txt-2)] hover:border-[#EE4B3C]/40 hover:text-[#EE4B3C]">
                    <RotateCcw size={12} /> Reset crop
                  </button>
                </div>
              </div>

              {/* Crop canvas */}
              {selected?.loaded && (
                <div ref={containerRef} className="mt-4 relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-2 select-none">
                  <div className="relative mx-auto" style={{ maxWidth: "100%" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={imgRef}
                      src={selected.previewUrl || selected.outUrl}
                      alt=""
                      draggable={false}
                      className="block max-h-[500px] w-auto max-w-full mx-auto pointer-events-none"
                    />
                    {crop && (
                      <div
                        className="absolute border-2 border-[#EE4B3C] shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]"
                        style={cropStyle}
                        onMouseDown={startDrag("move")}
                        onTouchStart={startDrag("move")}
                      >
                        {(["nw","ne","sw","se"] as const).map((c) => (
                          <div key={c}
                            onMouseDown={startDrag(c)}
                            onTouchStart={startDrag(c)}
                            className={`absolute h-3 w-3 bg-[#EE4B3C] border border-white ${
                              c === "nw" ? "-top-1.5 -left-1.5 cursor-nwse-resize" :
                              c === "ne" ? "-top-1.5 -right-1.5 cursor-nesw-resize" :
                              c === "sw" ? "-bottom-1.5 -left-1.5 cursor-nesw-resize" :
                              "-bottom-1.5 -right-1.5 cursor-nwse-resize"
                            }`}
                          />
                        ))}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="rounded bg-black/60 px-2 py-0.5 text-[10.5px] font-mono text-white">
                            {Math.round(crop.w)}×{Math.round(crop.h)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Files list */}
              <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold text-[var(--txt)]">
                    {items.length} image{items.length === 1 ? "" : "s"}
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
                    <div key={it.id}
                      onClick={() => setSelectedId(it.id)}
                      className={`flex cursor-pointer gap-3 rounded-xl border p-2.5 transition-all ${it.id === selectedId ? "border-[#EE4B3C] bg-[var(--accent-soft)]" : "border-[var(--line)] bg-[var(--surface-2)] hover:border-[#EE4B3C]/40"}`}>
                      <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)]">
                        {it.outUrl || it.previewUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={it.outUrl || it.previewUrl} alt="" className="h-full w-full object-contain" />
                        ) : (
                          <ImageIcon size={20} className="text-[var(--txt-3)]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-[var(--txt)]">{it.file.name}</p>
                        <p className="text-[11.5px] text-[var(--txt-2)]">
                          {fmtBytes(it.file.size)}
                          {it.outSize !== undefined && <> → <span className="font-mono">{fmtBytes(it.outSize)}</span></>}
                          {it.outWidth && it.outHeight && <span className="ml-1 text-[var(--txt-3)]">({it.outWidth}×{it.outHeight})</span>}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          {it.status === "converting" && <span className="flex items-center gap-1 text-[11px] text-[var(--txt-2)]"><Loader2 size={11} className="animate-spin" /> Cropping…</span>}
                          {it.status === "done" && <span className="flex items-center gap-1 text-[11px] text-[#27AE60]"><CheckCircle size={11} /> Ready</span>}
                          {it.status === "error" && <span className="flex items-center gap-1 text-[11px] text-[#C0392B]"><AlertCircle size={11} /> Failed</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        {it.status === "done" && (
                          <button onClick={(e) => { e.stopPropagation(); downloadOne(it); }} title="Download" className="rounded-md p-1.5 text-[var(--txt-2)] hover:bg-[var(--hover-soft)] hover:text-[var(--txt)]">
                            <Download size={14} />
                          </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); removeItem(it.id); }} title="Remove" className="rounded-md p-1.5 text-[var(--txt-2)] hover:bg-[var(--hover-soft)] hover:text-[#EE4B3C]">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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
                <button onClick={cropAll} disabled={busy || !crop}
                  className="flex items-center gap-1.5 rounded-lg bg-[#EE4B3C] px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90 disabled:opacity-40">
                  {busy ? <><Loader2 size={14} className="animate-spin" /> Cropping…</> : (applyAll && items.length > 1 ? <>Crop all ({items.length})</> : <>Crop selected</>)}
                </button>
                <button onClick={downloadAll} disabled={doneCount === 0}
                  className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-4 py-2 text-[13px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40 disabled:opacity-40">
                  <Download size={14} /> Download all ({doneCount})
                </button>
              </div>
            </>
          )}

          <p className="mt-6 text-xs text-[var(--txt-2)]">🔒 100% private — images are cropped locally in your browser.</p>

          <ToolPageSections
            processingMode="browser"
            howToSteps={[
              { title: "Upload your images", desc: "Drop, browse, or paste. Supports JPG, PNG, WebP, HEIC, AVIF up to 30 images." },
              { title: "Pick an aspect ratio", desc: "Free crop or a preset like 1:1 for Instagram, 16:9 for YouTube, 4:5 for Instagram portrait." },
              { title: "Adjust the crop rectangle", desc: "Drag the rectangle to move it, drag any corner to resize. Presets keep the aspect locked; Free lets you set any shape." },
              { title: "Crop and download", desc: "Crop just the selected image, or toggle Apply to all to crop every image the same way (as % of each image)." },
            ]}
            capabilities={[
              "Interactive drag-to-crop UI on desktop and mobile",
              "Aspect presets: 1:1, 4:3, 3:2, 16:9, 9:16, 4:5, 3:4 + Free",
              "Batch mode: apply the same relative crop to many images",
              "Output as JPG, PNG, WebP, or same format as input",
              "Adjustable JPG/WebP quality",
              "EXIF orientation applied before cropping",
            ]}
            useCases={[
              "Crop photos to 1:1 for Instagram or profile pictures",
              "Trim screenshots to remove unnecessary edges",
              "Prepare product photos to a consistent aspect for e-commerce",
              "Crop landscape photos to portrait for stories/reels",
              "Standardize a batch of images to the same aspect ratio",
            ]}
            relatedTools={["image-resizer","image-compressor","image-to-jpg"]}
            faqs={[
              { q: "Does 'Apply to all' crop every image the same pixel rectangle?", a: "No — it uses the same percentage of each image. So if you set a rectangle covering the center 50% of the first image, every image gets its own center-50% crop. This works well for images of different sizes." },
              { q: "Can I crop on my phone?", a: "Yes. The crop rectangle supports touch drag on mobile. Both moving and resizing work with a single finger." },
              { q: "Are my images uploaded anywhere?", a: "No. Everything runs in your browser." },
              { q: "Why does the aspect preset move my crop?", a: "When you pick a fixed aspect (like 1:1), the tool adjusts the current rectangle to match that ratio, centered as best it can. You can then reposition or resize it." },
              { q: "What's the maximum batch size?", a: "30 images per session for cropping (lower than other tools because each image is fully loaded for the interactive preview)." },
            ]}
          />
        </main>
      </div>
    </>
  );
}
