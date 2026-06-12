import type { Metadata } from "next";
import CSSMinifierClient from "./CSSMinifierClient";
export const metadata: Metadata = {
  title: "CSS Minifier & Formatter – Free Online CSS Compressor",
  description: "Minify CSS to reduce file size or format CSS for readability. Removes comments, whitespace, redundant characters. Free CSS minifier online.",
  keywords: ["css minifier","css formatter","css beautifier","minify css","compress css","css minify online","css pretty print","css compressor"],
  alternates: { canonical: "https://pdf24x.com/tools/css-minifier" },
  openGraph: { title: "CSS Minifier & Formatter – Free Online Tool | PDF24x", description: "Minify or format CSS instantly. Free, no sign-up.", url: "https://pdf24x.com/tools/css-minifier" },
};
export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does a CSS minifier do?", "acceptedAnswer": {"@type": "Answer", "text": "A CSS minifier removes whitespace, comments, and redundant characters from your CSS to reduce file size, making pages load faster."}}, {"@type": "Question", "name": "How much smaller will my CSS be after minifying?", "acceptedAnswer": {"@type": "Answer", "text": "Typically 20\u201340% smaller for standard stylesheets. Highly commented or formatted files can shrink more."}}, {"@type": "Question", "name": "Is my CSS sent to a server when minifying?", "acceptedAnswer": {"@type": "Answer", "text": "No. All processing runs in your browser. Your CSS stays on your device."}}]}) }} />
      <CSSMinifierClient />
    </>
  );
}
