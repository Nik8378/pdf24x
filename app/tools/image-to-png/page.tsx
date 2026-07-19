import type { Metadata } from "next";
import { ToolJsonLd } from "@/components/seo/ToolJsonLd";
export const metadata: Metadata = {
  title: "Image to PNG Converter – Free Online",
  description: "Convert JPG, WebP, HEIC, AVIF and other images to PNG online for free. Lossless quality, transparency preserved, batch processing, EXIF-aware. 100% private — everything runs in your browser.",
  alternates: { canonical: "https://pdf24x.com/tools/image-to-png" },
};
import ImageToPngClient from "./ImageToPngClient";
export default function Page() { return <ImageToPngClient />; }
