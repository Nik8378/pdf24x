import type { Metadata } from "next";
import { ToolJsonLd } from "@/components/seo/ToolJsonLd";
import Client from "./Client";
const meta: Record<string,{t:string;d:string}> = {
  "word-counter":            { t: "Word Counter – Count Words & Characters Free", d: "Count words, characters, sentences and paragraphs instantly. Free online word counter." },
  "unit-converter":          { t: "Unit Converter – Length, Weight, Temp & More", d: "Convert length, weight, temperature, speed and area units instantly. Free online converter." },
  "percentage-calculator":   { t: "Percentage Calculator – Free Online", d: "Calculate percentage of a number, percentage change, and more instantly." },
  "bmi-calculator":          { t: "BMI Calculator – Body Mass Index Free", d: "Calculate your BMI instantly. Know if you are underweight, normal, overweight or obese." },
  "gst-calculator":          { t: "GST Calculator – Calculate GST Free Online", d: "Add or remove GST from any amount. Supports all GST slabs — 5%, 12%, 18%, 28%." },
  "stopwatch":               { t: "Stopwatch & Timer – Free Online", d: "Free online stopwatch and countdown timer with lap support." },
  "color-converter":         { t: "Color Converter – HEX RGB HSL Free", d: "Convert colors between HEX, RGB, HSL and HSB instantly. Free color picker and converter." },
};
export const metadata: Metadata = { title: meta["bmi-calculator"].t, description: meta["bmi-calculator"].d, alternates: { canonical: `https://pdf24x.com/tools/bmi-calculator` } };
export default function Page() {
  return (
    <>
      <ToolJsonLd name="BMI Calculator" description="Calculate your Body Mass Index and health category instantly." url="https://pdf24x.com/tools/bmi-calculator" category="Health" />
      <Client />
    </>
  );
}
