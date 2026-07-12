import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us | PDF24X",
  description: "Get in touch with the PDF24X team — questions, feedback, or bug reports welcome.",
  alternates: { canonical: "https://pdf24x.com/contact" },
};

export default function ContactPage() {
  return <ContactClient />;
}
