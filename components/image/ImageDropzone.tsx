"use client";
import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

export function ImageDropzone({
  onFiles, accept, multiple = true, hint,
}: {
  onFiles: (files: File[]) => void;
  accept: string;
  multiple?: boolean;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handle = (fl: FileList | null) => {
    if (!fl?.length) return;
    onFiles(Array.from(fl));
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-10 text-center transition-all ${drag ? "border-[#EE4B3C] bg-[var(--diff-add-bg)]" : "border-[var(--line-mid)] bg-[var(--surface)] hover:border-[#EE4B3C]/50"}`}
    >
      <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
        <UploadCloud size={22} className="text-[#EE4B3C]" />
      </span>
      <p className="text-[15px] font-semibold text-[var(--txt)]">
        {multiple ? "Drop images here, or click to browse" : "Drop an image here, or click to browse"}
      </p>
      <p className="mt-1 text-[13px] text-[var(--txt-2)]">{hint ?? "Up to 25 MB per file"}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => { handle(e.target.files); e.target.value = ""; }}
      />
    </div>
  );
}
