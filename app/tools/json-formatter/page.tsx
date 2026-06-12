import type { Metadata } from "next";
import JSONFormatterClient from "./JSONFormatterClient";

export const metadata: Metadata = {
  title: "JSON Formatter & Validator – Free Online",
  description:
    "Format, validate, and beautify JSON instantly in your browser. Minify JSON, fix syntax errors, and view as a tree. Free, no data sent to any server.",
  keywords: ["json formatter", "json validator", "json beautifier", "format json online", "json pretty print", "json minifier"],
  alternates: { canonical: "https://pdf24x.com/tools/json-formatter" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What does a JSON formatter do?",
      acceptedAnswer: { "@type": "Answer", text: "A JSON formatter takes minified or poorly indented JSON text and reformats it with proper indentation and line breaks, making it easy to read and debug." },
    },
    {
      "@type": "Question",
      name: "Is this JSON formatter safe to use with sensitive data?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. All formatting happens in your browser. Your JSON is never sent to any server, making it safe for API responses, config files, and tokens." },
    },
    {
      "@type": "Question",
      name: "Can the JSON formatter fix syntax errors?",
      acceptedAnswer: { "@type": "Answer", text: "It validates your JSON and highlights the line and character position of any syntax error so you can fix it quickly." },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <JSONFormatterClient />
    </>
  );
}
