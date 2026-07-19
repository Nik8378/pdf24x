import type { Metadata } from "next";
import { ToolJsonLd } from "@/components/seo/ToolJsonLd";
import CSSMinifierClient from "./CSSMinifierClient";
export const metadata: Metadata = {
  title: "CSS Minifier & Formatter – Free Online CSS Compressor",
  description: "Minify CSS to reduce file size or format CSS for readability. Removes comments, whitespace, redundant characters. Free CSS minifier online.",
  keywords: ["css minifier","css formatter","css beautifier","minify css","compress css","css minify online","css pretty print","css compressor"],
  alternates: { canonical: "https://pdf24x.com/tools/css-minifier" },
  openGraph: { title: "CSS Minifier & Formatter – Free Online Tool | PDF24x", description: "Minify or format CSS instantly. Free, no sign-up.", url: "https://pdf24x.com/tools/css-minifier" },
};
export default function Page() { return <CSSMinifierClient />; }
