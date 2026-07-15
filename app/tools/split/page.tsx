import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Split PDF – Extract Pages Free",
  description:
    "Split a PDF into multiple files, extract specific pages, or separate every page. Free and 100% browser-based — files are never uploaded to any server.",
  alternates: { canonical: "https://pdf24x.com/tools/split" },
};
import SplitClient from "./SplitClient";
export default function Page() { return <SplitClient />; }
