import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Image to JPG Converter – Free Online",
  description: "Convert PNG, WebP, HEIC, AVIF and other images to JPG online for free. Adjustable quality, batch processing, EXIF-aware. 100% private — everything runs in your browser.",
  alternates: { canonical: "https://pdf24x.com/tools/image-to-jpg" },
};
import ImageToJpgClient from "./ImageToJpgClient";
export default function Page() { return <ImageToJpgClient />; }
