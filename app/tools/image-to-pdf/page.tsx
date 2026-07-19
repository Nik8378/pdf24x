import type { Metadata } from "next";
import { ToolJsonLd } from "@/components/seo/ToolJsonLd";
import ImageToPdfClient from "./ImageToPdfClient";

export const metadata: Metadata = {
  title: "Image to PDF Converter | PDF24X",
  description: "Convert JPG, PNG, WEBP images to PDF online for free. Combine multiple images into one PDF. No sign up required.",
  alternates: { canonical: "https://pdf24x.com/tools/image-to-pdf" },
};

export default function Page() {
  return <ImageToPdfClient />;
}
