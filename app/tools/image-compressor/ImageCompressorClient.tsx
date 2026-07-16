"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import ToolPageSections from "@/components/tool/ToolPageSections";
import { ImageDropzone } from "@/components/image/ImageDropzone";
import {
  loadImage, drawToCanvas, canvasToBlob, fmtBytes, savingsPct, replaceExt, genId,
  downloadBlob, ACCEPT_ALL, type LoadedImage,
} from "@/lib/image/engine";
import {
  Download, Trash2, Loader2, CheckCircle, AlertCircle, RefreshCw, Image as ImageIcon, Target,
} from "lucide-react";

type Status = "pending" | "converting" | "done" | "error";
type OutFmt = "auto" | "jpeg" | "webp" | "png";
type Mode = "quality" | "target";

interface Item {
  id: string; file: File; previewUrl: string;
  loaded?: LoadedImage; outBlob?: Blob; outUrl?: string; outSize?: number;
  status: Status; error?: string;
}

function pickOutputType(src: string, chosen: OutFmt): { type: string; ext: string } {
  if (chosen === "jpeg") return { type: "image/jpeg", ext: "jpg" };
  if (chosen === "webp") return { type: "image/webp", ext: "webp" };
  if (chosen === "png") return { type: "image/png", ext: "png" };
  // auto: mirror the input type; transparent formats stay png/webp
  const s = src.toLowerCase();
  if (s.includes("png")) return { type: "image/png", ext: "png" };
  if (s.includes("webp")) return { type: "image/webp", ext: "webp" };
  return { type: "image/jpeg", ext: "jpg" };
}

// Binary-search quality to hit a target file size (for JPG/WebP only)
async function compressToTarget(loaded: LoadedImage, type: string, targetBytes: number): Promise<Blob> {
  let lo = 0.3, hi = 0.98, best: Blob | null = null;
  for (let i = 0; i < 7; i++) {
    const q = (lo + hi) / 2;
    const canvas = drawToCanvas(loaded);
    const blob = await canvasToBlob(canvas, type, q);
    if (blob.size > targetBytes) hi = q; else { best = blob; lo = q; }
  }
  return best ?? (await canvasToBlob(drawToCanvas(loaded), type, 0.3));
}

export default function ImageCompressorClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<Mode>("quality");
  const [quality, setQuality] = useState(0.75);
  const [targetKB, setTargetKB] = useState(200);
  const [outFmt, setOutFmt] = useState<OutFmt>("auto");
  const [downloadName, setDownloadName] = useState("");
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
  };
  const clearAll = () => {
    items.forEach((i) => { if (i.outUrl) URL.revokeObjectURL(i.outUrl); if (i.previewUrl) URL.revokeObjectURL(i.previewUrl); });
    setItems([]);
  };

  const compressOne = useCallback(async (item: Item, m: Mode, q: number, tKB: number, fmt: OutFmt): Promise<Item> => {
    try {
      const loaded = item.loaded ?? (await loadImage(item.file));
      const outPick = pickOutputType(item.file.type || item.file.name, fmt);
      let blob: Blob;
      if (m === "target" && outPick.type !== "image/png") {
        blob = await compressToTarget(loaded, outPick.type, tKB * 1024);
      } else {
        const canvas = drawToCanvas(loaded, { background: outPick.type === "image/jpeg" ? "#ffffff" : undefined });
        blob = await canvasToBlob(canvas, outPick.type, outPick.type === "image/png" ? undefined : q);
      }
      const url = URL.createObjectURL(blob);
      return { ...item, loaded, outBlob: blob, outUrl: url, outSize: blob.size, status: "done" };
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
      const done = await compressOne(it, mode, quality, targetKB, outFmt);
      setItems((prev) => prev.map((p) => (p.id === it.id ? done : p)));
    }
    setBusy(false);
  }, [busy, items, mode, quality, targetKB, outFmt, compressOne]);

  // Live re-compress on setting change
  useEffect(() => {
    if (busy) return;
    const doneItems = items.filter((i) => i.status === "done");
    if (!doneItems.length) return;
    const t = setTimeout(async () => {
      for (const it of doneItems) {
        const redone = await compressOne(it, mode, quality, targetKB, outFmt);
        if (it.outUrl) URL.revokeObjectURL(it.outUrl);
        setItems((prev) => prev.map((p) => (p.id === it.id ? redone : p)));
      }
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, quality, targetKB, outFmt]);

  const downloadOne = (item: Item, index?: number) => {
    if (!item.outBlob) return;
    const outPick = pickOutputType(item.file.type || item.file.name, outFmtRef.current);
    const custom = downloadName.trim();
    const name = custom
      ? (index !== undefined ? `${custom}-${index + 1}.${outPick.ext}` : `${custom}.${outPick.ext}`)
      : replaceExt(item.file.name, outPick.ext);
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
    <div className="w-full flex gap-0 items-start min-w-0 overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 min-w-0 max-w-full px-3 sm:px-4 lg:px-6 py-5 pb-24 lg:pb-5 relative overflow-x-hidden">
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--txt)]">Image Compressor</h1>
          <p className="text-[13px] text-[var(--txt-2)]">
            Reduce image file size with adjustable quality — or set a target size and we&apos;ll find the best quality automatically. Works with JPG, PNG, WebP, HEIC, AVIF. Batch processing. 100% private.
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
                  <button onClick={() => setMode("quality")} className={`rounded-md px-3 py-1 ${mode === "quality" ? "bg-[var(--inv-bg)] text-[var(--inv-txt)]" : "text-[var(--txt-2)] hover:text-[var(--txt)]"}`}>Quality</button>
                  <button onClick={() => setMode("target")} className={`rounded-md px-3 py-1 ${mode === "target" ? "bg-[var(--inv-bg)] text-[var(--inv-txt)]" : "text-[var(--txt-2)] hover:text-[var(--txt)]"}`}>Target size</button>
                </div>
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
              </div>

              {mode === "quality" ? (
                <div>
                  <label className="mb-1.5 flex items-center justify-between text-[12px] font-semibold text-[var(--txt)]">
                    Quality
                    <span className="font-mono text-[11.5px] text-[var(--txt-2)]">{Math.round(quality * 100)}%</span>
                  </label>
                  <input type="range" min={0.3} max={0.98} step={0.02} value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} className="w-full accent-[#EE4B3C]" />
                  <p className="mt-1.5 text-[11.5px] text-[var(--txt-2)]">
                    Lower quality = smaller file. 75% is a good default; 90%+ is near-lossless. PNG output ignores this (lossless format).
                  </p>
                </div>
              ) : (
                <div>
                  <label className="mb-1.5 flex items-center justify-between text-[12px] font-semibold text-[var(--txt)]">
                    <span className="flex items-center gap-1.5"><Target size={13} /> Target size per image (KB)</span>
                    <span className="font-mono text-[11.5px] text-[var(--txt-2)]">{targetKB} KB</span>
                  </label>
                  <input type="range" min={20} max={2000} step={10} value={targetKB} onChange={(e) => setTargetKB(parseInt(e.target.value))} className="w-full accent-[#EE4B3C]" />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[100, 200, 500, 1000].map((v) => (
                      <button key={v} onClick={() => setTargetKB(v)} className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${targetKB === v ? "border-[#EE4B3C] bg-[var(--accent-soft)] text-[#EE4B3C]" : "border-[var(--line-mid)] text-[var(--txt-2)] hover:border-[#EE4B3C]/40"}`}>{v} KB</button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[11.5px] text-[var(--txt-2)]">
                    Best quality that fits under the target. Not available for PNG (use Quality mode for PNG).
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
                      → {fmtBytes(totalOut)} <span className="text-[#27AE60]">(−{savingsPct(totalOrig, totalOut)}%)</span>
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
                  <ItemCard key={it.id} item={it} onRemove={() => removeItem(it.id)} onDownload={() => downloadOne(it)} />
                ))}
              </div>
            </div>

            {/* Filename + actions */}
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
              <button onClick={downloadAll} disabled={doneCount === 0}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-4 py-2 text-[13px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40 disabled:opacity-40">
                <Download size={14} /> Download all ({doneCount})
              </button>
            </div>
          </>
        )}

        <p className="mt-6 text-xs text-[var(--txt-2)]">🔒 100% private — images are compressed locally in your browser.</p>


        <ToolPageSections
          processingMode="browser"
          howToSteps={[
            { title: "Upload your images", desc: "Drag and drop, or click to browse. Supports JPG, PNG, WebP, HEIC, AVIF, BMP, GIF. Up to 50 images at a time." },
            { title: "Pick Quality or Target size mode", desc: "Quality mode: drag the slider. Target size mode: set a KB limit and the tool finds the best quality that fits under it automatically." },
            { title: "Choose an output format", desc: "Same as input keeps the original format. Choose WebP for the smallest files at a given quality, JPG for compatibility, or PNG for lossless output." },
            { title: "Compress and download", desc: "Files re-encode instantly when you move the slider. Download individually or grab everything at once." },
          ]}
          capabilities={[
            "Two modes: adjustable quality or automatic target-size fitting",
            "Output as JPG, PNG, WebP, or same format as input",
            "Live re-encode as you change settings — see size updates instantly",
            "Batch compress up to 50 images at once",
            "Preserves EXIF orientation, avoids sideways photos",
            "Target-size mode uses binary search across 7 quality levels for best results",
          ]}
          useCases={[
            "Shrink photos for email attachments that hit a size limit",
            "Compress product images for faster e-commerce page loads",
            "Optimize blog and article images to improve Core Web Vitals",
            "Reduce screenshot sizes for chat or documentation",
            "Batch process a folder of photos for web upload",
            "Meet strict upload limits on job portals, government forms, or exams",
          ]}
          relatedTools={["image-to-jpg","image-to-png","compress"]}
          faqs={[
            { q: "What's the difference between Quality mode and Target size mode?", a: "Quality mode: you pick the visual quality (e.g., 75%) and get whatever file size that produces. Target size mode: you pick the maximum file size (e.g., 200 KB) and we find the highest quality that fits under it — useful when you have a hard upload limit." },
            { q: "Which output format compresses best?", a: "WebP typically produces 25–35% smaller files than JPG at the same visual quality. JPG has broader compatibility. PNG is lossless (larger) but preserves transparency." },
            { q: "Does compression reduce image quality?", a: "Only if you tell it to. Above 90% quality the loss is essentially invisible. Below 60% you'll start seeing block artifacts on smooth gradients or edges. 75% is a widely-used default." },
            { q: "Are my images uploaded anywhere?", a: "No. Everything runs in your browser — decoding, re-encoding, and download. Files never leave your device." },
            { q: "Why is target-size mode unavailable for PNG?", a: "PNG is a lossless format, so there's no 'quality dial' to adjust. If you need a small PNG, try converting to JPG or WebP instead — PNG is inherently larger for photos." },
            { q: "How large a batch can I compress?", a: "50 images per session. Each image can be up to about 25 MB; very large images may be slow on lower-end phones." },
          ]}
        />

      </main>
    </div>
  );
}

function ItemCard({ item, onRemove, onDownload }: { item: Item; onRemove: () => void; onDownload: () => void }) {
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
