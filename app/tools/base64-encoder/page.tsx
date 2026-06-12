import type { Metadata } from "next";
import Base64Client from "./Base64Client";

export const metadata: Metadata = {
  title: "Base64 Encoder / Decoder – Free Online",
  description:
    "Encode text or files to Base64 and decode Base64 strings instantly in your browser. Free, private — nothing is uploaded.",
  keywords: ["base64 encoder", "base64 decoder", "encode base64", "decode base64 online", "base64 converter"],
  alternates: { canonical: "https://pdf24x.com/tools/base64-encoder" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Base64 encoding used for?",
      acceptedAnswer: { "@type": "Answer", text: "Base64 is used to encode binary data (like images or files) as plain text so it can be safely transmitted in JSON payloads, email attachments, data URIs, and HTTP headers." },
    },
    {
      "@type": "Question",
      name: "Is it safe to encode sensitive data with this Base64 tool?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. All encoding and decoding runs in your browser. No data is sent to any server." },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Base64Client />
    </>
  );
}
