import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "ISBN Barcode Reader – Scan ISBN Barcodes Free",
  description: "Scan ISBN barcodes from your camera or from photos online. Detects EAN-13 / ISBN. 100% private — nothing leaves your device.",
  alternates: { canonical: "https://pdf24x.com/tools/isbn-barcode-reader" },
};
import ISBNBarcodeReaderClient from "./ISBNBarcodeReaderClient";
export default function Page() { return <ISBNBarcodeReaderClient />; }
