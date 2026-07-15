export interface ImageFile {
  id: string;
  file: File;
  dataUrl: string;
  rotation: 0 | 90 | 180 | 270;
  name: string;
  size: number;
  width?: number;
  height?: number;
}

export type PageSize = "A4" | "A5" | "Letter" | "Legal" | "Auto";
export type Orientation = "auto" | "portrait" | "landscape";
export type MarginSize = "none" | "small" | "medium";
export type ImageFit = "fit" | "fill" | "original";
export type Quality = "original" | "balanced" | "smallest";

export interface PDFSettings {
  pageSize: PageSize;
  orientation: Orientation;
  margins: MarginSize;
  imageFit: ImageFit;
  quality: Quality;
}

export interface ConversionProgress {
  active: boolean;
  label: string;
  sub: string;
  percent: number;
}

export interface ToastState {
  visible: boolean;
  message: string;
  type: "success" | "error" | "info";
}
