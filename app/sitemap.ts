import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://pdf24x.com";
  const now = new Date();
  return [
    { url: base,                                    lastModified: now, changeFrequency: "daily",  priority: 1.0 },
    { url: `${base}/tools`,                         lastModified: now, changeFrequency: "weekly", priority: 0.95 },

    // New tools
    { url: `${base}/tools/pdf-to-word`,             lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tools/image-to-pdf`,            lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tools/rotate-pdf`,              lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/tools/unlock-pdf`,              lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/tools/protect-pdf`,             lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/tools/watermark-pdf`,           lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    // PDF Tools
    { url: `${base}/tools/compress`,                lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tools/merge`,                   lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tools/split`,                   lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tools/pdf-to-jpg`,              lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tools/excel-to-pdf`,            lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tools/pdf-to-excel`,            lastModified: now, changeFrequency: "weekly", priority: 0.9 },

    // Image Tools
    { url: `${base}/tools/image-to-webp`,           lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tools/image-to-favicon`,        lastModified: now, changeFrequency: "weekly", priority: 0.85 },

    // Book & ISBN
    { url: `${base}/tools/isbn-converter`,          lastModified: now, changeFrequency: "weekly", priority: 0.85 },

    // Developer Tools
    { url: `${base}/tools/json-formatter`,          lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tools/base64-encoder`,          lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tools/url-encoder`,             lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tools/html-formatter`,          lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/tools/css-minifier`,            lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/tools/regex-tester`,            lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/tools/jwt-decoder`,             lastModified: now, changeFrequency: "weekly", priority: 0.85 },

    // Pages
    { url: `${base}/about`,                         lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`,                       lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy-policy`,                lastModified: now, changeFrequency: "monthly", priority: 0.4 },

    // Blog
    { url: `${base}/blog`,                                                        lastModified: now, changeFrequency: "weekly",  priority: 0.75 },
    { url: `${base}/blog/how-to-convert-jpg-png-to-pdf-free`,                     lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/how-to-compress-pdf-without-losing-quality`,             lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/how-to-merge-split-pdf-free`,                            lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/best-free-pdf-tools-2025`,                               lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/why-your-files-should-never-leave-your-browser`,         lastModified: now, changeFrequency: "monthly", priority: 0.65 },
    { url: `${base}/blog/pdf-tools-for-students-freelancers-small-business`,      lastModified: now, changeFrequency: "monthly", priority: 0.65 },
    { url: `${base}/blog/how-to-protect-pdf-with-password`,                          lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/pdf-vs-word-which-format-to-use`,                           lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/how-to-reduce-pdf-file-size-email`,                         lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/free-tools-for-working-from-home`,                          lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
}
