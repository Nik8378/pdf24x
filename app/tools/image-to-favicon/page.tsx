import type { Metadata } from "next";
import ImageToFaviconClient from "./ImageToFaviconClient";

export const metadata: Metadata = {
  title: "Image to Favicon Converter – Free ICO Generator Online",
  description:
    "Convert any image (PNG, JPG, SVG, WEBP) to favicon.ico instantly in your browser. Generate favicon in all sizes: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256. Free, no upload, no sign-up.",
  keywords: [
    "image to favicon",
    "favicon generator",
    "png to ico",
    "jpg to ico",
    "svg to favicon",
    "favicon converter",
    "ico generator",
    "favicon ico download",
    "create favicon online",
    "favicon maker",
    "free favicon generator",
    "favicon 16x16",
    "favicon 32x32",
    "website favicon",
  ],
  alternates: { canonical: "https://pdf24x.com/tools/image-to-favicon" },
  openGraph: {
    title: "Image to Favicon Converter – Free ICO Generator | PDF24x",
    description:
      "Convert PNG, JPG, SVG or any image to favicon.ico for free. All sizes included. 100% browser-based — files never leave your device.",
    url: "https://pdf24x.com/tools/image-to-favicon",
  },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What image formats can I convert to a favicon?", "acceptedAnswer": {"@type": "Answer", "text": "PNG, JPG, SVG, and WebP are all supported."}}, {"@type": "Question", "name": "Which favicon sizes are generated?", "acceptedAnswer": {"@type": "Answer", "text": "All standard sizes are included: 16\u00d716, 32\u00d732, 48\u00d748, 64\u00d764, 128\u00d7128, and 256\u00d7256, all packed into a single .ico file."}}, {"@type": "Question", "name": "Is my image uploaded when generating a favicon?", "acceptedAnswer": {"@type": "Answer", "text": "No. All conversion happens in your browser. Your image never leaves your device."}}]}) }} />
      <ImageToFaviconClient />
    </>
  );
}
