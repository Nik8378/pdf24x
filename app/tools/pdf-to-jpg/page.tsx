import type { Metadata } from "next";
import { ToolJsonLd } from "@/components/seo/ToolJsonLd";
export const metadata: Metadata = {
  title: "PDF to JPG Converter – Free, No Upload",
  description:
    "Convert PDF pages to high-quality JPG images for free. Choose resolution (72–300 DPI), page range, and color mode. 100% browser-based — files never leave your device.",
  alternates: { canonical: "https://pdf24x.com/tools/pdf-to-jpg" },
};
import PdfToJpgClient from "./PdfToJpgClient";
export default function Page() {
  return <PdfToJpgClient />;
}
