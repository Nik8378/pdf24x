import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "ISBN Metadata Extractor – Free Book Info from ISBN",
  description: "Look up book title, author, publisher, cover image, and more from any ISBN. Uses Google Books and Open Library. Bulk supported, CSV export.",
  alternates: { canonical: "https://pdf24x.com/tools/isbn-metadata-extractor" },
};
import ISBNMetadataExtractorClient from "./ISBNMetadataExtractorClient";
export default function Page() { return <ISBNMetadataExtractorClient />; }
