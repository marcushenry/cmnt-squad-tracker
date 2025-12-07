import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // This is the important part:
  output: "export",
};

export default nextConfig;
