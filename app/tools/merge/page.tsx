import type { Metadata } from "next";
import { ToolJsonLd } from "@/components/seo/ToolJsonLd";
export const metadata: Metadata = {
  title: "Merge PDF – Combine PDF Files Free",
  description:
    "Combine multiple PDF files into one. Drag to reorder, add blank pages between sections, and download instantly. 100% browser-based — files never leave your device.",
  alternates: { canonical: "https://pdf24x.com/tools/merge" },
};
import MergeClient from "./MergeClient";
export default function Page() { return <MergeClient />; }
