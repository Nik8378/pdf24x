import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "Privacy Policy – PDF24x",
  description: "PDF24x privacy policy. We process all files locally in your browser — no files are ever uploaded to our servers. Learn how we handle your data.",
  alternates: { canonical: "https://pdf24x.com/privacy-policy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicy() {
  return (
    <div className="w-full flex gap-0 items-start">
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-12 max-w-4xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1917] mb-2">Privacy Policy</h1>
        <p className="text-[13px] text-[#7a7875] mb-8">Last updated: June 7, 2025</p>

        <div className="space-y-8 text-[14px] text-[#333333] leading-relaxed">

          <section>
            <h2 className="text-[18px] font-bold text-[#1a1917] mb-3">1. Introduction</h2>
            <p>Welcome to PDF24x (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We operate the website <a href="https://pdf24x.com" className="text-accent hover:underline">https://pdf24x.com</a>. This Privacy Policy explains how we collect, use, and protect your information when you use our services.</p>
            <p className="mt-3">PDF24x is committed to protecting your privacy. Our core principle is simple: <strong>your files never leave your device.</strong> All file processing happens entirely in your browser using client-side JavaScript.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1a1917] mb-3">2. Information We Collect</h2>
            <h3 className="text-[15px] font-semibold text-[#1a1917] mb-2">2.1 Files and Documents</h3>
            <p>PDF24x processes all files <strong>locally in your browser</strong>. We do not upload, store, or transmit your files to any server. Your documents, images, PDFs, and spreadsheets remain entirely on your device at all times.</p>

            <h3 className="text-[15px] font-semibold text-[#1a1917] mb-2 mt-4">2.2 Usage Data</h3>
            <p>We may collect anonymous usage data through analytics services including:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Pages visited and tools used</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Referring URLs</li>
              <li>Time and date of visits</li>
              <li>General geographic location (country/city level)</li>
            </ul>

            <h3 className="text-[15px] font-semibold text-[#1a1917] mb-2 mt-4">2.3 Cookies</h3>
            <p>We use cookies and similar tracking technologies to improve your experience. These include:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Essential cookies:</strong> Required for the website to function properly</li>
              <li><strong>Analytics cookies:</strong> Help us understand how visitors use our site</li>
              <li><strong>Advertising cookies:</strong> Used by Google AdSense to serve relevant advertisements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1a1917] mb-3">3. Google AdSense</h2>
            <p>We use Google AdSense to display advertisements on our website. Google AdSense uses cookies to serve ads based on your prior visits to our website and other websites on the internet.</p>
            <p className="mt-3">Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the Internet. You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</p>
            <p className="mt-3">For more information about Google&apos;s privacy practices, please visit the <a href="https://policies.google.com/privacy" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1a1917] mb-3">4. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Provide, operate, and maintain our website and tools</li>
              <li>Improve and optimize our website and user experience</li>
              <li>Analyze usage patterns to develop new features</li>
              <li>Display relevant advertisements through Google AdSense</li>
              <li>Comply with legal obligations</li>
              <li>Prevent fraud and abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1a1917] mb-3">5. Data Sharing and Third Parties</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share anonymous, aggregated data with:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
              <li><strong>Google AdSense:</strong> For serving advertisements</li>
              <li><strong>Vercel:</strong> Our hosting provider (processes web requests only, no file data)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1a1917] mb-3">6. Data Security</h2>
            <p>We implement appropriate technical and organizational security measures to protect your information. Since files are processed locally in your browser, they are never transmitted over the internet to our servers, providing an inherent level of privacy and security.</p>
            <p className="mt-3">Our website uses HTTPS encryption to protect data transmitted between your browser and our servers.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1a1917] mb-3">7. Your Rights</h2>
            <p>Depending on your location, you may have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Right to access:</strong> Request a copy of the data we hold about you</li>
              <li><strong>Right to rectification:</strong> Request correction of inaccurate data</li>
              <li><strong>Right to erasure:</strong> Request deletion of your data</li>
              <li><strong>Right to opt-out:</strong> Opt out of personalized advertising</li>
              <li><strong>Right to data portability:</strong> Request transfer of your data</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, please contact us at <a href="mailto:privacy@pdf24x.com" className="text-accent hover:underline">privacy@pdf24x.com</a>.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1a1917] mb-3">8. Children&apos;s Privacy</h2>
            <p>Our services are not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1a1917] mb-3">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this Privacy Policy periodically.</p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1a1917] mb-3">10. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <div className="mt-3 bg-[#f4f3f0] rounded-xl p-4 text-[13px]">
              <p><strong>PDF24x</strong></p>
              <p>Email: <a href="mailto:privacy@pdf24x.com" className="text-accent hover:underline">privacy@pdf24x.com</a></p>
              <p>Website: <a href="https://pdf24x.com" className="text-accent hover:underline">https://pdf24x.com</a></p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
