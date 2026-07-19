import type { Metadata } from "next";
import { ToolJsonLd } from "@/components/seo/ToolJsonLd";
export const metadata: Metadata = {
  title: "Image Compressor – Reduce Image Size Free",
  description: "Compress images online for free. Adjust quality or set a target file size — we find the best quality automatically. Supports JPG, PNG, WebP, HEIC. Batch processing. 100% private.",
  alternates: { canonical: "https://pdf24x.com/tools/image-compressor" },
};
import ImageCompressorClient from "./ImageCompressorClient";
export default function Page() { return <ImageCompressorClient />; }
