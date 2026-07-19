import type { Metadata } from "next";
import { ToolJsonLd } from "@/components/seo/ToolJsonLd";
import Base64Client from "./Base64Client";
export const metadata: Metadata = {
  title: "Base64 Encoder Decoder – Free Online Tool",
  description: "Encode text or images to Base64 or decode Base64 strings instantly. Free, browser-based Base64 encoder and decoder. No upload, no sign-up.",
  keywords: ["base64 encoder","base64 decoder","base64 encode","base64 decode","text to base64","image to base64","base64 converter","online base64"],
  alternates: { canonical: "https://pdf24x.com/tools/base64-encoder" },
  openGraph: { title: "Base64 Encoder Decoder – Free Online Tool | PDF24x", description: "Encode/decode text and images to Base64 instantly. Free, no sign-up.", url: "https://pdf24x.com/tools/base64-encoder" },
};
export default function Page() { return <Base64Client />; }
