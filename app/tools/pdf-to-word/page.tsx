import type { Metadata } from "next";
import PdfToWordClient from "./PdfToWordClient";

export const metadata: Metadata = {
  title: "PDF to Word Converter | PDF24X",
  description: "Convert PDF files to editable Word documents (.docx) online for free. Coming soon.",
  alternates: { canonical: "https://pdf24x.com/tools/pdf-to-word" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <PdfToWordClient />;
}
