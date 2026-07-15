import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://pdf24x.com";
  const now = new Date();
  const stable = new Date("2026-07-12");
  return [
    { url: base,                                    lastModified: now, changeFrequency: "daily",  priority: 1.0 },
    { url: `${base}/tools`,                         lastModified: stable, changeFrequency: "weekly", priority: 0.95 },

    // New tools
    { url: `${base}/tools/image-to-pdf`,            lastModified: stable, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/diff-checker`,                  lastModified: stable, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/diff-checker/text`,             lastModified: stable, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tools/rotate-pdf`,              lastModified: stable, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/tools/unlock-pdf`,              lastModified: stable, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/tools/watermark-pdf`,           lastModified: stable, changeFrequency: "weekly", priority: 0.85 },
    // PDF Tools
    { url: `${base}/tools/compress`,                lastModified: stable, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tools/merge`,                   lastModified: stable, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tools/split`,                   lastModified: stable, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tools/pdf-to-jpg`,              lastModified: stable, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tools/excel-to-pdf`,            lastModified: stable, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tools/pdf-to-excel`,            lastModified: stable, changeFrequency: "weekly", priority: 0.9 },

    // Image Tools
    { url: `${base}/tools/image-to-webp`,           lastModified: stable, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tools/image-to-favicon`,        lastModified: stable, changeFrequency: "weekly", priority: 0.85 },

    // Book & ISBN
    { url: `${base}/tools/isbn-converter`,          lastModified: stable, changeFrequency: "weekly", priority: 0.85 },

    // Developer Tools
    { url: `${base}/tools/json-formatter`,          lastModified: stable, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tools/base64-encoder`,          lastModified: stable, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tools/url-encoder`,             lastModified: stable, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tools/html-formatter`,          lastModified: stable, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/tools/css-minifier`,            lastModified: stable, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/tools/regex-tester`,            lastModified: stable, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/tools/jwt-decoder`,             lastModified: stable, changeFrequency: "weekly", priority: 0.85 },

    // Pages
    { url: `${base}/about`,                         lastModified: stable, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`,                       lastModified: stable, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy-policy`,                lastModified: stable, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/terms-of-use`,                  lastModified: stable, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/disclaimer`,                     lastModified: stable, changeFrequency: "monthly", priority: 0.3 },

    // Blog
    { url: `${base}/blog`,                                                        lastModified: now, changeFrequency: "weekly",  priority: 0.75 },
    { url: `${base}/blog/how-to-convert-jpg-png-to-pdf-free`,                     lastModified: stable, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/how-to-compress-pdf-without-losing-quality`,             lastModified: stable, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/how-to-merge-split-pdf-free`,                            lastModified: stable, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/best-free-pdf-tools-2025`,                               lastModified: stable, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/why-your-files-should-never-leave-your-browser`,         lastModified: stable, changeFrequency: "monthly", priority: 0.65 },
    { url: `${base}/blog/pdf-tools-for-students-freelancers-small-business`,      lastModified: stable, changeFrequency: "monthly", priority: 0.65 },
    { url: `${base}/blog/how-to-protect-pdf-with-password`,                          lastModified: stable, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/pdf-vs-word-which-format-to-use`,                           lastModified: stable, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/how-to-reduce-pdf-file-size-email`,                         lastModified: stable, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/free-tools-for-working-from-home`,                          lastModified: stable, changeFrequency: "monthly", priority: 0.7 },
  ];
}
