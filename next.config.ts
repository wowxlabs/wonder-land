import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  // Set this to your GitHub repo name, e.g. "/wonder-land"
  // Remove basePath if you're deploying to username.github.io (root domain)
  basePath: isProd ? "/wonder-land" : "",
  assetPrefix: isProd ? "/wonder-land/" : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? "/wonder-land" : "",
  },
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  turbopack: {},
};

export default nextConfig;
