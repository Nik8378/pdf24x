import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Privacy Policy | PDF24X",
  description: "Read PDF24X\'s Privacy Policy — how we handle uploaded files, data collection, cookies, and your rights.",
  alternates: { canonical: "https://pdf24x.com/privacy-policy" },
};
const C = { ink: "#1a1a1a", sub: "#6b6760" };
export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold sm:text-4xl" style={{ color: C.ink, fontFamily: "Archivo, Inter, sans-serif" }}>Privacy Policy</h1>
      <p className="mt-2 text-sm" style={{ color: C.sub }}>Last updated: July 12, 2026</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed sm:text-base">
        {[
          ["1. What this policy covers", "This Privacy Policy explains how PDF24X collects, uses, and protects information when you use our website and tools at pdf24x.com. By using PDF24X, you agree to the practices described here."],
          ["2. Files you upload", "Files you upload for processing are used solely to perform the action you requested. We do not read, review, share, or sell the contents of your files. Uploaded files and all generated output files are automatically deleted from our servers within 15 minutes of processing."],
          ["3. Information we collect", "We collect basic technical information automatically, including browser type, device type, operating system, and pages visited. This is used to diagnose technical problems and improve performance. We do not collect your name, email, or personally identifiable information unless you contact us directly."],
          ["4. Cookies", "We use essential cookies required for the website to function correctly, such as remembering your theme preference. We may also use analytics cookies to understand aggregate usage patterns."],
          ["5. Third-party services", "We use third-party services for hosting and analytics. We may display advertisements served by Google AdSense. You can opt out of personalized advertising at google.com/settings/ads."],
          ["6. Your rights", "Since we do not collect personally identifiable information in the normal course of using our tools, most requests will confirm that we hold no data about you. For any privacy concerns, please use our Contact page."],
          ["7. Children\'s privacy", "PDF24X is not directed at children under 13. We do not knowingly collect personal information from children."],
          ["8. Changes to this policy", "We may update this Privacy Policy from time to time. Continued use of PDF24X after changes are posted constitutes your acceptance of the updated policy."],
        ].map(([title, text]) => (
          <section key={title as string}>
            <h2 className="text-lg font-bold" style={{ color: C.ink }}>{title}</h2>
            <p className="mt-2" style={{ color: C.sub }}>{text}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
