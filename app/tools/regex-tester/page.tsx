import type { Metadata } from "next";
import RegexTesterClient from "./RegexTesterClient";
export const metadata: Metadata = {
  title: "Regex Tester – Free Online Regular Expression Tester",
  description: "Test regular expressions with live match highlighting. See all matches, groups, and indexes. Common regex patterns included. Free regex tester online.",
  keywords: ["regex tester","regular expression tester","regex online","test regex","regex validator","regex checker","regex matcher","online regex","regex pattern tester"],
  alternates: { canonical: "https://pdf24x.com/tools/regex-tester" },
  openGraph: { title: "Regex Tester – Free Online Regular Expression Tool | PDF24x", description: "Test regex patterns with live highlighting. Free, no sign-up.", url: "https://pdf24x.com/tools/regex-tester" },
};
export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What regex flavour does this tester use?", "acceptedAnswer": {"@type": "Answer", "text": "It uses JavaScript's built-in RegExp engine, which supports most standard regex syntax including lookaheads, named groups, and Unicode properties (ES2018+)."}}, {"@type": "Question", "name": "Can I test global and multiline flags?", "acceptedAnswer": {"@type": "Answer", "text": "Yes. You can enable g, m, i, s, and u flags individually. Matches update in real time as you type."}}, {"@type": "Question", "name": "Is my text or regex pattern sent anywhere?", "acceptedAnswer": {"@type": "Answer", "text": "No. Everything runs in your browser. Your patterns and test text are completely private."}}]}) }} />
      <RegexTesterClient />
    </>
  );
}
