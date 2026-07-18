"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import ToolPageSections from "@/components/tool/ToolPageSections";
import { validate } from "@/lib/isbn/engine";
import { Upload, Camera, CameraOff, Copy, Check, AlertCircle, CheckCircle, Trash2 } from "lucide-react";

interface Scan { id: string; raw: string; format: string; timestamp: number; }

export default function ISBNBarcodeReaderClient() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<{ stop?: () => void; reset?: () => void } | null>(null);

  const addScan = useCallback((raw: string) => {
    const v = validate(raw);
    if (!v.valid) return;
    setScans((prev) => {
      const key = v.isbn13 || raw;
      if (prev.some((s) => s.raw === key)) return prev;
      return [{ id: Math.random().toString(36).slice(2, 10), raw: key, format: v.format || raw, timestamp: Date.now() }, ...prev].slice(0, 50);
    });
  }, []);

  const scanImage = useCallback(async (file: File) => {
    setError(null);
    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      const url = URL.createObjectURL(file);
      try {
        const result = await reader.decodeFromImageUrl(url);
        addScan(result.getText());
      } catch {
        setError("No barcode found in the image. Try a clearer or closer photo.");
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      setError((e as Error).message || "Failed to decode");
    }
  }, [addScan]);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
        if (result) addScan(result.getText());
      });
      readerRef.current = controls;
      setCameraOn(true);
    } catch (e) {
      setError("Could not access camera. Grant permission and try again, or upload an image instead.");
      console.error(e);
    }
  }, [addScan]);

  const stopCamera = useCallback(() => {
    readerRef.current?.stop?.() ?? readerRef.current?.reset?.();
    readerRef.current = null;
    setCameraOn(false);
  }, []);

  useEffect(() => () => { readerRef.current?.stop?.() ?? readerRef.current?.reset?.(); }, []);

  const copy = (t: string, id: string) => { navigator.clipboard.writeText(t); setCopied(id); setTimeout(() => setCopied(null), 1500); };
  const copyAll = () => { navigator.clipboard.writeText(scans.map((s) => s.format).join("\n")); setCopied("all"); setTimeout(() => setCopied(null), 1500); };
  const clearAll = () => setScans([]);

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--txt)]">ISBN Barcode Reader</h1>
            <p className="text-[13px] text-[var(--txt-2)]">
              Scan ISBN barcodes from your camera or from photos. Detects EAN-13 / ISBN. Deduplicates results. 100% private — camera stream and images never leave your device.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[12px] font-semibold text-[var(--txt)]">Live camera</p>
                {!cameraOn ? (
                  <button onClick={startCamera} className="flex items-center gap-1.5 rounded-lg bg-[#EE4B3C] px-3 py-1.5 text-[12px] font-semibold text-white hover:opacity-90">
                    <Camera size={13} /> Start camera
                  </button>
                ) : (
                  <button onClick={stopCamera} className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-3 py-1.5 text-[12px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40">
                    <CameraOff size={13} /> Stop
                  </button>
                )}
              </div>
              <div className="relative aspect-video overflow-hidden rounded-xl border border-[var(--line)] bg-black">
                <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
                {!cameraOn && (
                  <div className="absolute inset-0 grid place-items-center text-[13px] text-white/70">
                    Camera off — click Start to scan live
                  </div>
                )}
              </div>
              <p className="mt-2 text-[11.5px] text-[var(--txt-2)]">Hold the ISBN barcode steady in front of the camera.</p>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
              <p className="mb-3 text-[12px] font-semibold text-[var(--txt)]">Upload a photo</p>
              <label className="grid cursor-pointer place-items-center rounded-xl border-2 border-dashed border-[var(--line-mid)] bg-[var(--surface-2)] p-8 text-center hover:border-[#EE4B3C]/50">
                <Upload size={28} className="mb-2 text-[var(--txt-2)]" />
                <p className="text-[13px] font-semibold text-[var(--txt)]">Click to choose or take a photo</p>
                <p className="mt-1 text-[11.5px] text-[var(--txt-2)]">JPG, PNG, WebP, HEIC — up to 25 MB</p>
                <input type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) scanImage(f); e.target.value = ""; }} />
              </label>
              {error && (
                <p className="mt-2 flex items-center gap-1.5 text-[12px] text-[#C0392B]">
                  <AlertCircle size={13} /> {error}
                </p>
              )}
            </div>
          </div>

          {scans.length > 0 && (
            <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[13px] font-semibold text-[var(--txt)]">{scans.length} scanned ISBN{scans.length === 1 ? "" : "s"}</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={copyAll} className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-2.5 py-1 text-[12px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40">
                    {copied === "all" ? <><Check size={13} className="text-[#27AE60]" /> Copied</> : <><Copy size={13} /> Copy all</>}
                  </button>
                  <button onClick={clearAll} className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-2.5 py-1 text-[12px] font-semibold text-[var(--txt-2)] hover:border-[#EE4B3C]/40 hover:text-[#EE4B3C]">
                    <Trash2 size={13} /> Clear
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                {scans.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <CheckCircle size={14} className="text-[#27AE60]" />
                      <span className="truncate font-mono text-[13px] text-[var(--txt)]">{s.format}</span>
                    </div>
                    <button onClick={() => copy(s.format, s.id)} className="rounded-md p-1.5 text-[var(--txt-2)] hover:bg-[var(--hover-soft)]">
                      {copied === s.id ? <Check size={13} className="text-[#27AE60]" /> : <Copy size={13} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="mt-6 text-xs text-[var(--txt-2)]">🔒 100% private — camera stream and images stay on your device.</p>

          <ToolPageSections
            processingMode="browser"
            howToSteps={[
              { title: "Choose camera or photo", desc: "Use live camera for quick multi-book scanning, or upload photos one at a time." },
              { title: "Aim at the barcode", desc: "Hold the book steady with the barcode fully visible. Good lighting helps." },
              { title: "Copy the results", desc: "Detected ISBNs appear instantly. Copy one or all — duplicates are removed automatically." },
            ]}
            capabilities={[
              "Live camera scanning (EAN-13, ISBN-10, ISBN-13)",
              "Photo upload for single-image decoding",
              "Deduplication of repeat scans",
              "Formatted ISBN output with hyphens",
              "100% offline — no image or video leaves the browser",
            ]}
            useCases={[
              "Quick catalog of a personal library",
              "Building inventory for a used-book shop",
              "Verifying ISBNs on a stack of books at a distributor",
              "Digitizing school textbook lists",
            ]}
            relatedTools={["isbn-validator","isbn-barcode-generator","isbn-metadata-extractor"]}
            faqs={[
              { q: "Does the camera stream go anywhere?", a: "No. The camera feed is decoded frame-by-frame in your browser. No video or images are uploaded anywhere." },
              { q: "Why won't my camera start?", a: "Browser needs permission to use the camera. On iOS, this only works in Safari. HTTPS is required (localhost and pdf24x.com both work)." },
              { q: "Does it read blurry photos?", a: "The engine tries hard, but out-of-focus or poorly-lit barcodes will fail. Retake with better light or move closer." },
            ]}
          />
        </main>
      </div>
    </>
  );
}
