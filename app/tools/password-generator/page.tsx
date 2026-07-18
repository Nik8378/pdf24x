import type { Metadata } from "next";
const meta: Record<string,{t:string;d:string}> = {
  "age-calculator":      { t: "Age Calculator – Find Exact Age Free", d: "Calculate your exact age in years, months, days, hours and minutes instantly." },
  "qr-code-generator":  { t: "QR Code Generator – Free & Instant", d: "Generate QR codes for URLs, text, email, phone instantly. Download PNG free." },
  "password-generator": { t: "Password Generator – Strong & Secure", d: "Generate strong random passwords with custom length, symbols, numbers." },
  "emi-calculator":     { t: "EMI Calculator – Loan EMI Free Online", d: "Calculate monthly EMI for home, car or personal loan instantly." },
};
export const metadata: Metadata = { title: meta["password-generator"].t, description: meta["password-generator"].d, alternates: { canonical: `https://pdf24x.com/tools/password-generator` } };
import Client from "./Client";
export default function Page() { return <Client />; }
