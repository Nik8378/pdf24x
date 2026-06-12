import type { Metadata } from "next";
import CompressClient from "./CompressClient";

export const metadata: Metadata = {
  title: "Compress PDF – Reduce File Size Free",
  description:
    "Reduce PDF file size online for free. Choose from medium, strong or extreme compression. 100% browser-based — your PDF is never uploaded to any server.",
  keywords: ["compress pdf", "reduce pdf size", "pdf compressor", "shrink pdf", "pdf size reducer free"],
  alternates: { canonical: "https://pdf24x.com/tools/compress" },
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to compress a PDF for free",
  description: "Reduce PDF file size instantly in your browser. No upload required.",
  totalTime: "PT1M",
  estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
  step: [
    { "@type": "HowToStep", position: 1, name: "Upload your PDF", text: "Drag and drop your PDF file or click to browse." },
    { "@type": "HowToStep", position: 2, name: "Choose compression level", text: "Select medium, strong, or extreme compression depending on your file size needs." },
    { "@type": "HowToStep", position: 3, name: "Download compressed PDF", text: "Click Compress. Your smaller PDF downloads instantly — nothing is uploaded." },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much can I reduce a PDF file size?",
      acceptedAnswer: { "@type": "Answer", text: "Results vary by content. Image-heavy PDFs can often be reduced by 50–80%. Text-only PDFs compress less. The extreme setting prioritises smallest size; medium balances quality and size." },
    },
    {
      "@type": "Question",
      name: "Will compressing a PDF affect quality?",
      acceptedAnswer: { "@type": "Answer", text: "Medium compression keeps quality visually identical for most use cases. Strong and extreme compression may reduce image sharpness slightly." },
    },
    {
      "@type": "Question",
      name: "Is my PDF uploaded when I compress it?",
      acceptedAnswer: { "@type": "Answer", text: "No. All compression happens in your browser. Your PDF never leaves your device." },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <CompressClient />
    </>
  );
}
