import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Image Cropper – Crop Images Free Online",
  description: "Crop images online for free with aspect-ratio presets. Interactive drag-to-crop, batch mode, 100% private — everything runs in your browser.",
  alternates: { canonical: "https://pdf24x.com/tools/image-cropper" },
};
import ImageCropperClient from "./ImageCropperClient";
export default function Page() { return <ImageCropperClient />; }
