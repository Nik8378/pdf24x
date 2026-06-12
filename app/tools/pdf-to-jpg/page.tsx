import type { Metadata } from "next";
import PdfToJpgClient from "./PdfToJpgClient";

export const metadata: Metadata = {
  title: "PDF to JPG Converter – Free, No Upload",
  description:
    "Convert PDF pages to high-quality JPG images for free. Choose resolution (72–300 DPI), page range, and color mode. 100% browser-based — files never leave your device.",
  keywords: ["pdf to jpg", "pdf to image", "convert pdf to jpeg", "pdf to png", "extract images from pdf"],
  alternates: { canonical: "https://pdf24x.com/tools/pdf-to-jpg" },
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert PDF to JPG for free",
  description: "Turn PDF pages into high-quality JPG images in your browser.",
  totalTime: "PT1M",
  estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
  step: [
    { "@type": "HowToStep", position: 1, name: "Upload your PDF", text: "Drag and drop your PDF file onto the converter." },
    { "@type": "HowToStep", position: 2, name: "Set options", text: "Choose resolution (DPI), page range, and colour mode." },
    { "@type": "HowToStep", position: 3, name: "Download your JPG images", text: "Click Convert. Each PDF page downloads as a separate JPG." },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What resolution should I use when converting PDF to JPG?",
      acceptedAnswer: { "@type": "Answer", text: "72 DPI is fine for screen viewing. 150 DPI is good for general use. 300 DPI gives print-quality output and larger file sizes." },
    },
    {
      "@type": "Question",
      name: "Can I convert just specific pages of a PDF to JPG?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Enter a page range (e.g. 1-3 or 2,5,7) to convert only those pages." },
    },
    {
      "@type": "Question",
      name: "Is my PDF uploaded when converting to JPG?",
      acceptedAnswer: { "@type": "Answer", text: "No. Everything runs in your browser. Your PDF never leaves your device." },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PdfToJpgClient />
    </>
  );
}
