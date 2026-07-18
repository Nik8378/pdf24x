import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "ISBN Barcode Generator – EAN-13 Free Online",
  description: "Generate print-ready EAN-13 barcodes from any ISBN. Adjustable size, download as PNG or SVG. 100% private.",
  alternates: { canonical: "https://pdf24x.com/tools/isbn-barcode-generator" },
};
import ISBNBarcodeGeneratorClient from "./ISBNBarcodeGeneratorClient";
export default function Page() { return <ISBNBarcodeGeneratorClient />; }
