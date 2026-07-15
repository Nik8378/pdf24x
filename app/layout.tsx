import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Inter, Archivo } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-archivo", display: "swap" });
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "PDF24x – Free PDF & Developer Tools Online",
    template: "%s | PDF24x",
  },
  description:
    "Free online tools: PDF converter, JSON formatter, Base64 encoder, URL encoder, HTML formatter, CSS minifier, Regex tester, JWT decoder and more. 100% private — files processed in your browser, never uploaded.",
  keywords: [
    "image to pdf", "jpg to pdf", "png to pdf", "compress pdf", "merge pdf",
    "split pdf", "pdf to jpg", "free pdf tools", "online pdf converter",
    "json formatter", "base64 encoder", "url encoder", "html formatter",
    "css minifier", "regex tester", "jwt decoder", "developer tools online",
    "pdf tools free online", "browser based tools",
  ],
  metadataBase: new URL("https://pdf24x.com"),
  openGraph: {
    title: "PDF24x – Free PDF & Developer Tools Online",
    description:
      "PDF tools + developer utilities. JSON formatter, Base64, URL encoder, HTML formatter, CSS minifier, Regex tester, JWT decoder. 100% private.",
    type: "website",
    url: "https://pdf24x.com",
    siteName: "PDF24x",
    locale: "en_US",
    images: [{ url: "https://pdf24x.com/og-image.png", width: 1200, height: 630, alt: "PDF24x – Free PDF & Developer Tools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF24x – Free PDF & Developer Tools Online",
    description: "PDF tools + developer utilities. 100% private — files never leave your browser.",
    images: ["https://pdf24x.com/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: "https://pdf24x.com" },
  verification: {
    google: "0dZ1dxD_82F4cyKndYaGDtmCs7Z-SrHUFU0gbC3VBuw",
  },
};

// ─── Site-wide JSON-LD schemas ────────────────────────────────────────────────

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PDF24x",
  url: "https://pdf24x.com",
  logo: "https://pdf24x.com/logo.png",
  description:
    "Free, privacy-first online tools for PDF conversion, image conversion, and developer utilities. All processing happens in your browser — files are never uploaded.",
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    url: "https://pdf24x.com/contact",
    contactType: "customer support",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "PDF24x",
  url: "https://pdf24x.com",
  description:
    "Free PDF and developer tools. Convert images to PDF, compress PDFs, merge, split, format JSON and more. 100% private — nothing is uploaded.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://pdf24x.com/tools?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDF24x",
  url: "https://pdf24x.com",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires a modern web browser with JavaScript enabled",
  description:
    "Free online PDF and developer tools — convert images to PDF, compress, merge, split PDFs, format JSON, encode Base64, decode JWT and more. 100% private, no file uploads.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Image to PDF conversion (JPG, PNG, WEBP, BMP)",
    "PDF compression",
    "PDF merge",
    "PDF split",
    "PDF to JPG",
    "Excel to PDF",
    "JSON formatter",
    "Base64 encoder/decoder",
    "URL encoder/decoder",
    "HTML formatter",
    "CSS minifier",
    "Regex tester",
    "JWT decoder",
  ],
  screenshot: "https://pdf24x.com/og-image.png",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "124",
    bestRating: "5",
    worstRating: "1",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${archivo.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="icon" href="/icon-192.png?v=2" type="image/png" sizes="192x192" />
        <link rel="icon" href="/icon-512.png?v=2" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Organization schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* WebSite schema with SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {/* SoftwareApplication schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
        />
      </head>
      <body>
        <ThemeProvider>
        <Navbar />
        {children}
        <MobileNav />
        <div className="pb-16 lg:pb-0" />
        <Footer />

        {/*
          Google AdSense — auto ads enabled.
          data-overlays-management="allow_all" prevents ads from covering the
          tool interface. Change to "exclude_zones" and add data-exclude-zones
          if you want finer control over which areas stay ad-free.
        */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3512613566035809"
          crossOrigin="anonymous"
          strategy="lazyOnload"
          data-overlays-management="allow_all"
        />
              <GoogleAnalytics gaId="G-0FB86D5DSY" />
              </ThemeProvider>
      </body>
    </html>
  );
}
