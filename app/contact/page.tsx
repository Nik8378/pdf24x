import type { Metadata } from "next";
import ContactPage from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us – PDF24x",
  description: "Contact PDF24x for support, bug reports, feature requests, or business inquiries. We respond within 24-48 hours.",
  alternates: { canonical: "https://pdf24x.com/contact" },
  robots: { index: true, follow: true },
};

export default function Page() { return <ContactPage />; }
