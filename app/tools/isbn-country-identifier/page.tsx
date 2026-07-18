import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "ISBN Country Identifier – Find ISBN Country/Language Free",
  description: "Identify the country, language, or region of an ISBN. Works with ISBN-10 and ISBN-13, single or bulk lookup, CSV export. 100% private.",
  alternates: { canonical: "https://pdf24x.com/tools/isbn-country-identifier" },
};
import ISBNCountryIdentifierClient from "./ISBNCountryIdentifierClient";
export default function Page() { return <ISBNCountryIdentifierClient />; }
