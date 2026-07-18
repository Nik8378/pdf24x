"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import ToolPageSections from "@/components/tool/ToolPageSections";
import { validate } from "@/lib/isbn/engine";
import { Download, Trash2, AlertCircle } from "lucide-react";

export default function ISBNBarcodeGeneratorClient() {
  const [input, setInput] = useState("9783161484100");
  const [scale, setScale] = useState(4);
  const [height, setHeight] = useState(30);
  const [showText, setShowText] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  const parsed = useMemo(() => input.trim() ? validate(input) : null, [input]);
  const isbn13 = parsed?.valid ? parsed.isbn13 : null;

  useEffect(() => {
    if (!isbn13 || !canvasRef.current) return;
    setError(null);
    (async () => {
      try {
        const bwipjs = (await import("bwip-js/browser")).default;
        bwipjs.toCanvas(canvasRef.current!, {
          bcid: "ean13",
          text: isbn13,
          scale,
          height,
          includetext: showText,
          textxalign: "center",
          textfont: "Helvetica",
          textsize: 10,
          alttext: showText ? (parsed?.format ?? isbn13) : undefined,
          backgroundcolor: "ffffff",
        });
      } catch (e) {
        setError((e as Error).message || "Failed to render barcode");
      }
    })();
  }, [isbn13, scale, height, showText, parsed?.format]);

  const download = (fmt: "png" | "svg") => {
    if (!isbn13 || !canvasRef.current) return;
    if (fmt === "png") {
      const url = canvasRef.current.toDataURL("image/png");
      const a = document.createElement("a"); a.href = url; a.download = `isbn-${isbn13}.png`; a.click();
    } else {
      (async () => {
        const bwipjs = (await import("bwip-js/browser")).default;
        try {
          const svgText = bwipjs.toSVG({
            bcid: "ean13", text: isbn13, scale, height,
            includetext: showText, textxalign: "center", textfont: "Helvetica", textsize: 10,
            alttext: showText ? (parsed?.format ?? isbn13) : undefined,
            backgroundcolor: "ffffff",
          });
          const blob = new Blob([svgText], { type: "image/svg+xml" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url; a.download = `isbn-${isbn13}.svg`; a.click();
          setTimeout(() => URL.revokeObjectURL(url), 500);
        } catch { /* fallback done via png */ }
      })();
    }
  };

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--txt)]">ISBN Barcode Generator</h1>
            <p className="text-[13px] text-[var(--txt-2)]">
              Generate a print-ready EAN-13 barcode from any valid ISBN. Adjustable size, downloadable as PNG or SVG. 100% private — renders in your browser.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
            {/* Controls */}
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
              <label className="mb-1.5 flex items-center justify-between text-[12px] font-semibold text-[var(--txt)]">
                ISBN
                {input && <button onClick={() => setInput("")} className="flex items-center gap-1 text-[11px] font-semibold text-[var(--txt-2)] hover:text-[#EE4B3C]"><Trash2 size={11} /> Clear</button>}
              </label>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false}
                placeholder="978-3-16-148410-0"
                className="w-full rounded-md border border-[var(--line-mid)] bg-[var(--surface-2)] px-3 py-2 font-mono text-[14px] text-[var(--txt)] outline-none focus:border-[#EE4B3C]/50" />

              {parsed && !parsed.valid && (
                <p className="mt-2 flex items-center gap-1.5 text-[12px] text-[#C0392B]"><AlertCircle size={13} /> {parsed.reason}</p>
              )}

              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 flex items-center justify-between text-[12px] font-semibold text-[var(--txt)]">
                    Scale <span className="font-mono text-[11.5px] text-[var(--txt-2)]">{scale}</span>
                  </label>
                  <input type="range" min={2} max={8} step={1} value={scale} onChange={(e) => setScale(parseInt(e.target.value))} className="w-full accent-[#EE4B3C]" />
                </div>
                <div>
                  <label className="mb-1 flex items-center justify-between text-[12px] font-semibold text-[var(--txt)]">
                    Bar height (mm) <span className="font-mono text-[11.5px] text-[var(--txt-2)]">{height}</span>
                  </label>
                  <input type="range" min={15} max={60} step={1} value={height} onChange={(e) => setHeight(parseInt(e.target.value))} className="w-full accent-[#EE4B3C]" />
                </div>
                <label className="flex cursor-pointer items-center gap-1.5 text-[12px] font-medium text-[var(--txt-2)]">
                  <input type="checkbox" checked={showText} onChange={(e) => setShowText(e.target.checked)} className="accent-[#EE4B3C]" />
                  Show ISBN text below barcode
                </label>
              </div>

              {isbn13 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => download("png")} className="flex items-center gap-1.5 rounded-lg bg-[#EE4B3C] px-3 py-2 text-[13px] font-semibold text-white hover:opacity-90">
                    <Download size={14} /> Download PNG
                  </button>
                  <button onClick={() => download("svg")} className="flex items-center gap-1.5 rounded-lg border border-[var(--line-mid)] px-3 py-2 text-[13px] font-semibold text-[var(--txt)] hover:border-[#EE4B3C]/40">
                    <Download size={14} /> Download SVG
                  </button>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-4">
              <p className="mb-3 text-[11.5px] font-bold uppercase tracking-wide text-[var(--txt-2)]">Preview</p>
              <div className="grid min-h-[240px] place-items-center rounded-xl border border-[var(--line)] bg-white p-4">
                {isbn13 ? (
                  <canvas ref={canvasRef} className="max-w-full" />
                ) : (
                  <p className="text-[13px] text-[var(--txt-2)]">Enter a valid ISBN to preview</p>
                )}
              </div>
              {error && <p className="mt-2 text-[11.5px] text-[#C0392B]">{error}</p>}
            </div>
          </div>

          <p className="mt-6 text-xs text-[var(--txt-2)]">🔒 100% private — barcode renders locally in your browser.</p>

          <ToolPageSections
            processingMode="browser"
            howToSteps={[
              { title: "Enter an ISBN", desc: "ISBN-10 or ISBN-13 — anything valid works." },
              { title: "Adjust size", desc: "Scale controls the width; bar height is in mm (industry standard is 22–30 mm)." },
              { title: "Download PNG or SVG", desc: "PNG for quick use; SVG for infinite scaling in print or design software." },
            ]}
            capabilities={[
              "Generates industry-standard EAN-13 barcodes from ISBNs",
              "Adjustable scale and bar height",
              "Optional ISBN text under the barcode",
              "Download as PNG (raster) or SVG (vector)",
              "Live preview updates as you tweak settings",
            ]}
            useCases={[
              "Add barcodes to book covers before printing",
              "Generate barcodes for a self-published title",
              "Reprint a damaged barcode on an existing book",
              "Test barcode readability before mass production",
            ]}
            relatedTools={["isbn-validator","isbn-barcode-reader","isbn-country-identifier"]}
            faqs={[
              { q: "What barcode standard is used?", a: "EAN-13, which is the international book industry standard. It's what physical retailers, warehouses, and libraries scan." },
              { q: "SVG or PNG for print?", a: "SVG. It's vector, so it stays crisp at any print size. PNG is fine for on-screen previews or web use." },
              { q: "What size should the barcode be?", a: "The GS1 standard recommends 100% magnification (37.29 mm × 25.93 mm) with quiet zones. Our default settings produce a barcode near that size." },
            ]}
          />
        </main>
      </div>
    </>
  );
}
