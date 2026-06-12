"use client";
import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { fileToImageFile } from "@/lib/pdfEngine";

export function useClipboardPaste() {
  const { addImages, showToast } = useAppStore();

  useEffect(() => {
    const handler = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }

      if (!imageFiles.length) return;

      const results = await Promise.all(imageFiles.map(fileToImageFile));
      const valid = results.filter(Boolean) as NonNullable<Awaited<ReturnType<typeof fileToImageFile>>>[];
      if (valid.length) {
        addImages(valid);
        showToast(`${valid.length} image${valid.length !== 1 ? "s" : ""} pasted from clipboard`, "success");
      }
    };

    document.addEventListener("paste", handler);
    return () => document.removeEventListener("paste", handler);
  }, [addImages, showToast]);
}
