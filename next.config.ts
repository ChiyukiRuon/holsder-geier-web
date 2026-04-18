import type { NextConfig } from "next";

// const API_BASE_URL = process.env.API_BASE_URL;
// const WS_BASE_URL = process.env.WS_BASE_URL;
// const CDN_BASE_URL = process.env.CDN_BASE_URL;

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            // {
            //     source: "/api/:path*",
            //     destination: `${API_BASE_URL}/:path*`,
            // },
            // {
            //     source: "/ws",
            //     destination: `${WS_BASE_URL}/ws`,
            // },
            // {
            //     source: "/uploads/:path*",
            //     destination: `${CDN_BASE_URL}/:path*`,
            // },
        ];
    },
};

export default nextConfig;
