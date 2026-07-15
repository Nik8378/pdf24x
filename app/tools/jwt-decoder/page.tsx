import type { Metadata } from "next";
import JWTDecoderClient from "./JWTDecoderClient";
export const metadata: Metadata = {
  title: "JWT Decoder – Free Online JSON Web Token Decoder",
  description: "Decode and inspect JSON Web Tokens instantly. View header, payload, expiry status and all claims. 100% client-side — your token never leaves your browser.",
  keywords: ["jwt decoder","jwt parser","decode jwt","json web token decoder","jwt inspector","jwt viewer","jwt token decoder","jwt online","jwt claims"],
  alternates: { canonical: "https://pdf24x.com/tools/jwt-decoder" },
  openGraph: { title: "JWT Decoder – Free Online JSON Web Token Tool | PDF24x", description: "Decode JWT tokens instantly. 100% private, browser-based.", url: "https://pdf24x.com/tools/jwt-decoder" },
};
export default function Page() { return <JWTDecoderClient />; }
