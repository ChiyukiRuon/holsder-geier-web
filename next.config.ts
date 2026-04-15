import type { NextConfig } from "next";

const BASE_URL = process.env.BASE_URL;
const CDN_BASE_URL = process.env.CDN_BASE_URL;

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: `${BASE_URL}/:path*`,
            },
            {
                source: "/ws",
                destination: `${BASE_URL}/ws`,
            },
            {
                source: "/uploads/:path*",
                destination: `${CDN_BASE_URL}/:path*`,
            },
        ];
    },
};

export default nextConfig;
