import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Code Summarizer – Minify & Shorten Code Free | PDF24X",
  description: "Paste or upload any code file. Get the same logic in fewer lines — same language, zero bugs. Powered by AI.",
  alternates: { canonical: "https://pdf24x.com/tools/code-summarizer" },
};
import CodeSummarizerClient from "./CodeSummarizerClient";
export default function Page() { return <CodeSummarizerClient />; }
