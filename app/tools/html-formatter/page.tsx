import type { Metadata } from "next";
import HTMLFormatterClient from "./HTMLFormatterClient";
export const metadata: Metadata = {
  title: "HTML Formatter & Minifier – Free Online HTML Beautifier",
  description: "Format, beautify or minify HTML code online. Clean indentation, remove whitespace, format tags. Free HTML formatter with instant preview.",
  keywords: ["html formatter","html beautifier","html minifier","format html online","beautify html","html pretty print","html code formatter","minify html"],
  alternates: { canonical: "https://pdf24x.com/tools/html-formatter" },
  openGraph: { title: "HTML Formatter & Minifier – Free Online Tool | PDF24x", description: "Format or minify HTML instantly. Free, no sign-up.", url: "https://pdf24x.com/tools/html-formatter" },
};
export default function Page() { return <HTMLFormatterClient />; }
