"use client";
import { useState, useCallback, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ImageDropzone } from "@/components/image/ImageDropzone";
import ToolPageSections from "@/components/tool/ToolPageSections";
import {
  loadImage, drawToCanvas, canvasToBlob, fmtBytes, replaceExt, genId,
  downloadBlob, ACCEPT_ALL, type LoadedImage,
} from "@/lib/image/engine";
import { Download, Trash2, Loader2, CheckCircle, AlertCircle, Image as ImageIcon, Lock, LockOpen } from "lucide-react";

type Status = "pending" | "converting" | "done" | "error";
type Mode = "pixels" | "percent";
type OutFmt = "auto" | "jpeg" | "png" | "webp";

interface Item {
  id: string; file: File; previewUrl: string;
  loaded?: LoadedImage;
  outBlob?: Blob; outUrl?: string; outSize?: number;
  outWidth?: number; outHeight?: number;
  status: Status; error?: string;
}

function pickOutput(src: string, fmt: OutFmt): { type: string; ext: string } {
  if (fmt === "jpeg") return { type: "image/jpeg", ext: "jpg" };
  if (fmt === "png") return { type: "image/png", ext: "png" };
  if (fmt === "webp") return { type: "image/webp", ext: "webp" };
  const s = src.toLowerCase();
  if (s.includes("png")) return { type: "image/png", ext: "png" };
  if (s.includes("webp")) return { type: "image/webp", ext: "webp" };
  return { type: "image/jpeg", ext: "jpg" };
}

export default function ImageResizerClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<Mode>("pixels");
  const [width, setWidth] = useState<number>(1200);
  const [height, setHeight] = useState<number>(800);
  const [percent, setPercent] = useState<number>(50);
  const [lock, setLock] = useState(true);
  const [outFmt, setOutFmt] = useState<OutFmt>("auto");
  const [quality, setQuality] = useState(0.92);
  const [downloadName, setDownloadName] = useState("");
  const [refAR, setRefAR] = useState<number | null>(null); // aspect ratio from first image

  const addFiles = useCallback(async (files: File[]) => {
    const additions: Item[] = files.slice(0, 50).map((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
      const isHeic = ext === "heic" || ext === "heif";
      return { id: genId(), file: f, previewUrl: isHeic ? "" : URL.createObjectURL(f), status: "pending" };
    });
    setItems((prev) => [...prev, ...additions]);
    // Read the first image dims to set default aspect ratio + width/height
    if (!refAR && additions.length) {
      try {
        const li = await loadImage(additions[0].file);
        setRefAR(li.width / li.height);
        setWidth(li.width);
        setHeight(li.height);
        setItems((prev) => prev.map((p) => p.id === additions[0].id ? { ...p, loaded: li } : p));
      } catch { /* ignore */ }
    }
  }, [refAR]);

  const removeItem = (id: string) => {
    setItems((prev) => {
      const t = prev.find((i) => i.id === id);
      if (t?.outUrl) URL.revokeObjectURL(t.outUrl);
      if (t?.previewUrl) URL.revokeObjectURL(t.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };
  const clearAll = () => {
    items.forEach((i) => { if (i.outUrl) URL.revokeObjectURL(i.outUrl); if (i.previewUrl) URL.revokeObjectURL(i.previewUrl); });
    setItems([]);
    setRefAR(null);
  };

  const updateWidth = (w: number) => {
    setWidth(w);
    if (lock && refAR) setHeight(Math.round(w / refAR));
  };
  const updateHeight = (h: number) => {
    setHeight(h);
    if (lock && refAR) setWidth(Math.round(h * refAR));
  };

  const resizeOne = useCallback(async (item: Item): Promise<Item> => {
    try {
      const loaded = item.loaded ?? (await loadImage(item.file));
      let tW: number, tH: number;
      if (mode === "percent") {
        tW = Math.max(1, Math.round(loaded.width * percent / 100));
        tH = Math.max(1, Math.round(loaded.height * percent / 100));
      } else {
        tW = Math.max(1, Math.round(width));
        tH = Math.max(1, Math.round(height));
      }
      const out = pickOutput(item.file.type || item.file.name, outFmt);
      const canvas = drawToCanvas(loaded, { targetWidth: tW, targetHeight: tH, background: out.type === "image/jpeg" ? "#ffffff" : undefined });
      const blob = await canvasToBlob(canvas, out.type, out.type === "image/png" ? undefined : quality);
      return { ...item, loaded, outBlob: blob, outUrl: URL.createObjectURL(blob), outSize: blob.size, outWidth: tW, outHeight: tH, status: "done" };
    } catch (e) {
      return { ...item, status: "error", error: (e as Error).message || "Resize failed" };
    }
  }, [mode, percent, width, height, outFmt, quality]);

  const resizeAll = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    const pending = items.filter((i) => i.status !== "done");
    for (const it of pending) {
      setItems((prev) => prev.map((p) => (p.id === it.id ? { ...p, status: "converting" } : p)));
      const done = await resizeOne(it);
      setItems((prev) => prev.map((p) => (p.id === it.id ? done : p)));
    }
    setBusy(false);
  }, [busy, items, resizeOne]);

  // Live re-resize done items on setting change
  useEffect(() => {
    if (busy) return;
    const doneItems = items.filter((i) => i.status === "done");
    if (!doneItems.length) return;
    const t = setTimeout(async () => {
      for (const it of doneItems) {
        const redone = await resizeOne(it);
        if (it.outUrl) URL.revokeObjectURL(it.outUrl);
        setItems((prev) => prev.map((p) => (p.id === it.id ? redone : p)));
      }
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, width, height, percent, outFmt, quality]);

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

  const totalOrig = items.reduce((s, i) => s + i.file.size, 0);
  const totalOut = items.reduce((s, i) => s + (i.outSize ?? 0), 0);
  const doneCount = items.filter((i) => i.status === "done").length;

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--txt)]">Image Resizer</h1>
            <p className="text-[13px] text-[var(--txt-2)]">
              Resize images by pixels or percentage. Preserve aspect ratio, batch process up to 50 images, choose output format and quality. 100% private — everything runs in your browser.
            </p>
          </div>

          {items.length === 0 && (
            <ImageDropzone onFiles={addFiles} accept={ACCEPT_ALL} hint="Up to 50 images · 25 MB each · JPG, PNG, WebP, HEIC, AVIF, BMP, GIF" />
          )}

          {items.length > 0 && (
            <>
              {/* Settings */}
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <div className="flex rounded-lg border border-[var(--line)] p-0.5 text-[12px] font-semibold">
                    <button onClick={() => setMode("pixels")} className={`rounded-md px-3 py-1 ${mode === "pixels" ? "bg-[var(--inv-bg)] text-[var(--inv-txt)]" : "text-[var(--txt-2)] hover:text-[var(--txt)]"}`}>Pixels</button>
                    <button onClick={() => setMode("percent")} className={`rounded-md px-3 py-1 ${mode === "percent" ? "bg-[var(--inv-bg)] text-[var(--inv-txt)]" : "text-[var(--txt-2)] hover:text-[var(--txt)]"}`}>Percentage</button>
                  </div>
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
                </div>

                {mode === "pixels" ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr]">
                    <div>
                      <label className="mb-1 block text-[12px] font-semibold text-[var(--txt)]">Width (px)</label>
                      <input type="number" min={1} max={10000} value={width} onChange={(e) => updateWidth(parseInt(e.target.value) || 0)}
                        className="w-full rounded-md border border-[var(--line-mid)] bg-[var(--surface-2)] px-2 py-1.5 text-[13px] text-[var(--txt)] outline-none focus:border-[#EE4B3C]/50" />
                    </div>
                    <div className="flex items-end justify-center pb-1">
                      <button onClick={() => setLock(!lock)} title={lock ? "Aspect ratio locked" : "Aspect ratio unlocked"}
                        className={`rounded-lg border p-2 ${lock ? "border-[#EE4B3C] bg-[var(--accent-soft)] text-[#EE4B3C]" : "border-[var(--line-mid)] text-[var(--txt-2)] hover:border-[#EE4B3C]/40"}`}>
                        {lock ? <Lock size={14} /> : <LockOpen size={14} />}
                      </button>
                    </div>
                    <div>
                      <label className="mb-1 block text-[12px] font-semibold text-[var(--txt)]">Height (px)</label>
                      <input type="number" min={1} max={10000} value={height} onChange={(e) => updateHeight(parseInt(e.target.value) || 0)}
                        className="w-full rounded-md border border-[var(--line-mid)] bg-[var(--surface-2)] px-2 py-1.5 text-[13px] text-[var(--txt)] outline-none focus:border-[#EE4B3C]/50" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="mb-1.5 flex items-center justify-between text-[12px] font-semibold text-[var(--txt)]">
                      Scale
                      <span className="font-mono text-[11.5px] text-[var(--txt-2)]">{percent}%</span>
                    </label>
                    <input type="range" min={5} max={200} step={1} value={percent} onChange={(e) => setPercent(parseInt(e.target.value))} className="w-full accent-[#EE4B3C]" />
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {[25, 50, 75, 100, 150].map((v) => (
                        <button key={v} onClick={() => setPercent(v)} className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${percent === v ? "border-[#EE4B3C] bg-[var(--accent-soft)] text-[#EE4B3C]" : "border-[var(--line-mid)] text-[var(--txt-2)] hover:border-[#EE4B3C]/40"}`}>{v}%</button>
                      ))}
                    </div>
                  </div>
                )}

                {outFmt !== "png" && (
                  <div className="mt-3">
                    <label className="mb-1.5 flex items-center justify-between text-[12px] font-semibold text-[var(--txt)]">
                      Quality
                      <span className="font-mono text-[11.5px] text-[var(--txt-2)]">{Math.round(quality * 100)}%</span>
                    </label>
                    <input type="range" min={0.3} max={0.98} step={0.02} value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} className="w-full accent-[#EE4B3C]" />
                  </div>
                )}
              </div>

              {/* Files */}
              <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold text-[var(--txt)]">
                    {items.length} image{items.length === 1 ? "" : "s"} · {fmtBytes(totalOrig)}
                    {doneCount > 0 && totalOut > 0 && <span className="ml-2 font-normal text-[var(--txt-2)]">→ {fmtBytes(totalOut)}</span>}
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
                    <ItemCard key={it.id} item={it} onRemove={() => removeItem(it.id)} onDownload={() => downloadOne(it)} />
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
                <button onClick={resizeAll} disabled={busy || items.every((i) => i.status === "done")}
                  className="flex items-center gap-1.5 rounded-lg bg-[#EE4B3C] px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90 disabled:opacity-40">
                  {busy ? <><Loader2 size={14} className="animate-spin" /> Resizing…</> : <>Resize</>}
                </button>
                <button onClick={downloadAll} disabled={doneCount === 0}
                  className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-4 py-2 text-[13px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40 disabled:opacity-40">
                  <Download size={14} /> Download all ({doneCount})
                </button>
              </div>
            </>
          )}

          <p className="mt-6 text-xs text-[var(--txt-2)]">🔒 100% private — images are resized locally in your browser.</p>

          <ToolPageSections
            processingMode="browser"
            howToSteps={[
              { title: "Upload your images", desc: "Drop, browse, or paste. Supports JPG, PNG, WebP, HEIC, AVIF, BMP, GIF up to 50 images." },
              { title: "Choose Pixels or Percentage", desc: "Pixels: type an exact width and height. Percentage: scale by a percentage of the original size." },
              { title: "Lock the aspect ratio (optional)", desc: "With the lock enabled, changing width auto-adjusts height (and vice versa) to keep the original proportions." },
              { title: "Pick output format and quality", desc: "Keep the same format, or convert to JPG, PNG, or WebP. Adjust quality for lossy formats." },
              { title: "Resize and download", desc: "Preview updates live. Download individually or grab all files at once with a custom filename if you like." },
            ]}
            capabilities={[
              "Resize by exact pixels or percentage",
              "Aspect-ratio lock keeps proportions intact",
              "Batch resize up to 50 images",
              "Output as JPG, PNG, WebP, or same format as input",
              "Adjustable JPG/WebP quality",
              "Live re-render as you change settings",
              "EXIF orientation applied automatically",
            ]}
            useCases={[
              "Prepare product images for e-commerce upload limits",
              "Resize a batch of photos before emailing",
              "Downscale screenshots for documentation",
              "Fit images within specific pixel requirements for job portals or exams",
              "Standardize a mix of image sizes to one dimension",
            ]}
            relatedTools={["compress","image-to-jpg","image-to-png"]}
            faqs={[
              { q: "Does resizing reduce quality?", a: "Downscaling (making smaller) discards pixels and is essentially lossless for the resulting size. Upscaling (making larger) invents pixels via interpolation and will look softer than the original." },
              { q: "What does the aspect ratio lock do?", a: "It ties width and height together based on the original image's proportions. Editing one automatically updates the other so the image doesn't stretch or squash." },
              { q: "Can I resize different-sized images together?", a: "Yes. In pixel mode, every image is stretched or squeezed to the same target dimensions. In percentage mode, each image is scaled by the same percentage of its own size — so proportions are always preserved." },
              { q: "Are my images uploaded anywhere?", a: "No. Resizing runs entirely in your browser using the Canvas API. Nothing is sent to any server." },
              { q: "What's the maximum size I can resize to?", a: "10,000 × 10,000 pixels. Beyond that, browsers may run out of memory on lower-end devices." },
            ]}
          />
        </main>
      </div>
    </>
  );
}

function ItemCard({ item, onRemove, onDownload }: { item: Item; onRemove: () => void; onDownload: () => void }) {
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
          {item.outSize !== undefined && <> → <span className="font-mono">{fmtBytes(item.outSize)}</span></>}
          {item.outWidth && item.outHeight && <span className="ml-1 text-[var(--txt-3)]">({item.outWidth}×{item.outHeight})</span>}
        </p>
        <div className="mt-1 flex items-center gap-2">
          {item.status === "converting" && <span className="flex items-center gap-1 text-[11px] text-[var(--txt-2)]"><Loader2 size={11} className="animate-spin" /> Resizing…</span>}
          {item.status === "done" && <span className="flex items-center gap-1 text-[11px] text-[#27AE60]"><CheckCircle size={11} /> Ready</span>}
          {item.status === "error" && <span className="flex items-center gap-1 text-[11px] text-[#C0392B]" title={item.error}><AlertCircle size={11} /> {item.error?.slice(0, 30) ?? "Failed"}</span>}
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        {item.status === "done" && (
          <button onClick={onDownload} title="Download" className="rounded-md p-1.5 text-[var(--txt-2)] hover:bg-[var(--hover-soft)] hover:text-[var(--txt)]">
            <Download size={14} />
          </button>
        )}
        <button onClick={onRemove} title="Remove" className="rounded-md p-1.5 text-[var(--txt-2)] hover:bg-[var(--hover-soft)] hover:text-[#EE4B3C]">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
