export interface Tool {
  id: string;
  name: string;
  href: string;
  description: string;
  category: "PDF Tools" | "Image Tools" | "Developer Tools" | "Publisher Tools" | "Diff Checker" | "Utility Tools";
  keywords: string;
}

export const LIVE_TOOLS: Tool[] = [
  // PDF Tools
  { id: "compress_pdf", name: "Compress PDF", href: "/tools/compress", description: "Reduce PDF file size without losing quality", category: "PDF Tools", keywords: "compress reduce shrink smaller size email upload" },
  { id: "merge_pdf", name: "Merge PDF", href: "/tools/merge", description: "Combine multiple PDFs into one file", category: "PDF Tools", keywords: "merge combine join together add pages" },
  { id: "split_pdf", name: "Split PDF", href: "/tools/split", description: "Extract or split PDF pages easily", category: "PDF Tools", keywords: "split separate extract pages divide cut" },
  { id: "pdf_to_jpg", name: "PDF to JPG", href: "/tools/pdf-to-jpg", description: "Convert PDF pages to JPG images", category: "PDF Tools", keywords: "pdf jpg jpeg image pages convert picture photo" },
  { id: "image_to_pdf", name: "Image to PDF", href: "/tools/image-to-pdf", description: "Convert JPG, PNG, WebP images to PDF", category: "PDF Tools", keywords: "image jpg jpeg png photo picture webp to pdf convert" },
  { id: "rotate_pdf", name: "Rotate PDF", href: "/tools/rotate-pdf", description: "Rotate PDF pages online", category: "PDF Tools", keywords: "rotate orientation sideways upside down flip fix" },
  { id: "watermark_pdf", name: "Watermark PDF", href: "/tools/watermark-pdf", description: "Add text watermark to PDF pages", category: "PDF Tools", keywords: "watermark stamp confidential draft text mark brand" },
  { id: "unlock_pdf", name: "Unlock PDF", href: "/tools/unlock-pdf", description: "Remove PDF password protection", category: "PDF Tools", keywords: "unlock password remove protected decrypt open" },
  { id: "excel_to_pdf", name: "Excel to PDF", href: "/tools/excel-to-pdf", description: "Convert Excel spreadsheets to PDF", category: "PDF Tools", keywords: "excel xlsx xls spreadsheet convert table" },
  { id: "pdf_to_excel", name: "PDF to Excel", href: "/tools/pdf-to-excel", description: "Extract tables from PDF to Excel", category: "PDF Tools", keywords: "pdf excel xlsx tables extract data" },
  // Image Tools
  { id: "image_to_webp", name: "Image to WebP", href: "/tools/image-to-webp", description: "Convert any image format to WebP", category: "Image Tools", keywords: "image webp convert optimize compress jpg png format" },
  { id: "image_to_favicon", name: "Image to Favicon", href: "/tools/image-to-favicon", description: "Convert image to favicon.ico", category: "Image Tools", keywords: "favicon ico image convert icon browser tab" },
  { id: "image_to_jpg", name: "Image to JPG", href: "/tools/image-to-jpg", description: "Convert PNG, WebP, HEIC to JPG", category: "Image Tools", keywords: "image jpg jpeg convert png webp heic quality" },
  { id: "image_to_png", name: "Image to PNG", href: "/tools/image-to-png", description: "Convert any image to PNG with transparency", category: "Image Tools", keywords: "image png convert jpg webp transparent lossless" },
  { id: "image_compressor", name: "Image Compressor", href: "/tools/image-compressor", description: "Reduce image file size with quality control", category: "Image Tools", keywords: "image compress reduce size optimize smaller jpg png webp" },
  { id: "image_resizer", name: "Image Resizer", href: "/tools/image-resizer", description: "Resize images by pixels or percentage", category: "Image Tools", keywords: "image resize dimensions pixels percentage scale width height" },
  { id: "image_cropper", name: "Image Cropper", href: "/tools/image-cropper", description: "Crop images with aspect-ratio presets", category: "Image Tools", keywords: "image crop trim square 1:1 16:9 4:5 instagram ratio" },
  // Developer Tools
  { id: "json_formatter", name: "JSON Formatter", href: "/tools/json-formatter", description: "Format and validate JSON data", category: "Developer Tools", keywords: "json format validate beautify pretty print parse minify" },
  { id: "base64_encoder", name: "Base64 Encoder", href: "/tools/base64-encoder", description: "Encode and decode Base64 strings", category: "Developer Tools", keywords: "base64 encode decode string binary data convert" },
  { id: "url_encoder", name: "URL Encoder", href: "/tools/url-encoder", description: "Encode and decode URLs", category: "Developer Tools", keywords: "url encode decode percent encoding uri query string" },
  { id: "html_formatter", name: "HTML Formatter", href: "/tools/html-formatter", description: "Format and beautify HTML code", category: "Developer Tools", keywords: "html format beautify indent pretty print markup code" },
  { id: "css_minifier", name: "CSS Minifier", href: "/tools/css-minifier", description: "Minify CSS for production", category: "Developer Tools", keywords: "css minify compress optimize production stylesheet" },
  { id: "regex_tester", name: "Regex Tester", href: "/tools/regex-tester", description: "Test regular expressions with live matching", category: "Developer Tools", keywords: "regex regexp regular expression test match pattern flags" },
  { id: "jwt_decoder", name: "JWT Decoder", href: "/tools/jwt-decoder", description: "Decode and inspect JWT tokens", category: "Developer Tools", keywords: "jwt token decode inspect auth authentication bearer claims" },
    { id: "word_counter", name: "Word Counter", href: "/tools/word-counter", description: "Count words, characters, sentences and paragraphs instantly", category: "Utility Tools", keywords: "word counter character count sentences paragraphs lines read time" },
  { id: "unit_converter", name: "Unit Converter", href: "/tools/unit-converter", description: "Convert length, weight, temperature, speed and area units", category: "Utility Tools", keywords: "unit converter length weight temperature speed area km miles kg pounds celsius fahrenheit" },
  { id: "percentage_calculator", name: "Percentage Calculator", href: "/tools/percentage-calculator", description: "Calculate percentages, percentage change and more", category: "Utility Tools", keywords: "percentage calculator percent of number change increase decrease" },
  { id: "bmi_calculator", name: "BMI Calculator", href: "/tools/bmi-calculator", description: "Calculate your Body Mass Index and health category", category: "Utility Tools", keywords: "bmi calculator body mass index weight height underweight normal overweight obese" },
  { id: "gst_calculator", name: "GST Calculator", href: "/tools/gst-calculator", description: "Add or remove GST from any amount with CGST and SGST split", category: "Utility Tools", keywords: "gst calculator india tax cgst sgst 5 12 18 28 percent add remove" },
  { id: "stopwatch", name: "Stopwatch & Timer", href: "/tools/stopwatch", description: "Online stopwatch with lap support and countdown timer", category: "Utility Tools", keywords: "stopwatch timer countdown lap online clock time" },
  { id: "color_converter", name: "Color Converter", href: "/tools/color-converter", description: "Convert colors between HEX, RGB and HSL formats", category: "Utility Tools", keywords: "color converter hex rgb hsl picker palette css colour" },
  { id: "age_calculator", name: "Age Calculator", href: "/tools/age-calculator", description: "Calculate exact age in years, months, days, hours and minutes", category: "Utility Tools", keywords: "age calculator birthday years months days born dob date" },
  { id: "emi_calculator", name: "EMI Calculator", href: "/tools/emi-calculator", description: "Calculate monthly EMI for home, car or personal loan", category: "Utility Tools", keywords: "emi loan calculator monthly instalment home car personal interest principal tenure" },
  { id: "password_generator", name: "Password Generator", href: "/tools/password-generator", description: "Generate strong random passwords with custom settings", category: "Utility Tools", keywords: "password generator strong secure random symbols numbers uppercase" },
  { id: "qr_code_generator", name: "QR Code Generator", href: "/tools/qr-code-generator", description: "Generate QR codes for URL, WiFi, text, email, phone", category: "Utility Tools", keywords: "qr code generator url wifi text email phone sms barcode scan" },
  // Diff Checker
  { id: "text_diff", name: "Text & Code Diff", href: "/diff-checker/text", description: "Compare text, code or JSON side-by-side", category: "Diff Checker", keywords: "diff compare difference text code json files patch merge changes side by side" },
  // Publisher Tools
  { id: "isbn_converter", name: "ISBN Converter", href: "/tools/isbn-converter", description: "Convert between ISBN-10 and ISBN-13", category: "Publisher Tools", keywords: "isbn book convert 10 13 publisher" },
  { id: "isbn_validator", name: "ISBN Validator", href: "/tools/isbn-validator", description: "Validate single or bulk ISBNs instantly", category: "Publisher Tools", keywords: "isbn validate check verify book number bulk list" },
  { id: "duplicate_isbn", name: "Duplicate ISBN Finder", href: "/tools/duplicate-isbn-finder", description: "Find duplicate ISBNs in a list", category: "Publisher Tools", keywords: "isbn duplicate find detect list bulk repeated" },
  { id: "isbn_country", name: "ISBN Country Identifier", href: "/tools/isbn-country-identifier", description: "Identify country and language group from ISBN", category: "Publisher Tools", keywords: "isbn country language group identify prefix origin" },
  { id: "isbn_metadata", name: "ISBN Metadata Extractor", href: "/tools/isbn-metadata-extractor", description: "Get book title, author and publisher from ISBN", category: "Publisher Tools", keywords: "isbn metadata book title author publisher lookup google" },
  { id: "isbn_range", name: "ISBN Range Checker", href: "/tools/isbn-range-checker", description: "Check if ISBN falls within valid publisher ranges", category: "Publisher Tools", keywords: "isbn range check publisher valid registration agency" },
  { id: "isbn_batch", name: "ISBN Batch Generator", href: "/tools/isbn-batch-generator", description: "Generate internal IDs with ISBN check digit", category: "Publisher Tools", keywords: "isbn batch generate internal id check digit bulk" },
];

export function searchTools(query: string): Tool[] {
  const q = query.trim().toLowerCase().replace(/\s+/g, " ");
  if (!q) return [];
  const words = q.split(" ");
  return LIVE_TOOLS.filter(t => {
    const haystack = `${t.name} ${t.description} ${t.category} ${t.keywords}`.toLowerCase();
    return words.every(w => haystack.includes(w));
  }).sort((a, b) => {
    // Exact name match ranks first
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    if (aName.startsWith(q) && !bName.startsWith(q)) return -1;
    if (!aName.startsWith(q) && bName.startsWith(q)) return 1;
    return 0;
  });
}
