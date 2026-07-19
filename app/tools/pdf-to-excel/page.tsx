import type { Metadata } from "next";
import { ToolJsonLd } from "@/components/seo/ToolJsonLd";
import PDFToExcelClient from "./PDFToExcelClient";
export const metadata: Metadata = {
  title: "PDF to Excel Converter – Extract Tables from PDF Free",
  description: "Extract tables and data from PDF files into Excel spreadsheets. Free PDF to Excel converter — works in your browser, no upload required. Download as .xlsx instantly.",
  keywords: ["pdf to excel","pdf to xlsx","extract table from pdf","pdf data extractor","pdf to spreadsheet","convert pdf to excel","pdf table extractor","pdf to excel free"],
  alternates: { canonical: "https://pdf24x.com/tools/pdf-to-excel" },
  openGraph: { title: "PDF to Excel Converter – Extract Tables Free | PDF24x", description: "Extract tables from PDF to Excel. Free, browser-based, no sign-up.", url: "https://pdf24x.com/tools/pdf-to-excel" },
};
export default function Page() { return <PDFToExcelClient />; }
