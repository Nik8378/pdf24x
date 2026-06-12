import type { Metadata } from "next";
import RegexTesterClient from "./RegexTesterClient";
export const metadata: Metadata = {
  title: "Regex Tester – Free Online Regular Expression Tester",
  description: "Test regular expressions with live match highlighting. See all matches, groups, and indexes. Common regex patterns included. Free regex tester online.",
  keywords: ["regex tester","regular expression tester","regex online","test regex","regex validator","regex checker","regex matcher","online regex","regex pattern tester"],
  alternates: { canonical: "https://pdf24x.com/tools/regex-tester" },
  openGraph: { title: "Regex Tester – Free Online Regular Expression Tool | PDF24x", description: "Test regex patterns with live highlighting. Free, no sign-up.", url: "https://pdf24x.com/tools/regex-tester" },
};
export default function Page() { return <RegexTesterClient />; }
