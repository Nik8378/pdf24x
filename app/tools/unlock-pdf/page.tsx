import type { Metadata } from "next";
import UnlockPdfClient from "./UnlockPdfClient";
export const metadata: Metadata = {
  title: "Unlock PDF | PDF24X",
  description: "Remove password protection from PDF files online for free. Unlock secured PDFs instantly.",
  alternates: { canonical: "https://pdf24x.com/tools/unlock-pdf" },
};
export default function Page() { return <UnlockPdfClient />; }
