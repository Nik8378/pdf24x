import type { Metadata } from "next";
import JWTDecoderClient from "./JWTDecoderClient";
export const metadata: Metadata = {
  title: "JWT Decoder – Free Online JSON Web Token Decoder",
  description: "Decode and inspect JSON Web Tokens instantly. View header, payload, expiry status and all claims. 100% client-side — your token never leaves your browser.",
  keywords: ["jwt decoder","jwt parser","decode jwt","json web token decoder","jwt inspector","jwt viewer","jwt token decoder","jwt online","jwt claims"],
  alternates: { canonical: "https://pdf24x.com/tools/jwt-decoder" },
  openGraph: { title: "JWT Decoder – Free Online JSON Web Token Tool | PDF24x", description: "Decode JWT tokens instantly. 100% private, browser-based.", url: "https://pdf24x.com/tools/jwt-decoder" },
};
export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "Is it safe to paste my JWT token into this tool?", "acceptedAnswer": {"@type": "Answer", "text": "Yes. The token is decoded entirely in your browser using JavaScript. Nothing is sent to any server."}}, {"@type": "Question", "name": "Does the JWT decoder verify the signature?", "acceptedAnswer": {"@type": "Answer", "text": "It decodes the header and payload without signature verification, since that requires the secret key. Use it to inspect claims and expiry times."}}, {"@type": "Question", "name": "What information can I see when decoding a JWT?", "acceptedAnswer": {"@type": "Answer", "text": "You can see the algorithm, token type, all payload claims including sub, iat, exp, and any custom claims."}}]}) }} />
      <JWTDecoderClient />
    </>
  );
}
