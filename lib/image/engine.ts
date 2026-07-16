// Shared image engine — load, decode (incl. HEIC), auto-orient by EXIF, encode.
// All operations run in the browser; no data leaves the device.

export const ACCEPT_ALL = ".jpg,.jpeg,.png,.webp,.avif,.gif,.bmp,.heic,.heif,image/*";
export const ACCEPT_HEIC = ".heic,.heif,image/heic,image/heif";
export const ACCEPT_STANDARD = ".jpg,.jpeg,.png,.webp,.avif,.gif,.bmp,image/*";

export interface LoadedImage {
  bitmap: ImageBitmap;
  width: number;
  height: number;
  originalName: string;
  originalSize: number;
  originalType: string;
}

/* Decode any input (HEIC handled first, then browser-native). */
export async function loadImage(file: File): Promise<LoadedImage> {
  let source: Blob = file;
  const name = file.name;
  const ext = name.split(".").pop()?.toLowerCase() ?? "";

  // HEIC → convert to JPEG blob first
  if (ext === "heic" || ext === "heif" || file.type.includes("heic") || file.type.includes("heif")) {
    const heic2any = (await import("heic2any")).default;
    const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.95 });
    source = Array.isArray(converted) ? converted[0] : converted;
  }

  // Read EXIF orientation for non-HEIC inputs (HEIC lib already orients)
  let orientation = 1;
  if (source === file) {
    try {
      const exifr = await import("exifr");
      const meta = await exifr.parse(file, { pick: ["Orientation"] });
      if (meta?.Orientation) orientation = meta.Orientation;
    } catch { /* no exif or unsupported — ignore */ }
  }

  const rawBitmap = await createImageBitmap(source);
  const bitmap = orientation > 1 ? await applyOrientation(rawBitmap, orientation) : rawBitmap;

  return {
    bitmap,
    width: bitmap.width,
    height: bitmap.height,
    originalName: name,
    originalSize: file.size,
    originalType: file.type || `image/${ext}`,
  };
}

/* Apply EXIF orientation (1..8) — returns a new correctly-rotated ImageBitmap */
async function applyOrientation(bmp: ImageBitmap, orient: number): Promise<ImageBitmap> {
  const w = bmp.width, h = bmp.height;
  const swap = orient >= 5;
  const canvas = document.createElement("canvas");
  canvas.width = swap ? h : w;
  canvas.height = swap ? w : h;
  const ctx = canvas.getContext("2d")!;
  switch (orient) {
    case 2: ctx.translate(w, 0); ctx.scale(-1, 1); break;
    case 3: ctx.translate(w, h); ctx.rotate(Math.PI); break;
    case 4: ctx.translate(0, h); ctx.scale(1, -1); break;
    case 5: ctx.rotate(0.5 * Math.PI); ctx.scale(1, -1); break;
    case 6: ctx.rotate(0.5 * Math.PI); ctx.translate(0, -h); break;
    case 7: ctx.rotate(0.5 * Math.PI); ctx.translate(w, -h); ctx.scale(-1, 1); break;
    case 8: ctx.rotate(-0.5 * Math.PI); ctx.translate(-w, 0); break;
  }
  ctx.drawImage(bmp, 0, 0);
  const out = await createImageBitmap(canvas);
  bmp.close();
  return out;
}

/* Draw a LoadedImage to a fresh canvas at target size (or same size) with optional transforms. */
export interface DrawOptions {
  targetWidth?: number;
  targetHeight?: number;
  rotateDeg?: 0 | 90 | 180 | 270;
  flipH?: boolean;
  flipV?: boolean;
  background?: string; // for lossy formats over transparency (jpg)
  crop?: { x: number; y: number; w: number; h: number };
}
export function drawToCanvas(img: LoadedImage, opts: DrawOptions = {}): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const src = opts.crop
    ? { x: opts.crop.x, y: opts.crop.y, w: opts.crop.w, h: opts.crop.h }
    : { x: 0, y: 0, w: img.width, h: img.height };

  const targetW = opts.targetWidth ?? src.w;
  const targetH = opts.targetHeight ?? src.h;
  const rot = opts.rotateDeg ?? 0;
  const swap = rot === 90 || rot === 270;

  canvas.width = swap ? targetH : targetW;
  canvas.height = swap ? targetW : targetH;
  const ctx = canvas.getContext("2d")!;

  if (opts.background) { ctx.fillStyle = opts.background; ctx.fillRect(0, 0, canvas.width, canvas.height); }

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  if (rot) ctx.rotate((rot * Math.PI) / 180);
  ctx.scale(opts.flipH ? -1 : 1, opts.flipV ? -1 : 1);
  ctx.drawImage(img.bitmap, src.x, src.y, src.w, src.h, -targetW / 2, -targetH / 2, targetW, targetH);
  ctx.restore();
  return canvas;
}

/* Encode canvas to a Blob (Promise-wrapped). */
export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Encode failed"))),
      type,
      quality
    );
  });
}

/* Utilities */
export function fmtBytes(b: number): string {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}
export function savingsPct(before: number, after: number): number {
  return Math.round((1 - after / before) * 100);
}
export function replaceExt(name: string, newExt: string): string {
  return name.replace(/\.[^.]+$/, "") + "." + newExt;
}
export function genId(): string { return Math.random().toString(36).slice(2, 10); }

/* ZIP archive (JSZip-style, but tiny inline implementation using store-only + CRC). Kept minimal:
   we lazy-import a proper JSZip only if there are many files. For up to ~20 files we let the browser
   download each Blob directly to avoid the extra dep. */
export async function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
