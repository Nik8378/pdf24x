import type { Metadata } from "next";
import ImageToWebpClient from "./ImageToWebpClient";

export const metadata: Metadata = {
  title: "Image to WebP Converter – Free, No Upload",
  description:
    "Convert JPG, PNG, and BMP images to WebP format for free. Reduce image file size by up to 30% with no quality loss. 100% browser-based.",
  keywords: ["image to webp", "jpg to webp", "png to webp", "convert to webp", "webp converter free"],
  alternates: { canonical: "https://pdf24x.com/tools/image-to-webp" },
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert images to WebP for free",
  description: "Convert JPG or PNG to WebP format to reduce file size for web use.",
  totalTime: "PT30S",
  estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
  step: [
    { "@type": "HowToStep", position: 1, name: "Upload your image", text: "Drag and drop a JPG, PNG, or BMP image." },
    { "@type": "HowToStep", position: 2, name: "Set quality", text: "Adjust the WebP quality slider to balance size and sharpness." },
    { "@type": "HowToStep", position: 3, name: "Download WebP", text: "Click Convert and download your smaller WebP file instantly." },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Why should I convert images to WebP?",
      acceptedAnswer: { "@type": "Answer", text: "WebP images are typically 25–35% smaller than equivalent JPG or PNG files, which makes websites load faster. All modern browsers support WebP." },
    },
    {
      "@type": "Question",
      name: "Does converting to WebP reduce image quality?",
      acceptedAnswer: { "@type": "Answer", text: "At quality 80–90, WebP looks virtually identical to the original. You can choose lossless mode for pixel-perfect output at slightly larger file sizes." },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ImageToWebpClient />
    </>
  );
}
