import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Terms of Use | PDF24X",
  description: "Read PDF24X Terms of Use.",
  alternates: { canonical: "https://pdf24x.com/terms-of-use" },
};
const C = { ink: "var(--txt)", sub: "var(--txt-2)" };
const sections = [
  ["1. Acceptance of terms", "By accessing or using PDF24X, you agree to be bound by these Terms of Use. If you do not agree, please do not use the Service."],
  ["2. Description of service", "PDF24X provides free, browser-based tools for working with PDF files. The Service is provided as-is and may be updated or discontinued at any time without notice."],
  ["3. Acceptable use", "You agree to use the Service only for lawful purposes. You must not upload files containing malware, violate intellectual property rights, or contain illegal content."],
  ["4. Your files", "You retain full ownership of any files you upload. Files are automatically deleted within 15 minutes of processing and are never stored, shared, or used for any other purpose."],
  ["5. Intellectual property", "All content on PDF24X is owned by or licensed to PDF24X and protected by applicable intellectual property laws."],
  ["6. Disclaimer of warranties", "The Service is provided on an as-is and as-available basis without warranties of any kind. Always keep backup copies of important files before processing them."],
  ["7. Limitation of liability", "To the maximum extent permitted by law, PDF24X shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service."],
  ["8. Changes to these terms", "We may update these Terms at any time. Continued use of the Service after changes constitutes your acceptance of the updated terms."],
];
export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold sm:text-4xl" style={{ color: C.ink, fontFamily: "Archivo, Inter, sans-serif" }}>Terms of Use</h1>
      <p className="mt-2 text-sm" style={{ color: C.sub }}>Last updated: July 12, 2026</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed sm:text-base">
        {sections.map(([title, text]) => (
          <section key={title}>
            <h2 className="text-lg font-bold" style={{ color: C.ink }}>{title}</h2>
            <p className="mt-2" style={{ color: C.sub }}>{text}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
