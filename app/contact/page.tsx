import type { Metadata } from "next";
import { Mail, MessageSquare } from "lucide-react";
export const metadata: Metadata = {
  title: "Contact Us | PDF24X",
  description: "Get in touch with the PDF24X team.",
  alternates: { canonical: "https://pdf24x.com/contact" },
};
export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white" style={{ border: "1px solid #1c1c1c", boxShadow: "3px 3px 0 0 #1c1c1c" }}>
        <Mail size={24} style={{ color: "#FF6B5E" }} />
      </span>
      <h1 className="text-3xl font-extrabold sm:text-4xl" style={{ color: "#1a1a1a", fontFamily: "Archivo, Inter, sans-serif" }}>Contact Us</h1>
      <p className="mx-auto mt-3 max-w-md text-sm sm:text-base" style={{ color: "#6b6760" }}>
        Questions, feedback, or found a bug? We would love to hear from you. Our contact form is coming soon.
      </p>
      <div className="mt-8 rounded-2xl bg-white p-8" style={{ border: "1px solid #1c1c1c", boxShadow: "3px 3px 0 0 #1c1c1c" }}>
        <MessageSquare size={32} className="mx-auto mb-4" style={{ color: "#FF6B5E" }} />
        <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>Contact form coming soon</p>
        <p className="mt-2 text-xs" style={{ color: "#6b6760" }}>We are setting up our support system. Check back shortly.</p>
      </div>
    </div>
  );
}
