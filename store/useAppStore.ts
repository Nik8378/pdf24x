"use client";
import { create } from "zustand";
import type {
  ImageFile,
  PDFSettings,
  ConversionProgress,
  ToastState,
} from "@/types";

interface AppStore {
  images: ImageFile[];
  settings: PDFSettings;
  progress: ConversionProgress;
  toast: ToastState;

  // Image actions
  addImages: (imgs: ImageFile[]) => void;
  removeImage: (id: string) => void;
  reorderImages: (from: number, to: number) => void;
  rotateImage: (id: string, direction: "cw" | "ccw") => void;
  clearImages: () => void;

  // Settings actions
  updateSettings: (patch: Partial<PDFSettings>) => void;

  // Progress
  setProgress: (p: Partial<ConversionProgress>) => void;
  hideProgress: () => void;

  // Toast
  showToast: (message: string, type?: ToastState["type"]) => void;
  hideToast: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  images: [],
  settings: {
    pageSize: "A4",
    orientation: "auto",
    margins: "small",
    imageFit: "fit",
    quality: "original",
  },
  progress: { active: false, label: "", sub: "", percent: 0 },
  toast: { visible: false, message: "", type: "success" },

  addImages: (imgs) =>
    set((s) => ({ images: [...s.images, ...imgs] })),

  removeImage: (id) =>
    set((s) => ({ images: s.images.filter((i) => i.id !== id) })),

  reorderImages: (from, to) =>
    set((s) => {
      const imgs = [...s.images];
      const [moved] = imgs.splice(from, 1);
      imgs.splice(to, 0, moved);
      return { images: imgs };
    }),

  rotateImage: (id, direction) =>
    set((s) => ({
      images: s.images.map((img) => {
        if (img.id !== id) return img;
        const delta = direction === "cw" ? 90 : 270;
        const next = ((img.rotation + delta) % 360) as 0 | 90 | 180 | 270;
        return { ...img, rotation: next };
      }),
    })),

  clearImages: () => set({ images: [] }),

  updateSettings: (patch) =>
    set((s) => ({ settings: { ...s.settings, ...patch } })),

  setProgress: (p) =>
    set((s) => ({ progress: { ...s.progress, ...p } })),

  hideProgress: () =>
    set({ progress: { active: false, label: "", sub: "", percent: 0 } }),

  showToast: (message, type = "success") => {
    set({ toast: { visible: true, message, type } });
    setTimeout(
      () => set({ toast: { visible: false, message: "", type: "success" } }),
      3500
    );
  },

  hideToast: () =>
    set({ toast: { visible: false, message: "", type: "success" } }),
}));
