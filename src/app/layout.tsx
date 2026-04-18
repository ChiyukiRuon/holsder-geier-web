import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {GoogleOAuthProvider} from "@react-oauth/google";
import {Toast} from "@heroui/react";
import React from "react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "獴鹫派对",
    description: "一款多人卡牌派对游戏",
    authors: [{ name: "ChiyukiRuon" }],
    openGraph: {
        title: "獴鹫派对",
        description: "一款多人卡牌派对游戏",
        type: "website",
        locale: "zh_CN",
    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
        <GoogleOAuthProvider clientId="292706659748-07pet4u8r0tq981e77k3vgdjuheg4a6h.apps.googleusercontent.com">
            <Toast.Provider />
            <body className="min-h-full flex flex-col">{children}</body>
        </GoogleOAuthProvider>
        </html>
    );
}
