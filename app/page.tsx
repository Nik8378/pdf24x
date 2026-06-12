import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Image to PDF Converter – Free, No Upload",
  description:
    "Convert JPG, PNG, WEBP and BMP images to PDF instantly in your browser. Free, private — files are never uploaded to any server. Supports multiple images, drag & drop, rotation and page settings.",
  keywords: [
    "image to pdf",
    "jpg to pdf",
    "png to pdf",
    "webp to pdf",
    "convert image to pdf",
    "free image to pdf converter",
    "online pdf maker",
    "no upload pdf converter",
    "browser pdf converter",
    "multiple images to pdf",
  ],
  alternates: { canonical: "https://pdf24x.com" },
  openGraph: {
    title: "Image to PDF Converter – Free, No Upload | PDF24x",
    description:
      "Convert JPG, PNG, WEBP images to PDF for free. 100% browser-based — your files never leave your device.",
    url: "https://pdf24x.com",
    images: [
      {
        url: "https://pdf24x.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "PDF24x – Free Image to PDF Converter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Image to PDF Converter – Free, No Upload | PDF24x",
    description:
      "Convert JPG, PNG, WEBP images to PDF for free. 100% browser-based — your files never leave your device.",
    images: ["https://pdf24x.com/og-image.png"],
  },
};

// ─── Page-specific JSON-LD ────────────────────────────────────────────────────

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert images to PDF for free",
  description:
    "Convert JPG, PNG, WEBP, or BMP images into a PDF file instantly in your browser — no uploads, no account required.",
  totalTime: "PT1M",
  estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
  tool: [
    {
      "@type": "HowToTool",
      name: "PDF24x Image to PDF Converter",
      url: "https://pdf24x.com",
    },
  ],
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Upload your images",
      text: "Drag and drop your JPG, PNG, WEBP, or BMP images onto the upload zone, click to browse files, or paste an image from your clipboard.",
      url: "https://pdf24x.com#upload",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Arrange and configure",
      text: "Reorder pages by dragging, rotate images, choose page size (A4, Letter, Legal), set margins, and pick image quality.",
      url: "https://pdf24x.com#settings",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Download your PDF",
      text: "Click the Convert button. Your PDF is created instantly in your browser and downloads automatically — nothing is uploaded to any server.",
      url: "https://pdf24x.com#convert",
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Does converting images to PDF reduce quality?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. PDF24x uses your image at its original resolution by default. Only if you choose 'Balanced' or 'Smallest' quality is any compression applied.",
      },
    },
    {
      "@type": "Question",
      name: "Are my files uploaded to a server when converting to PDF?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Never. All processing happens entirely in your browser using JavaScript. Your files never leave your device — there is no server involved.",
      },
    },
    {
      "@type": "Question",
      name: "How many images can I convert to PDF at once?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "There is no hard limit. You can add as many images as you like. Performance depends on your device's available memory.",
      },
    },
    {
      "@type": "Question",
      name: "Which image formats can I convert to PDF?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "JPG, JPEG, PNG, WEBP, and BMP are all supported.",
      },
    },
    {
      "@type": "Question",
      name: "Can I reorder pages before converting images to PDF?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Drag and drop any image in the list to change its order. The PDF pages will follow the order you set.",
      },
    },
    {
      "@type": "Question",
      name: "Does the image to PDF converter work on mobile?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. PDF24x is fully responsive and works on phones, tablets, and desktops.",
      },
    },
    {
      "@type": "Question",
      name: "Is the image to PDF converter really free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, completely free. No account needed, no watermarks, no restrictions — ever.",
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomeClient />
    </>
  );
}
