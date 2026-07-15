import type { Metadata } from "next";
import ProtectPdfClient from "./ProtectPdfClient";
export const metadata: Metadata = {
  title: "Protect PDF | PDF24X",
  description: "Add password protection to PDF files online for free. Secure your PDFs with a password instantly.",
  alternates: { canonical: "https://pdf24x.com/tools/protect-pdf" },
  robots: { index: false, follow: true },
};
export default function Page() { return <ProtectPdfClient />; }
