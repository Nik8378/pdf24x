import type { Metadata } from "next";
import { ToolJsonLd } from "@/components/seo/ToolJsonLd";
export const metadata: Metadata = {
  title: "JWT Decoder & Encoder – Debug JSON Web Tokens",
  description:
    "Decode, verify and generate JSON Web Tokens (JWT) online for free. Claims breakdown, HS256/HS384/HS512 signature verification and token signing — 100% in your browser, nothing is uploaded.",
  alternates: { canonical: "https://pdf24x.com/tools/jwt-decoder" },
};
import JWTDecoderClient from "./JWTDecoderClient";
export default function Page() { return <JWTDecoderClient />; }
