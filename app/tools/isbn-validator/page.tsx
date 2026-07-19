import type { Metadata } from "next";
import { ToolJsonLd } from "@/components/seo/ToolJsonLd";
export const metadata: Metadata = {
  title: "ISBN Validator – Check ISBN-10 & ISBN-13 Online Free",
  description: "Validate ISBN-10 and ISBN-13 online for free. Check digit verification, format detection, country identification. 100% private — runs in your browser.",
  alternates: { canonical: "https://pdf24x.com/tools/isbn-validator" },
};
import ISBNValidatorClient from "./ISBNValidatorClient";
export default function Page() { return <ISBNValidatorClient />; }
