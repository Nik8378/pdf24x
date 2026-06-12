import type { Metadata } from "next";
import PDFToExcelClient from "./PDFToExcelClient";

export const metadata: Metadata = {
  title: "PDF to Excel Converter – Free, No Upload",
  description:
    "Extract tables from PDF and convert to Excel (XLSX) or CSV for free. 100% browser-based — files never leave your device.",
  keywords: ["pdf to excel", "pdf to xlsx", "extract table from pdf", "pdf to csv", "convert pdf to spreadsheet"],
  alternates: { canonical: "https://pdf24x.com/tools/pdf-to-excel" },
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert PDF to Excel for free",
  description: "Extract data tables from PDFs into Excel spreadsheets in your browser.",
  totalTime: "PT1M",
  estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
  step: [
    { "@type": "HowToStep", position: 1, name: "Upload your PDF", text: "Drag and drop a PDF containing tables or data." },
    { "@type": "HowToStep", position: 2, name: "Choose output format", text: "Select XLSX or CSV as your target format." },
    { "@type": "HowToStep", position: 3, name: "Download your spreadsheet", text: "Click Convert and download the Excel file instantly." },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can I convert any PDF to Excel?",
      acceptedAnswer: { "@type": "Answer", text: "PDFs with selectable text and structured tables work best. Scanned PDFs without a text layer may not extract correctly." },
    },
    {
      "@type": "Question",
      name: "Is my PDF uploaded when converting to Excel?",
      acceptedAnswer: { "@type": "Answer", text: "No. All processing happens in your browser. Nothing is sent to any server." },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PDFToExcelClient />
    </>
  );
}
