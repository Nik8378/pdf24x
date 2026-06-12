import type { Metadata } from "next";
import ISBNConverterClient from "./ISBNConverterClient";

export const metadata: Metadata = {
  title: "ISBN Converter – Convert ISBN-10 to ISBN-13 & ISBN-13 to ISBN-10 Free",
  description:
    "Free online ISBN converter. Auto-detect and convert ISBN-10 to ISBN-13 or ISBN-13 to ISBN-10 instantly. Validate ISBN check digits, bulk convert multiple ISBNs. No sign-up required.",
  keywords: [
    "isbn converter",
    "isbn 10 to isbn 13",
    "isbn 13 to isbn 10",
    "isbn validator",
    "convert isbn",
    "isbn check digit calculator",
    "isbn 10 converter",
    "isbn 13 converter",
    "isbn format converter",
    "book isbn converter",
    "isbn online tool",
    "free isbn converter",
  ],
  alternates: { canonical: "https://pdf24x.com/tools/isbn-converter" },
  openGraph: {
    title: "ISBN Converter – ISBN-10 ↔ ISBN-13 Free Online Tool | PDF24x",
    description:
      "Auto-detect and convert between ISBN-10 and ISBN-13 instantly. Free, no upload, no sign-up.",
    url: "https://pdf24x.com/tools/isbn-converter",
  },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What is the difference between ISBN-10 and ISBN-13?", "acceptedAnswer": {"@type": "Answer", "text": "ISBN-10 is the older 10-digit format used before 2007. ISBN-13 is the current standard and starts with 978 or 979. Both identify the same books."}}, {"@type": "Question", "name": "How does the ISBN check digit work?", "acceptedAnswer": {"@type": "Answer", "text": "Each ISBN format uses a weighted modulo calculation to produce a check digit that validates the ISBN. This tool calculates and verifies it automatically."}}, {"@type": "Question", "name": "Can I convert multiple ISBNs at once?", "acceptedAnswer": {"@type": "Answer", "text": "Yes. Paste a list of ISBNs, one per line, to convert them all in bulk."}}]}) }} />
      <ISBNConverterClient />
    </>
  );
}
