import type { Metadata } from "next";
import { ToolJsonLd } from "@/components/seo/ToolJsonLd";
import ExcelToPdfClient from "./ExcelToPdfClient";
export const metadata: Metadata = {
  title: "Excel to PDF Converter – Free Online XLSX to PDF Tool",
  description: "Convert Excel spreadsheets to PDF online free. Supports .xlsx, .xls and .csv files. Preserves table structure, headers and formatting. No upload, no sign-up.",
  keywords: ["excel to pdf","xlsx to pdf","xls to pdf","csv to pdf","spreadsheet to pdf","convert excel to pdf","excel to pdf free","online excel to pdf"],
  alternates: { canonical: "https://pdf24x.com/tools/excel-to-pdf" },
  openGraph: { title: "Excel to PDF Converter – Free Online Tool | PDF24x", description: "Convert Excel to PDF instantly. Free, no sign-up, browser-based.", url: "https://pdf24x.com/tools/excel-to-pdf" },
};
export default function Page() { return <ExcelToPdfClient />; }
