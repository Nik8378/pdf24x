"use client";
import { useState, useRef, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { UploadCloud, Download, Trash2, CheckCircle, Image as ImageIcon } from "lucide-react";

const SIZES = [16, 32, 48, 64, 128, 256];

function fmtBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

const ACCEPTED = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml", "image/gif", "image/bmp"];
const ACCEPT_STR = ".png,.jpg,.jpeg,.webp,.svg,.gif,.bmp,image/*";

export default function ImageToFaviconClient() {
  const [image, setImage] = useState<{ file: File; previewUrl: string; name: string; size: number } | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([16, 32, 48, 64, 128, 256]);
  const [converting, setConverting] = useState(false);
  const [done, setDone] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFile = useCallback((file: File) => {
    if (!ACCEPTED.includes(file.type) && !file.name.match(/\.(png|jpg|jpeg|webp|svg|gif|bmp)$/i)) {
      showToast("Please upload a valid image file", "error");
      return;
    }
    const url = URL.createObjectURL(file);
    setImage({ file, previewUrl: url, name: file.name, size: file.size });
    setDone(false);
    showToast("Image loaded successfully");
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const toggleSize = (size: number) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size].sort((a, b) => a - b)
    );
  };

  const renderToCanvas = (img: HTMLImageElement, size: number): HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);
    return canvas;
  };

  const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
    new Promise((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Canvas to blob failed")), "image/png");
    });

  // Build ICO file from multiple PNG blobs
  const buildIco = async (blobs: { size: number; blob: Blob }[]): Promise<Uint8Array> => {
    const pngBuffers: ArrayBuffer[] = await Promise.all(blobs.map(b => b.blob.arrayBuffer()));

    const count = blobs.length;
    const headerSize = 6;
    const dirEntrySize = 16;
    const dirSize = count * dirEntrySize;
    const dataOffset = headerSize + dirSize;

    let totalSize = dataOffset;
    const offsets: number[] = [];
    pngBuffers.forEach(buf => {
      offsets.push(totalSize);
      totalSize += buf.byteLength;
    });

    const ico = new Uint8Array(totalSize);
    const view = new DataView(ico.buffer);

    // ICO header
    view.setUint16(0, 0, true);  // reserved
    view.setUint16(2, 1, true);  // type: ICO
    view.setUint16(4, count, true); // count

    // Directory entries
    blobs.forEach(({ size }, i) => {
      const base = headerSize + i * dirEntrySize;
      view.setUint8(base + 0, size >= 256 ? 0 : size); // width (0 = 256)
      view.setUint8(base + 1, size >= 256 ? 0 : size); // height
      view.setUint8(base + 2, 0);  // color count
      view.setUint8(base + 3, 0);  // reserved
      view.setUint16(base + 4, 1, true); // color planes
      view.setUint16(base + 6, 32, true); // bits per pixel
      view.setUint32(base + 8, pngBuffers[i].byteLength, true); // size
      view.setUint32(base + 12, offsets[i], true); // offset
    });

    // PNG data
    let pos = dataOffset;
    pngBuffers.forEach(buf => {
      ico.set(new Uint8Array(buf), pos);
      pos += buf.byteLength;
    });

    return ico;
  };

  const handleConvert = async () => {
    if (!image || selectedSizes.length === 0) {
      showToast("Please select at least one size", "error");
      return;
    }
    setConverting(true);
    try {
      const img = new window.Image();
      img.src = image.previewUrl;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

      const blobs = await Promise.all(
        selectedSizes.map(async size => {
          const canvas = renderToCanvas(img, size);
          const blob = await canvasToBlob(canvas);
          return { size, blob };
        })
      );

      const icoBytes = await buildIco(blobs);
      const blob = new Blob([icoBytes.buffer as ArrayBuffer], { type: "image/x-icon" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "favicon.ico";
      a.click();
      URL.revokeObjectURL(url);

      setDone(true);
      showToast("favicon.ico downloaded successfully!");
    } catch (err) {
      console.error(err);
      showToast("Conversion failed. Please try another image.", "error");
    } finally {
      setConverting(false);
    }
  };

  return (
    <>
      <div className="w-full flex gap-0 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-8">

          {/* Header */}
          <div className="mb-5">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--txt)] mb-1">Image to Favicon Converter</h1>
            <p className="text-[13px] text-[var(--txt-2)]">
              Convert any image to favicon.ico — supports PNG, JPG, SVG, WEBP. All sizes included. Free & private.
            </p>
          </div>

          {/* SEO keywords as feature pills */}
          <div className="flex flex-wrap gap-2 mb-5">
            {["PNG to ICO", "JPG to Favicon", "SVG to ICO", "Favicon Generator", "Free ICO Maker", "No Upload"].map(tag => (
              <span key={tag} className="text-[11px] font-medium text-[var(--txt-2)] bg-[var(--hover-soft)] border border-[var(--line)] rounded-full px-3 py-1">{tag}</span>
            ))}
          </div>

          <div className="flex flex-col xl:flex-row gap-4 items-start">

            {/* Left — Upload + Preview */}
            <div className="flex-1 min-w-0 w-full space-y-4">

              {/* Upload Zone */}
              {!image ? (
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => inputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all shadow-sm flex flex-col items-center justify-center min-h-[220px] ${dragging ? "border-accent bg-accent-light scale-[1.01]" : "border-[var(--line-mid)] bg-[var(--surface)] hover:border-accent hover:bg-accent-light"}`}
                >
                  <input ref={inputRef} type="file" accept={ACCEPT_STR} className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  <div className="w-14 h-14 rounded-full bg-[var(--hover-soft)] flex items-center justify-center mb-4">
                    <UploadCloud size={22} className="text-[var(--txt-2)]" />
                  </div>
                  <h2 className="text-[14px] font-semibold text-[var(--txt)] mb-1">Drag & drop your image here</h2>
                  <p className="text-[12.5px] text-[var(--txt-2)] mb-4">PNG, JPG, SVG, WEBP, GIF, BMP supported</p>
                  <button onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
                    className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold text-[13.5px] px-6 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all">
                    <UploadCloud size={15} /> Choose Image
                  </button>
                  <p className="mt-3 text-[11.5px] text-[var(--txt-2)]">Files never leave your device</p>
                </div>
              ) : (
                <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[13.5px] font-semibold text-[var(--txt)]">Your Image</p>
                    <button onClick={() => { setImage(null); setDone(false); }}
                      className="text-[12px] text-red-500 hover:text-red-600 flex items-center gap-1">
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>

                  {/* Preview grid */}
                  <div className="flex flex-wrap items-end gap-4 mb-4">
                    {/* Original */}
                    <div className="text-center">
                      <div className="w-32 h-32 rounded-xl border border-[var(--line)] overflow-hidden bg-[var(--hover-soft)] flex items-center justify-center">
                        <img src={image.previewUrl} alt="original" className="w-full h-full object-contain" />
                      </div>
                      <p className="text-[11px] text-[var(--txt-2)] mt-1">Original</p>
                      <p className="text-[10.5px] text-[var(--txt-2)]">{fmtBytes(image.size)}</p>
                    </div>

                    {/* Size previews */}
                    {[64, 32, 16].map(size => (
                      <div key={size} className="text-center">
                        <div className="rounded border border-[var(--line)] overflow-hidden bg-[var(--hover-soft)] flex items-center justify-center"
                          style={{ width: Math.max(size, 24), height: Math.max(size, 24) }}>
                          <img src={image.previewUrl} alt={`${size}x${size}`} style={{ width: size, height: size, objectFit: "contain" }} />
                        </div>
                        <p className="text-[10.5px] text-[var(--txt-2)] mt-1">{size}×{size}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-[var(--hover-soft)] rounded-xl">
                    <ImageIcon size={15} className="text-[var(--txt-2)] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium text-[var(--txt)] truncate">{image.name}</p>
                      <p className="text-[11px] text-[var(--txt-2)]">{fmtBytes(image.size)}</p>
                    </div>
                    {done && <CheckCircle size={16} className="text-green-500 shrink-0" />}
                  </div>
                </div>
              )}

              {/* How it works */}
              <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5">
                <h2 className="text-[13px] font-bold text-[var(--txt)] mb-3">How to create a favicon</h2>
                <ol className="space-y-2">
                  {[
                    "Upload any image — PNG, JPG, SVG, WEBP, GIF or BMP",
                    "Select the favicon sizes you need (16×16 to 256×256)",
                    "Click Convert & Download to get your favicon.ico",
                    "Place favicon.ico in your website's root folder",
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[12.5px] text-[var(--txt-2)]">
                      <span className="w-5 h-5 rounded-full bg-accent-bg text-accent text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Right — Settings Panel */}
            <div className="w-full xl:w-[260px] shrink-0 xl:sticky xl:top-14">
              <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-[var(--line)]">
                  <ImageIcon size={14} className="text-[var(--txt-2)]" />
                  <h3 className="text-[13px] font-bold text-[var(--txt)]">Favicon Sizes</h3>
                </div>

                <p className="text-[11.5px] text-[var(--txt-2)] mb-3">Select which sizes to include in your favicon.ico</p>

                <div className="space-y-2 mb-4">
                  {SIZES.map(size => (
                    <label key={size} className="flex items-center gap-2.5 cursor-pointer group">
                      <div
                        onClick={() => toggleSize(size)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${selectedSizes.includes(size) ? "bg-accent border-accent" : "border-[var(--line-mid)] group-hover:border-accent"}`}
                      >
                        {selectedSizes.includes(size) && (
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                            <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className="text-[12.5px] text-[var(--txt)] flex-1">{size}×{size}px</span>
                      <span className="text-[10.5px] text-[var(--txt-2)]">
                        {size === 16 ? "Browser tab" : size === 32 ? "Taskbar" : size === 48 ? "Desktop" : size === 64 ? "High-DPI" : size === 128 ? "Chrome Web Store" : "Windows"}
                      </span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedSizes(SIZES)}
                  className="text-[11.5px] text-accent hover:underline mb-4 block"
                >
                  Select all sizes
                </button>

                <div className="border-t border-[var(--line)] pt-3">
                  <button
                    onClick={handleConvert}
                    disabled={!image || converting || selectedSizes.length === 0}
                    className={`w-full flex items-center justify-center gap-2 font-semibold text-[14px] py-3 rounded-full transition-all ${!image || converting || selectedSizes.length === 0 ? "bg-[var(--hover-soft)] text-[var(--txt-2)] cursor-not-allowed" : "bg-accent hover:bg-accent-dark text-white shadow-md hover:shadow-lg"}`}
                  >
                    {converting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                    {converting ? "Converting…" : done ? "Download Again" : "Convert & Download"}
                  </button>
                  <p className="text-center text-[11px] text-[var(--txt-2)] mt-2">
                    Files processed locally · Never uploaded
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {toast && (
        <div className={`fixed bottom-20 lg:bottom-5 right-4 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[13.5px] font-medium z-[200] ${toast.type === "success" ? "bg-green-700 text-white" : "bg-red-600 text-white"}`}>
          {toast.msg}
        </div>
      )}
    </>
  );
}
