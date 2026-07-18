import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Duplicate ISBN Finder – Find Repeated ISBNs Online Free",
  description: "Find duplicate ISBNs in a list. Normalizes ISBN-10 and ISBN-13 to catch cross-format duplicates. Export as CSV. 100% private — runs in your browser.",
  alternates: { canonical: "https://pdf24x.com/tools/duplicate-isbn-finder" },
};
import DuplicateISBNFinderClient from "./DuplicateISBNFinderClient";
export default function Page() { return <DuplicateISBNFinderClient />; }
