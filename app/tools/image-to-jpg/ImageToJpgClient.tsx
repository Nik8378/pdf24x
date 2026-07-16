"use client";
import { useState, useCallback, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import ToolPageSections from "@/components/tool/ToolPageSections";
import { ImageDropzone } from "@/components/image/ImageDropzone";
import {
  loadImage, drawToCanvas, canvasToBlob, fmtBytes, savingsPct, replaceExt, genId,
  downloadBlob, ACCEPT_ALL, type LoadedImage,
} from "@/lib/image/engine";
import {
  Download, Trash2, Loader2, CheckCircle, AlertCircle, RefreshCw, Image as ImageIcon,
} from "lucide-react";

type Status = "pending" | "converting" | "done" | "error";

interface Item {
  id: string;
  file: File;
  previewUrl: string;
  loaded?: LoadedImage;
  outBlob?: Blob;
  outUrl?: string;
  outSize?: number;
  status: Status;
  error?: string;
}

const QUALITY_PRESETS = [
  { label: "Maximum", value: 1.0, desc: "Best quality" },
  { label: "High", value: 0.92, desc: "Recommended" },
  { label: "Medium", value: 0.8, desc: "Smaller file" },
  { label: "Low", value: 0.6, desc: "Small file" },
];

export default function ImageToJpgClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [quality, setQuality] = useState(0.92);
  const [bg, setBg] = useState("#ffffff");
  const [busy, setBusy] = useState(false);

  const addFiles = useCallback((files: File[]) => {
    const additions = files.slice(0, 50).map((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
      const isHeic = ext === "heic" || ext === "heif" || f.type.includes("heic") || f.type.includes("heif");
      return {
        id: genId(),
        file: f,
        previewUrl: isHeic ? "" : URL.createObjectURL(f),
        status: "pending" as Status,
      };
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
    items.forEach((i) => {
      if (i.outUrl) URL.revokeObjectURL(i.outUrl);
      if (i.previewUrl) URL.revokeObjectURL(i.previewUrl);
    });
    setItems([]);
  };

  const convertOne = useCallback(async (item: Item, q: number, background: string): Promise<Item> => {
    try {
      const loaded = item.loaded ?? (await loadImage(item.file));
      const canvas = drawToCanvas(loaded, { background });
      const blob = await canvasToBlob(canvas, "image/jpeg", q);
      const url = URL.createObjectURL(blob);
      return { ...item, loaded, outBlob: blob, outUrl: url, outSize: blob.size, status: "done" };
    } catch (e) {
      return { ...item, status: "error", error: (e as Error).message || "Conversion failed" };
    }
  }, []);

  const convertAll = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    const pending = items.filter((i) => i.status === "pending" || i.status === "error");
    for (const it of pending) {
      setItems((prev) => prev.map((p) => (p.id === it.id ? { ...p, status: "converting" } : p)));
      const done = await convertOne(it, quality, bg);
      setItems((prev) => prev.map((p) => (p.id === it.id ? done : p)));
    }
    setBusy(false);
  }, [busy, items, quality, bg, convertOne]);

  // Re-convert done items when quality/bg changes (throttled)
  useEffect(() => {
    if (busy) return;
    const doneItems = items.filter((i) => i.status === "done");
    if (!doneItems.length) return;
    const t = setTimeout(async () => {
      for (const it of doneItems) {
        const redone = await convertOne(it, quality, bg);
        if (it.outUrl) URL.revokeObjectURL(it.outUrl);
        setItems((prev) => prev.map((p) => (p.id === it.id ? redone : p)));
      }
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality, bg]);

  const downloadOne = (item: Item) => {
    if (!item.outBlob) return;
    downloadBlob(item.outBlob, replaceExt(item.file.name, "jpg"));
  };

  const downloadAll = async () => {
    const done = items.filter((i) => i.status === "done" && i.outBlob);
    if (!done.length) return;
    if (done.length === 1) return downloadOne(done[0]);
    // multiple → sequential downloads (avoids extra zip dependency; browsers prompt once with "download multiple files")
    for (const it of done) {
      downloadBlob(it.outBlob!, replaceExt(it.file.name, "jpg"));
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
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--txt)]">Image to JPG Converter</h1>
          <p className="text-[13px] text-[var(--txt-2)]">
            Convert PNG, WebP, HEIC, AVIF, BMP, GIF and more to JPG. Adjustable quality, batch processing, EXIF orientation applied automatically. 100% private — nothing leaves your browser.
          </p>
        </div>

        {items.length === 0 && (
          <ImageDropzone onFiles={addFiles} accept={ACCEPT_ALL} hint="Up to 50 images · 25 MB each · JPG, PNG, WebP, HEIC, AVIF, BMP, GIF" />
        )}

        {items.length > 0 && (
          <>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[13px] font-semibold text-[var(--txt)]">
                  {items.length} image{items.length === 1 ? "" : "s"} · {fmtBytes(totalOrig)}
                  {doneCount > 0 && (
                    <span className="ml-2 font-normal text-[var(--txt-2)]">
                      → {fmtBytes(totalOut)} <span className="text-[#27AE60]">({savingsPct(totalOrig, totalOut)}% smaller)</span>
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <ImageDropzone_AddMore onFiles={addFiles} />
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

            <div className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:grid-cols-[1fr_1fr]">
              <div>
                <label className="mb-1.5 flex items-center justify-between text-[12px] font-semibold text-[var(--txt)]">
                  Quality
                  <span className="font-mono text-[11.5px] text-[var(--txt-2)]">{Math.round(quality * 100)}%</span>
                </label>
                <input type="range" min={0.3} max={1} step={0.02} value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-[#EE4B3C]" />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {QUALITY_PRESETS.map((p) => (
                    <button key={p.label} onClick={() => setQuality(p.value)}
                      className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${Math.abs(quality - p.value) < 0.01 ? "border-[#EE4B3C] bg-[var(--accent-soft)] text-[#EE4B3C]" : "border-[var(--line-mid)] text-[var(--txt-2)] hover:border-[#EE4B3C]/40"}`}
                      title={p.desc}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[var(--txt)]">
                  Background (for transparent PNGs)
                </label>
                <div className="flex items-center gap-2">
                  <input type="color" value={bg} onChange={(e) => setBg(e.target.value)}
                    className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-[var(--line-mid)] bg-[var(--surface-2)]" />
                  <input type="text" value={bg} onChange={(e) => setBg(e.target.value)}
                    className="flex-1 rounded-md border border-[var(--line-mid)] bg-[var(--surface-2)] px-2 py-1.5 font-mono text-[12.5px] text-[var(--txt)] outline-none focus:border-[#EE4B3C]/50" />
                </div>
                <p className="mt-1.5 text-[11.5px] text-[var(--txt-2)]">JPG has no transparency; the color fills where the original was transparent.</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={convertAll} disabled={busy || items.every((i) => i.status === "done")}
                className="flex items-center gap-1.5 rounded-lg bg-[#EE4B3C] px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90 disabled:opacity-40">
                {busy ? <><Loader2 size={14} className="animate-spin" /> Converting…</> : <>Convert to JPG</>}
              </button>
              <button onClick={downloadAll} disabled={doneCount === 0}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-4 py-2 text-[13px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40 disabled:opacity-40">
                <Download size={14} /> Download all ({doneCount})
              </button>
            </div>
          </>
        )}

        <p className="mt-6 text-xs text-[var(--txt-2)]">🔒 100% private — images are processed locally in your browser.</p>


        <ToolPageSections
          processingMode="browser"
          howToSteps={[
            { title: "Upload your images", desc: "Drag and drop, or click to browse. JPG, PNG, WebP, HEIC, AVIF, BMP, GIF are all supported. Up to 50 images at a time." },
            { title: "Adjust quality (optional)", desc: "Use the quality slider or one of the presets. 92% (High) is a great balance between file size and visual quality." },
            { title: "Set a background color", desc: "If the source has transparency, pick a color that will fill the transparent areas — JPG cannot store transparency." },
            { title: "Convert and download", desc: "Click Convert to JPG, then download files individually or all at once. Original filenames are preserved unless you set a custom one." },
          ]}
          capabilities={[
            "Supports JPG, PNG, WebP, HEIC/HEIF, AVIF, BMP, GIF inputs",
            "Batch convert up to 50 images at once",
            "Live re-encode when you move the quality slider",
            "Custom background color for transparent PNG or WebP",
            "EXIF orientation applied automatically (no sideways iPhone photos)",
            "Custom filename with automatic numbering for batch downloads",
          ]}
          useCases={[
            "Convert iPhone HEIC photos to JPG for sharing anywhere",
            "Shrink screenshots for email attachments",
            "Standardize a mix of image formats before uploading somewhere",
            "Convert PNG mockups to JPG to reduce page weight",
            "Prepare product photos for e-commerce upload",
            "Convert AVIF or WebP images to a universally supported format",
          ]}
          relatedTools={["compress","image-to-pdf","image-to-webp"]}
          faqs={[
            { q: "Are my images uploaded to a server?", a: "No. Every conversion happens entirely inside your browser using the Canvas API. Files never leave your device — even when you close the tab, nothing was ever sent anywhere." },
            { q: "Why is JPG output sometimes bigger than the original?", a: "This mostly happens when the source is already a highly-optimized JPG at low quality, or a PNG that has very few colors. JPG can't compress solid regions as well as PNG. Pick PNG output instead in those cases." },
            { q: "What quality should I choose?", a: "For photos, 85–92% is visually indistinguishable from the original in most cases and reduces size significantly. Below 60% you'll start to see block artifacts on smooth gradients." },
            { q: "How does HEIC support work?", a: "HEIC files (from iPhones) are decoded in-browser using a WebAssembly library. It's a bit slower on the first image because the library loads once, then converts run instantly." },
            { q: "Is there a batch limit?", a: "50 images per session is the soft cap to keep the browser responsive. There's no hard file-size limit per image, but very large images (>25 MB) may be slow on lower-end phones." },
          ]}
          relatedBlogs={[
            { title: "How to compress a PDF without losing quality", href: "/blog/how-to-compress-pdf-without-losing-quality" },
          ]}
        />

      </main>
    </div>
    </>
  );
}

function ImageDropzone_AddMore({ onFiles }: { onFiles: (f: File[]) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-2.5 py-1.5 text-[12px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40">
      <ImageIcon size={13} /> Add more
      <input type="file" accept={ACCEPT_ALL} multiple className="hidden"
        onChange={(e) => { if (e.target.files?.length) onFiles(Array.from(e.target.files)); e.target.value = ""; }} />
    </label>
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
          
          {item.status === "converting" && <span className="flex items-center gap-1 text-[11px] text-[var(--txt-2)]"><Loader2 size={11} className="animate-spin" /> Converting…</span>}
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
