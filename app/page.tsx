import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "PDF24X — Free Online PDF Tools",
  description: "PDF24X offers 200+ free tools to convert, merge, compress, split and edit PDFs, images and more. No sign up, no installs, 100% free.",
  alternates: { canonical: "https://pdf24x.com" },
};

export default function Page() {
  return <HomeClient />;
}
