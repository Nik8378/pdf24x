import type { Metadata } from "next";
import SplitClient from "./SplitClient";

export const metadata: Metadata = {
  title: "Split PDF – Extract Pages Free",
  description:
    "Split a PDF into multiple files, extract specific pages, or separate every page. Free and 100% browser-based — files are never uploaded to any server.",
  keywords: ["split pdf", "extract pdf pages", "pdf splitter", "separate pdf pages", "pdf page extractor"],
  alternates: { canonical: "https://pdf24x.com/tools/split" },
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to split a PDF for free",
  description: "Extract pages or split a PDF into multiple files in your browser.",
  totalTime: "PT1M",
  estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
  step: [
    { "@type": "HowToStep", position: 1, name: "Upload your PDF", text: "Drag and drop your PDF or click to browse." },
    { "@type": "HowToStep", position: 2, name: "Choose pages to extract", text: "Select specific page ranges or split every page into its own file." },
    { "@type": "HowToStep", position: 3, name: "Download split files", text: "Click Split and download your files instantly." },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can I extract just one page from a PDF?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Enter a single page number to extract just that page as its own PDF file." },
    },
    {
      "@type": "Question",
      name: "Is there a page limit when splitting PDFs?",
      acceptedAnswer: { "@type": "Answer", text: "No hard limit. Performance depends on the file size and your device's memory." },
    },
    {
      "@type": "Question",
      name: "Are my PDFs uploaded when I split them?",
      acceptedAnswer: { "@type": "Answer", text: "No. All processing is done locally in your browser. Nothing is sent to any server." },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SplitClient />
    </>
  );
}
