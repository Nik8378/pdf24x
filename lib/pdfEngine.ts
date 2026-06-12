import type { ImageFile, PDFSettings } from "@/types";

// Page sizes in points (1 pt = 1/72 inch)
const PAGE_SIZES: Record<string, [number, number]> = {
  A4: [595.28, 841.89],
  A5: [419.53, 595.28],
  Letter: [612, 792],
  Legal: [612, 1008],
};

const MARGIN_MAP: Record<string, number> = {
  none: 0,
  small: 14.17, // 5mm
  medium: 28.35, // 10mm
};

const QUALITY_MAP: Record<string, number> = {
  original: 0.98,
  balanced: 0.82,
  smallest: 0.62,
};

type ProgressCallback = (percent: number, label: string) => void;

export async function convertImagesToPDF(
  images: ImageFile[],
  settings: PDFSettings,
  onProgress: ProgressCallback
): Promise<Uint8Array> {
  // Dynamic import for browser-side only
  const { PDFDocument } = await import("pdf-lib");

  onProgress(5, "Initialising PDF engine…");
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle("PDF24x Document");
  pdfDoc.setCreator("PDF24x – pdf24x.com");

  const margin = MARGIN_MAP[settings.margins] ?? 14.17;
  const quality = QUALITY_MAP[settings.quality] ?? 0.98;

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const pct = 10 + Math.round((i / images.length) * 82);
    onProgress(pct, `Processing image ${i + 1} of ${images.length}…`);

    // Small delay to let UI update
    await new Promise((r) => setTimeout(r, 20));

    // Render image to canvas (handles rotation + quality)
    const { dataUrl, naturalW, naturalH } = await renderToCanvas(img, quality);
    const bytes = dataUrlToBytes(dataUrl.split(",")[1]);

    // Embed image
    let embedded;
    if (dataUrl.startsWith("data:image/png")) {
      embedded = await pdfDoc.embedPng(bytes);
    } else {
      embedded = await pdfDoc.embedJpg(bytes);
    }

    // Determine page dimensions
    let [pw, ph] = getPageDimensions(
      settings.pageSize,
      naturalW,
      naturalH
    );

    // Apply orientation
    const isLandscape =
      settings.orientation === "landscape" ||
      (settings.orientation === "auto" && naturalW > naturalH);

    if (isLandscape && pw < ph) [pw, ph] = [ph, pw];
    if (!isLandscape && pw > ph) [pw, ph] = [ph, pw];

    const page = pdfDoc.addPage([pw, ph]);
    const drawW = pw - margin * 2;
    const drawH = ph - margin * 2;

    // Calculate draw rect
    const { x, y, w, h } = calcDrawRect(
      naturalW,
      naturalH,
      drawW,
      drawH,
      margin,
      settings.imageFit
    );

    page.drawImage(embedded, { x, y, width: w, height: h });
  }

  onProgress(96, "Saving PDF…");
  await new Promise((r) => setTimeout(r, 50));

  const bytes = await pdfDoc.save();
  onProgress(100, "Done!");
  return bytes;
}

function getPageDimensions(
  size: string,
  imgW: number,
  imgH: number
): [number, number] {
  if (size === "Auto") {
    // Use image's natural size in points (96dpi → 72pt)
    return [imgW * 0.75, imgH * 0.75];
  }
  return PAGE_SIZES[size] ?? PAGE_SIZES.A4;
}

function calcDrawRect(
  imgW: number,
  imgH: number,
  drawW: number,
  drawH: number,
  margin: number,
  fit: string
): { x: number; y: number; w: number; h: number } {
  let w: number, h: number;

  if (fit === "original") {
    w = imgW * 0.75;
    h = imgH * 0.75;
  } else if (fit === "fill") {
    const scale = Math.max(drawW / imgW, drawH / imgH);
    w = imgW * scale;
    h = imgH * scale;
  } else {
    // "fit" (default)
    const scale = Math.min(drawW / imgW, drawH / imgH);
    w = imgW * scale;
    h = imgH * scale;
  }

  const x = margin + (drawW - w) / 2;
  // pdf-lib origin is bottom-left
  const y = margin + (drawH - h) / 2;

  return { x, y, w, h };
}

async function renderToCanvas(
  img: ImageFile,
  quality: number
): Promise<{ dataUrl: string; naturalW: number; naturalH: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const r = img.rotation;
      const rotated = r === 90 || r === 270;
      const cw = rotated ? image.naturalHeight : image.naturalWidth;
      const ch = rotated ? image.naturalWidth : image.naturalHeight;

      const canvas = document.createElement("canvas");
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext("2d")!;

      ctx.save();
      ctx.translate(cw / 2, ch / 2);
      ctx.rotate((r * Math.PI) / 180);
      ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
      ctx.restore();

      // Always export as JPEG (forces RGBA-safe output, avoids ICO/format issues)
      const isPng = img.file.type === "image/png";
      const dataUrl = canvas.toDataURL(
        isPng ? "image/png" : "image/jpeg",
        quality
      );
      resolve({ dataUrl, naturalW: cw, naturalH: ch });
    };
    image.onerror = () => reject(new Error(`Failed to load image: ${img.name}`));
    image.src = img.dataUrl;
  });
}

function dataUrlToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

export function downloadBlob(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export async function fileToImageFile(file: File): Promise<ImageFile | null> {
  // Block ICO files by extension AND all known mime types
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "ico") return null;
  if (
    file.type === "image/x-icon" ||
    file.type === "image/vnd.microsoft.icon"
  ) return null;

  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/bmp",
  ];
  if (!allowed.includes(file.type)) return null;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        resolve({
          id: generateId(),
          file,
          dataUrl,
          rotation: 0,
          name: file.name,
          size: file.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}