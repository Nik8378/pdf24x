import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/home",
          "/tools/ai",
          "/tools/ocr",
          "/tools/pdf-to-word",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/home",
          "/tools/ai",
          "/tools/ocr",
          "/tools/pdf-to-word",
        ],
      },
    ],
    sitemap: "https://pdf24x.com/sitemap.xml",
    host: "https://pdf24x.com",
  };
}