import type { Metadata } from "next";
import { ToolJsonLd } from "@/components/seo/ToolJsonLd";
export const metadata: Metadata = {
  title: "Compress PDF – Reduce File Size Free",
  description:
    "Reduce PDF file size online for free. Choose from medium, strong or extreme compression. 100% browser-based — your PDF is never uploaded to any server.",
  alternates: { canonical: "https://pdf24x.com/tools/compress" },
};
import CompressClient from "./CompressClient";
export default function Page() { return <CompressClient />; }
