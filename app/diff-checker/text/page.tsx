import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Text Diff Checker – Compare Text Online Free",
  description:
    "Compare two texts online and find every difference instantly. Side-by-side and inline views, word or character highlighting, ignore case/whitespace options, and downloadable diff reports. 100% private — nothing is uploaded.",
  alternates: { canonical: "https://pdf24x.com/diff-checker/text" },
};
import TextDiffClient from "./TextDiffClient";
export default function Page() { return <TextDiffClient />; }
