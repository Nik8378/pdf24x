import type { Metadata } from "next";
import WatermarkPdfClient from "./WatermarkPdfClient";
export const metadata: Metadata = {
  title: "Watermark PDF | PDF24X",
  description: "Add custom text watermarks to PDF files online for free. Choose position, color, opacity and rotation.",
  alternates: { canonical: "https://pdf24x.com/tools/watermark-pdf" },
};
export default function Page() { return <WatermarkPdfClient />; }
