import type { Metadata } from "next";
import ExcelToPdfClient from "./ExcelToPdfClient";

export const metadata: Metadata = {
  title: "Excel to PDF Converter – Free, No Upload",
  description:
    "Convert Excel spreadsheets (XLSX, XLS, CSV) to PDF for free. 100% browser-based — your files are never uploaded to any server.",
  keywords: ["excel to pdf", "xlsx to pdf", "xls to pdf", "csv to pdf", "convert spreadsheet to pdf"],
  alternates: { canonical: "https://pdf24x.com/tools/excel-to-pdf" },
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert Excel to PDF for free",
  description: "Convert XLSX or CSV spreadsheets to PDF in your browser with no upload.",
  totalTime: "PT1M",
  estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
  step: [
    { "@type": "HowToStep", position: 1, name: "Upload your spreadsheet", text: "Drag and drop an XLSX, XLS, or CSV file." },
    { "@type": "HowToStep", position: 2, name: "Preview the output", text: "Review how the spreadsheet will appear as a PDF." },
    { "@type": "HowToStep", position: 3, name: "Download PDF", text: "Click Convert and download your PDF instantly." },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Which Excel formats can I convert to PDF?",
      acceptedAnswer: { "@type": "Answer", text: "XLSX, XLS, and CSV files are all supported." },
    },
    {
      "@type": "Question",
      name: "Are my Excel files uploaded when converting to PDF?",
      acceptedAnswer: { "@type": "Answer", text: "No. All conversion happens locally in your browser. Your files never leave your device." },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ExcelToPdfClient />
    </>
  );
}
