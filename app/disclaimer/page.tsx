import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Disclaimer | PDF24X",
  description: "Read PDF24X Disclaimer — limitations of liability and important notices.",
  alternates: { canonical: "https://pdf24x.com/disclaimer" },
};
const C = { ink: "#1a1a1a", sub: "#6b6760" };
const sections = [
  ["General disclaimer", "The information and tools provided by PDF24X are for general use only. We make no representations or warranties about the completeness, accuracy, reliability, or availability of the Service."],
  ["File processing", "PDF24X processes your files on a best-effort basis. Results may vary depending on the complexity and format of files you upload. Always keep backup copies of important files before processing them."],
  ["No professional advice", "Nothing on PDF24X constitutes legal, financial, medical, or other professional advice."],
  ["Third-party links", "PDF24X may contain links to third-party websites for convenience only. We have no control over third-party sites and accept no responsibility for them."],
  ["Limitation of liability", "To the fullest extent permitted by law, PDF24X shall not be liable for any loss or damage arising from the use of or inability to use this website or our tools."],
];
export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold sm:text-4xl" style={{ color: C.ink, fontFamily: "Archivo, Inter, sans-serif" }}>Disclaimer</h1>
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
