import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Image to WebP Converter – Free, No Upload",
  description:
    "Convert JPG, PNG, GIF, BMP, TIFF, AVIF, SVG and any image format to WebP instantly in your browser. Free, private — files never leave your device. Bulk convert multiple images at once.",
  alternates: { canonical: "https://pdf24x.com/tools/image-to-webp" },
  openGraph: {
    title: "Image to WebP Converter – Free Online Tool | PDF24x",
    description:
      "Convert any image to WebP format for free. Reduce file size by up to 80% without quality loss. 100% browser-based.",
    url: "https://pdf24x.com/tools/image-to-webp",
  },
};
import ImageToWebpClient from "./ImageToWebpClient";
export default function Page() { return <ImageToWebpClient />; }
