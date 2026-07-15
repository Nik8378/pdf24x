"use client";
import { useCallback, useRef, useState } from "react";
import { UploadCloud, Plus } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { fileToImageFile } from "@/lib/pdfEngine";
import type { ImageFile } from "@/types";

const FORMATS = ["JPG", "JPEG", "PNG", "WEBP", "BMP"];
const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp"];

// Block ICO by extension and mime type
function isIcoFile(f: File) {
  const ext = f.name.split(".").pop()?.toLowerCase();
  return (
    ext === "ico" ||
    f.type === "image/x-icon" ||
    f.type === "image/vnd.microsoft.icon"
  );
}

interface UploadZoneProps {
  compact?: boolean;
  fillHeight?: boolean;
}

export function UploadZone({ compact = false, fillHeight: _fillHeight = false }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addImages, showToast } = useAppStore();

  const processFiles = useCallback(
    async (fileList: File[] | FileList) => {
      const files = Array.from(fileList);

      // Filter out ICO files first
      const noIco = files.filter((f) => !isIcoFile(f));
      const icoCount = files.length - noIco.length;

      const allowed = noIco.filter((f) => ALLOWED.includes(f.type));
      const rejected = noIco.length - allowed.length + icoCount;

      if (icoCount > 0) {
        showToast(`ICO files are not supported`, "error");
      } else if (rejected > 0) {
        showToast(`${rejected} file(s) skipped — unsupported format`, "error");
      }
      if (!allowed.length) return;

      setLoading(true);
      try {
        const results = await Promise.all(allowed.map(fileToImageFile));
        const valid = results.filter(Boolean) as Awaited<ReturnType<typeof fileToImageFile>>[];
        addImages(valid as ImageFile[]);
        showToast(
          `${valid.length} image${valid.length !== 1 ? "s" : ""} added successfully`,
          "success"
        );
      } catch {
        showToast("Failed to read some files. Please try again.", "error");
      } finally {
        setLoading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [addImages, showToast]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);
  const onDragLeave = useCallback(() => setDragging(false), []);
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const onClick = () => inputRef.current?.click();

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--line)] text-[13px] text-[var(--txt-2)] hover:bg-[var(--hover-soft)] hover:text-[var(--txt)] transition-all"
      >
        <Plus size={14} strokeWidth={2} />
        Add More
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED.join(",")}
          multiple
          className="hidden"
          onChange={(e) => processFiles(e.target.files!)}
        />
      </button>
    );
  }

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      className={`relative border-2 border-dashed rounded-2xl p-5 sm:p-6 text-center cursor-pointer transition-all duration-200 group shadow-sm flex flex-col items-center justify-center min-h-[220px] ${
        dragging
          ? "border-accent bg-accent-light scale-[1.01]"
          : "border-[var(--line-mid)] bg-[var(--surface)] hover:border-accent hover:bg-accent-light"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED.join(",")}
        multiple
        className="hidden"
        onChange={(e) => processFiles(e.target.files!)}
      />

      {/* Icon */}
      <div
        className={`w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center transition-all duration-200 ${
          dragging ? "bg-accent-bg" : "bg-[var(--hover-soft)] group-hover:bg-accent-bg"
        }`}
      >
        {loading ? (
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full spin" />
        ) : (
          <UploadCloud
            size={20}
            strokeWidth={1.8}
            className={`transition-colors ${
              dragging ? "text-accent" : "text-[var(--txt-2)] group-hover:text-accent"
            }`}
          />
        )}
      </div>

      <h2 className="text-[14px] font-semibold text-[var(--txt)] mb-1">
        {dragging ? "Drop your images here" : "Drag & drop images here"}
      </h2>
      <p className="text-[12.5px] text-[var(--txt-2)] mb-3">
        or click to browse · you can also paste from clipboard
      </p>

      {/* Format pills */}
      <div className="flex flex-wrap gap-1.5 justify-center mb-4">
        {FORMATS.map((f) => (
          <span
            key={f}
            className="text-[11px] font-medium text-[var(--txt-2)] bg-[var(--hover-soft)] border border-[var(--line)] rounded px-2 py-0.5"
          >
            {f}
          </span>
        ))}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold text-[13.5px] px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
      >
        <UploadCloud size={15} strokeWidth={2} />
        Choose Files
      </button>

      <p className="mt-3 text-[11.5px] text-[var(--txt-2)]">
        No file size limit · Multiple files supported
      </p>
    </div>
  );
}