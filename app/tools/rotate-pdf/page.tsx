import type { Metadata } from "next";
import { ToolJsonLd } from "@/components/seo/ToolJsonLd";
import RotatePdfClient from "./RotatePdfClient";
export const metadata: Metadata = {
  title: "Rotate PDF | PDF24X",
  description: "Rotate PDF pages online for free. Rotate all pages or specific pages by 90, 180 or 270 degrees.",
  alternates: { canonical: "https://pdf24x.com/tools/rotate-pdf" },
};
export default function Page() { return <RotatePdfClient />; }
