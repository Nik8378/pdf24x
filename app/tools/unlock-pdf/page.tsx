import type { Metadata } from "next";
import UnlockPdfClient from "./UnlockPdfClient";
export const metadata: Metadata = {
  title: "Unlock PDF | PDF24X",
  description: "Remove password protection from a PDF file online. You will need to know the current password to unlock it.",
  alternates: { canonical: "https://pdf24x.com/tools/unlock-pdf" },
};
export default function Page() { return <UnlockPdfClient />; }
