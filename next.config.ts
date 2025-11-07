import type { NextConfig } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URI || "https://api.travulu.in";
const parsedUrl = new URL(baseUrl);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.builder.io",
      },
      {
        protocol: parsedUrl.protocol.replace(":", "") as "http" | "https",
        hostname: parsedUrl.hostname,
      },
      {
        protocol: "https",
        hostname: "odoo.travulu.in",
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true,
  },
   eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
