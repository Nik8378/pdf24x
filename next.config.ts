import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "hodzanfnevljrrrdjnfg.supabase.co" },
    ],
  },
  allowedDevOrigins: [
    "santana-vocalic-ivy.ngrok-free.dev",
    "192.168.1.7",
  ],
};

export default nextConfig;