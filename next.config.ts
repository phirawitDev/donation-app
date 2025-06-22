import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "testbackend.phirawit.dev",
        port: "",
        pathname: "/**",
        search: "",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
