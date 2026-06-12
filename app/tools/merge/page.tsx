import type { Metadata } from "next";
import MergeClient from "./MergeClient";

export const metadata: Metadata = {
  title: "Merge PDF – Combine PDF Files Free",
  description:
    "Combine multiple PDF files into one. Drag to reorder, add blank pages between sections, and download instantly. 100% browser-based — files never leave your device.",
  keywords: ["merge pdf", "combine pdf", "join pdf files", "pdf merger free", "merge pdf online"],
  alternates: { canonical: "https://pdf24x.com/tools/merge" },
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to merge PDF files for free",
  description: "Combine multiple PDFs into one file in your browser. No upload, no account.",
  totalTime: "PT1M",
  estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
  step: [
    { "@type": "HowToStep", position: 1, name: "Upload your PDFs", text: "Drag and drop two or more PDF files onto the upload zone." },
    { "@type": "HowToStep", position: 2, name: "Reorder files", text: "Drag files into the order you want them to appear in the merged PDF." },
    { "@type": "HowToStep", position: 3, name: "Download merged PDF", text: "Click Merge. Your combined PDF downloads instantly." },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How many PDFs can I merge at once?",
      acceptedAnswer: { "@type": "Answer", text: "There is no hard limit. You can merge as many PDF files as your device's memory allows." },
    },
    {
      "@type": "Question",
      name: "Will merging PDFs change the content or quality?",
      acceptedAnswer: { "@type": "Answer", text: "No. Pages are combined exactly as-is. No recompression or quality loss occurs." },
    },
    {
      "@type": "Question",
      name: "Are my PDFs uploaded when merging?",
      acceptedAnswer: { "@type": "Answer", text: "No. Everything happens in your browser. Your files never leave your device." },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <MergeClient />
    </>
  );
}
