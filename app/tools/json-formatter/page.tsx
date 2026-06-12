import type { Metadata } from "next";
import JSONFormatterClient from "./JSONFormatterClient";

export const metadata: Metadata = {
  title: "JSON Formatter & Validator – Free Online JSON Beautifier",
  description:
    "Format, beautify, minify and validate JSON online instantly. Free JSON formatter with syntax highlighting, error detection, tree view, and JSON path finder. No sign-up, no upload — works entirely in your browser.",
  keywords: [
    "json formatter",
    "json validator",
    "json beautifier",
    "json pretty print",
    "json minifier",
    "format json online",
    "validate json",
    "json viewer",
    "json editor online",
    "json parser",
    "json lint",
    "online json formatter",
    "json tree viewer",
    "json to string",
    "pretty print json",
    "json checker",
    "free json formatter",
  ],
  alternates: { canonical: "https://pdf24x.com/tools/json-formatter" },
  openGraph: {
    title: "JSON Formatter & Validator – Free Online JSON Beautifier | PDF24x",
    description:
      "Instantly format, validate and minify JSON. Syntax highlighting, error detection, tree view. 100% free, no sign-up.",
    url: "https://pdf24x.com/tools/json-formatter",
    images: [{ url: "https://pdf24x.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Formatter & Validator – Free Online Tool | PDF24x",
    description: "Format, validate and minify JSON instantly. Free, no sign-up required.",
    images: ["https://pdf24x.com/og-image.png"],
  },
};

export default function Page() { return <JSONFormatterClient />; }
