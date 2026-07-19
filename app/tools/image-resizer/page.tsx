import type { Metadata } from "next";
import { ToolJsonLd } from "@/components/seo/ToolJsonLd";
export const metadata: Metadata = {
  title: "Image Resizer – Resize Images Online Free",
  description: "Resize images by pixels or percentage online for free. Aspect-ratio lock, batch processing, choose output format. 100% private — everything runs in your browser.",
  alternates: { canonical: "https://pdf24x.com/tools/image-resizer" },
};
import ImageResizerClient from "./ImageResizerClient";
export default function Page() { return <ImageResizerClient />; }
