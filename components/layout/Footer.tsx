import Link from "next/link";
import Image from "next/image";

const FOOTER_COLS = [
  {
    head: "Quick Links",
    items: [
      { label: "All Tools", path: "/tools" },
      { label: "Highly Used Tools", path: "/tools" },
      { label: "About Us", path: "/about" },
      { label: "Blogs", path: "/blog" },
    ],
  },
  {
    head: "Legal",
    items: [
      { label: "Privacy Policy", path: "/privacy-policy" },
      { label: "Terms of Use", path: "/terms-of-use" },
      { label: "Disclaimer", path: "/disclaimer" },
      { label: "Contact Us", path: "/contact" },
    ],
  },
  {
    head: "Popular Tools",
    items: [
      { label: "PDF to Word", path: "/tools/pdf-to-word" },
      { label: "Compress PDF", path: "/tools/compress" },
      { label: "Image to PDF", path: "/tools/excel-to-pdf" },
      { label: "YouTube to MP3", path: "/tools" },
    ],
  },
];

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #1c1c1c", background: "#f4f1ea" }}>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Image src="/logo.png" alt="PDF24X" width={120} height={34} style={{ objectFit: "contain" }} />
            </Link>
            <p className="mt-4 max-w-xs text-sm" style={{ color: "#6b6760" }}>
              Your all-in-one platform for PDF, Image, Video and Developer tools.
            </p>
          </div>
          {FOOTER_COLS.map((col) => (
            <div key={col.head}>
              <h3 className="text-sm font-bold" style={{ color: "#1a1a1a" }}>{col.head}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.items.map((it) => (
                  <li key={it.label}>
                    <Link href={it.path} className="text-sm transition-colors hover:text-[#FF6B5E]" style={{ color: "#6b6760" }}>
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 text-center text-xs" style={{ borderTop: "1px solid #1c1c1c", color: "#6b6760" }}>
          © {new Date().getFullYear()} <span className="font-semibold" style={{ color: "#1a1a1a" }}>PDF24X</span>. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
