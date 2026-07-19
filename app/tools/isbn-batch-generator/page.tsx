import type { Metadata } from "next";
import { ToolJsonLd } from "@/components/seo/ToolJsonLd";
export const metadata: Metadata = {
  title: "ISBN Batch Generator – Internal IDs Free Online",
  description: "Generate batches of internal 13-digit codes with valid ISBN check digits. For testing, mock data, or private numbering. 100% private.",
  alternates: { canonical: "https://pdf24x.com/tools/isbn-batch-generator" },
};
import ISBNBatchGeneratorClient from "./ISBNBatchGeneratorClient";
export default function Page() { return <ISBNBatchGeneratorClient />; }
