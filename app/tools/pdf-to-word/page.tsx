import type { Metadata } from "next";
import PdfToWordClient from "./PdfToWordClient";

export const metadata: Metadata = {
  title: "PDF to Word Converter | PDF24X",
  description: "Convert PDF files to editable Word documents (.docx) online for free. Preserves text, formatting, and layout.",
  alternates: { canonical: "https://pdf24x.com/tools/pdf-to-word" },
};

export default function Page() {
  return <PdfToWordClient />;
}
