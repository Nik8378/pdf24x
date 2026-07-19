import type { Metadata } from "next";
import { ToolJsonLd } from "@/components/seo/ToolJsonLd";
import ISBNConverterClient from "./ISBNConverterClient";

export const metadata: Metadata = {
  title: "ISBN Converter – Convert ISBN-10 to ISBN-13 & ISBN-13 to ISBN-10 Free",
  description:
    "Free online ISBN converter. Auto-detect and convert ISBN-10 to ISBN-13 or ISBN-13 to ISBN-10 instantly. Validate ISBN check digits, bulk convert multiple ISBNs. No sign-up required.",
  keywords: [
    "isbn converter",
    "isbn 10 to isbn 13",
    "isbn 13 to isbn 10",
    "isbn validator",
    "convert isbn",
    "isbn check digit calculator",
    "isbn 10 converter",
    "isbn 13 converter",
    "isbn format converter",
    "book isbn converter",
    "isbn online tool",
    "free isbn converter",
  ],
  alternates: { canonical: "https://pdf24x.com/tools/isbn-converter" },
  openGraph: {
    title: "ISBN Converter – ISBN-10 ↔ ISBN-13 Free Online Tool | PDF24x",
    description:
      "Auto-detect and convert between ISBN-10 and ISBN-13 instantly. Free, no upload, no sign-up.",
    url: "https://pdf24x.com/tools/isbn-converter",
  },
};

export default function Page() { return <ISBNConverterClient />; }
