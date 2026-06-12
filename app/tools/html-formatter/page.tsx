import type { Metadata } from "next";
import HTMLFormatterClient from "./HTMLFormatterClient";
export const metadata: Metadata = {
  title: "HTML Formatter & Minifier – Free Online HTML Beautifier",
  description: "Format, beautify or minify HTML code online. Clean indentation, remove whitespace, format tags. Free HTML formatter with instant preview.",
  keywords: ["html formatter","html beautifier","html minifier","format html online","beautify html","html pretty print","html code formatter","minify html"],
  alternates: { canonical: "https://pdf24x.com/tools/html-formatter" },
  openGraph: { title: "HTML Formatter & Minifier – Free Online Tool | PDF24x", description: "Format or minify HTML instantly. Free, no sign-up.", url: "https://pdf24x.com/tools/html-formatter" },
};
export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does an HTML formatter do?", "acceptedAnswer": {"@type": "Answer", "text": "It takes minified or messy HTML and reformats it with consistent indentation and line breaks, making it easy to read and edit."}}, {"@type": "Question", "name": "Does the HTML formatter change my code's behaviour?", "acceptedAnswer": {"@type": "Answer", "text": "No. Formatting only changes whitespace and indentation \u2014 it has no effect on how the HTML renders in a browser."}}, {"@type": "Question", "name": "Is my HTML code sent to a server?", "acceptedAnswer": {"@type": "Answer", "text": "No. All formatting happens in your browser. Your code never leaves your device."}}]}) }} />
      <HTMLFormatterClient />
    </>
  );
}
