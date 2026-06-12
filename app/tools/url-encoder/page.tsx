import type { Metadata } from "next";
import URLEncoderClient from "./URLEncoderClient";

export const metadata: Metadata = {
  title: "URL Encoder / Decoder – Free Online",
  description:
    "Encode and decode URLs and query strings instantly in your browser. Percent-encode special characters or decode encoded URLs for free.",
  keywords: ["url encoder", "url decoder", "percent encode url", "urlencode online", "decode url online"],
  alternates: { canonical: "https://pdf24x.com/tools/url-encoder" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is URL encoding?",
      acceptedAnswer: { "@type": "Answer", text: "URL encoding (percent encoding) replaces special characters in a URL with a % followed by two hex digits. This ensures characters like spaces, &, =, and # are transmitted safely in web requests." },
    },
    {
      "@type": "Question",
      name: "When do I need to URL encode a string?",
      acceptedAnswer: { "@type": "Answer", text: "Whenever you include user input in a URL query parameter, embed a URL inside another URL, or build API requests with special characters in values." },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <URLEncoderClient />
    </>
  );
}
