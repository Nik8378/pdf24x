"use client";
import { useState, useCallback } from "react";
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
  id: string; file: File; previewUrl: string;
  loaded?: LoadedImage; outBlob?: Blob; outUrl?: string; outSize?: number;
  status: Status; error?: string;
}

export default function ImageToPngClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [downloadName, setDownloadName] = useState("");

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

  const convertOne = useCallback(async (item: Item): Promise<Item> => {
    try {
      const loaded = item.loaded ?? (await loadImage(item.file));
      const canvas = drawToCanvas(loaded);
      const blob = await canvasToBlob(canvas, "image/png");
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
      const done = await convertOne(it);
      setItems((prev) => prev.map((p) => (p.id === it.id ? done : p)));
    }
    setBusy(false);
  }, [busy, items, convertOne]);

  const downloadOne = (item: Item, index?: number) => {
    if (!item.outBlob) return;
    const custom = downloadName.trim();
    const name = custom
      ? (index !== undefined ? `${custom}-${index + 1}.png` : `${custom}.png`)
      : replaceExt(item.file.name, "png");
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
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--txt)]">Image to PNG Converter</h1>
          <p className="text-[13px] text-[var(--txt-2)]">
            Convert JPG, WebP, HEIC, AVIF and other images to PNG. Lossless quality with transparency preserved. Batch processing, EXIF-aware. 100% private.
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
                      → {fmtBytes(totalOut)}
                      {totalOut !== totalOrig && (
                        <span className={savingsPct(totalOrig, totalOut) > 0 ? "ml-1 text-[#27AE60]" : "ml-1 text-[#C0392B]"}>
                          ({savingsPct(totalOrig, totalOut) > 0 ? "−" : "+"}{Math.abs(savingsPct(totalOrig, totalOut))}%)
                        </span>
                      )}
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

            <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
              <label className="mb-1.5 block text-[12px] font-semibold text-[var(--txt)]">
                Download filename <span className="ml-1 font-normal text-[var(--txt-3)]">(optional)</span>
              </label>
              <input
                type="text"
                value={downloadName}
                onChange={(e) => setDownloadName(e.target.value.replace(/[^\w\- .]/g, "").slice(0, 60))}
                placeholder="Leave empty to keep original filenames"
                className="w-full rounded-md border border-[var(--line-mid)] bg-[var(--surface-2)] px-2 py-1.5 text-[13px] text-[var(--txt)] outline-none focus:border-[#EE4B3C]/50"
              />
              <p className="mt-1 text-[11.5px] text-[var(--txt-2)]">
                {downloadName ? <>Files download as <span className="font-mono">{downloadName}.png</span>{doneCount > 1 && <>, <span className="font-mono">{downloadName}-1.png</span>, <span className="font-mono">-2.png</span>…</>}</>
                  : "Original filenames retained, extension changed to .png."}
              </p>
              <p className="mt-3 rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 text-[11.5px] text-[var(--txt-2)]">
                PNG is lossless and preserves transparency. Converting a JPG to PNG usually <strong>increases</strong> file size — use only when you need transparency or lossless quality.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={convertAll} disabled={busy || items.every((i) => i.status === "done")}
                className="flex items-center gap-1.5 rounded-lg bg-[#EE4B3C] px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90 disabled:opacity-40">
                {busy ? <><Loader2 size={14} className="animate-spin" /> Converting…</> : <>Convert to PNG</>}
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
            { title: "Upload your images", desc: "Drag and drop, or click to browse. JPG, WebP, HEIC, AVIF, BMP, GIF are all supported. Up to 50 images at a time." },
            { title: "Click Convert to PNG", desc: "Files are decoded, drawn to a canvas, and re-encoded as lossless PNG. Transparency in the source is preserved automatically." },
            { title: "Set a filename (optional)", desc: "By default, files keep their original names. Enter a custom name to rename all of them with automatic numbering for batches." },
            { title: "Download individually or all at once", desc: "Click Download on any card, or Download all to save every file. Everything happens locally — nothing is uploaded." },
          ]}
          capabilities={[
            "Lossless output — no compression artifacts, ever",
            "Preserves alpha channel (transparency) from PNG and WebP sources",
            "Supports JPG, WebP, HEIC/HEIF, AVIF, BMP, GIF inputs",
            "Batch convert up to 50 images at once",
            "EXIF orientation applied automatically",
            "Custom filename with automatic numbering for batch downloads",
          ]}
          useCases={[
            "Convert JPG to PNG when you need to add transparency later in an editor",
            "Convert WebP or AVIF to PNG for tools that don't support modern formats",
            "Convert HEIC iPhone photos to a universally readable format",
            "Prepare source images for logo work or design software",
            "Standardize screenshots to a single lossless format",
          ]}
          relatedTools={["image-to-jpg","image-to-webp","compress"]}
          faqs={[
            { q: "Will PNG make my file bigger?", a: "Almost always, yes, when converting from JPG. PNG is lossless, so it can't discard visual data the way JPG does. Convert to PNG only when you need transparency or lossless quality — otherwise stick with JPG or use our Image Compressor." },
            { q: "Does transparency get preserved?", a: "Yes — the alpha channel is copied to the PNG output exactly. If the source has no transparency (like JPG), the PNG will simply have a fully opaque background." },
            { q: "Are my images uploaded anywhere?", a: "No. Everything runs in your browser using the Canvas API. Nothing leaves your device." },
            { q: "Is there a size or count limit?", a: "50 images per session as a soft cap. Individual files up to about 25 MB work smoothly; very large images may be slower on phones." },
            { q: "Why do HEIC files take longer the first time?", a: "The HEIC decoder library loads once (~200 KB) then stays cached. First convert takes 1–2 seconds extra; subsequent ones are instant." },
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
