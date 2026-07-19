import type { Metadata } from "next";
import { ToolJsonLd } from "@/components/seo/ToolJsonLd";
export const metadata: Metadata = {
  title: "ISBN Range Checker – Verify ISBN Range Online Free",
  description: "Check whether an ISBN is within an assigned registration range. Verifies check digit + registration group. 100% private.",
  alternates: { canonical: "https://pdf24x.com/tools/isbn-range-checker" },
};
import ISBNRangeCheckerClient from "./ISBNRangeCheckerClient";
export default function Page() { return <ISBNRangeCheckerClient />; }
