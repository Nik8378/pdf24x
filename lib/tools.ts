// Shared tool registry — single source of truth for all live tools.
// Used by Homepage search and All Tools search.
// Coming Soon tools are excluded.

export interface Tool {
  id: string;
  name: string;
  href: string;
  description: string;
  category: "PDF Tools" | "Image Tools" | "Developer Tools" | "Publisher Tools";
  keywords: string;
}

export const LIVE_TOOLS: Tool[] = [
  // PDF Tools
  { id: "compress_pdf", name: "Compress PDF", href: "/tools/compress", description: "Reduce PDF file size without losing quality", category: "PDF Tools", keywords: "compress reduce shrink smaller size email upload" },
  { id: "merge_pdf", name: "Merge PDF", href: "/tools/merge", description: "Combine multiple PDFs into one file", category: "PDF Tools", keywords: "merge combine join together add pages" },
  { id: "split_pdf", name: "Split PDF", href: "/tools/split", description: "Extract or split PDF pages easily", category: "PDF Tools", keywords: "split separate extract pages divide cut" },
  { id: "pdf_to_jpg", name: "PDF to JPG", href: "/tools/pdf-to-jpg", description: "Convert PDF pages to JPG images", category: "PDF Tools", keywords: "pdf to jpg jpeg image pages convert picture photo" },
  { id: "image_to_pdf", name: "Image to PDF", href: "/tools/image-to-pdf", description: "Convert JPG, PNG, WebP images to PDF", category: "PDF Tools", keywords: "image jpg jpeg png photo picture webp to pdf convert" },
  { id: "rotate_pdf", name: "Rotate PDF", href: "/tools/rotate-pdf", description: "Rotate PDF pages online", category: "PDF Tools", keywords: "rotate orientation sideways upside down flip fix" },
  { id: "watermark_pdf", name: "Watermark PDF", href: "/tools/watermark-pdf", description: "Add text watermark to PDF pages", category: "PDF Tools", keywords: "watermark stamp confidential draft text mark brand" },
  { id: "unlock_pdf", name: "Unlock PDF", href: "/tools/unlock-pdf", description: "Remove PDF password protection", category: "PDF Tools", keywords: "unlock password remove protected decrypt open" },
  { id: "excel_to_pdf", name: "Excel to PDF", href: "/tools/excel-to-pdf", description: "Convert Excel spreadsheets to PDF", category: "PDF Tools", keywords: "excel xlsx xls spreadsheet convert table" },
  { id: "pdf_to_excel", name: "PDF to Excel", href: "/tools/pdf-to-excel", description: "Extract tables from PDF to Excel", category: "PDF Tools", keywords: "pdf excel xlsx tables extract data" },
  // Image Tools
  { id: "image_to_webp", name: "Image to WebP", href: "/tools/image-to-webp", description: "Convert any image format to WebP", category: "Image Tools", keywords: "image webp convert optimize compress jpg png format" },
  { id: "image_to_favicon", name: "Image to Favicon", href: "/tools/image-to-favicon", description: "Convert image to favicon.ico", category: "Image Tools", keywords: "favicon ico image convert icon browser tab" },
  // Developer Tools
  { id: "json_formatter", name: "JSON Formatter", href: "/tools/json-formatter", description: "Format and validate JSON data", category: "Developer Tools", keywords: "json format validate beautify pretty print parse" },
  { id: "base64_encoder", name: "Base64 Encoder", href: "/tools/base64-encoder", description: "Encode and decode Base64 strings", category: "Developer Tools", keywords: "base64 encode decode string binary data" },
  { id: "url_encoder", name: "URL Encoder", href: "/tools/url-encoder", description: "Encode and decode URLs", category: "Developer Tools", keywords: "url encode decode percent encoding uri query" },
  { id: "html_formatter", name: "HTML Formatter", href: "/tools/html-formatter", description: "Format and beautify HTML code", category: "Developer Tools", keywords: "html format beautify indent pretty print markup" },
  { id: "css_minifier", name: "CSS Minifier", href: "/tools/css-minifier", description: "Minify CSS for production", category: "Developer Tools", keywords: "css minify compress optimize production stylesheet" },
  { id: "regex_tester", name: "Regex Tester", href: "/tools/regex-tester", description: "Test regular expressions", category: "Developer Tools", keywords: "regex regexp regular expression test match pattern" },
  { id: "jwt_decoder", name: "JWT Decoder", href: "/tools/jwt-decoder", description: "Decode and inspect JWT tokens", category: "Developer Tools", keywords: "jwt token decode inspect auth authentication bearer" },
  // Publisher Tools
  { id: "isbn_converter", name: "ISBN Converter", href: "/tools/isbn-converter", description: "Convert between ISBN-10 and ISBN-13", category: "Publisher Tools", keywords: "isbn book convert 10 13 publisher barcode" },
];

export function searchTools(query: string): Tool[] {
  const q = query.trim().toLowerCase().replace(/\s+/g, " ");
  if (!q) return [];
  return LIVE_TOOLS.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q) ||
    t.keywords.toLowerCase().includes(q)
  );
}
