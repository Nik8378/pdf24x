import type { Metadata } from "next";
import URLEncoderClient from "./URLEncoderClient";
export const metadata: Metadata = {
  title: "URL Encoder Decoder – Free Online URL Encoding Tool",
  description: "Encode or decode URLs and query strings instantly. Handles all special characters per RFC 3986. Free, browser-based URL encoder and decoder.",
  keywords: ["url encoder","url decoder","url encode","url decode","encode url online","decode url online","percent encoding","urlencode"],
  alternates: { canonical: "https://pdf24x.com/tools/url-encoder" },
  openGraph: { title: "URL Encoder Decoder – Free Online Tool | PDF24x", description: "Encode/decode URLs instantly. Free, no sign-up.", url: "https://pdf24x.com/tools/url-encoder" },
};
export default function Page() { return <URLEncoderClient />; }
