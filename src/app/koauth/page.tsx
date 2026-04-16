"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getKookUserInfo } from "@/lib/api/kook";

export default function KoauthPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get("code");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!code) {
            setError("缺少授权码");
            setLoading(false);
            return;
        }

        let isMounted = true;

        const postToOpener = (payload: any) => {
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage(payload, window.location.origin);
            }
        };

        const fetchUserInfo = async () => {
            try {
                const userInfo = await getKookUserInfo(code);

                if (!userInfo?.nickname) {
                    throw new Error("用户信息不完整");
                }

                postToOpener({
                    type: "KOOK_LOGIN_SUCCESS",
                    data: userInfo,
                });

                if (window.opener && !window.opener.closed) {
                    setTimeout(() => window.close(), 500);
                }
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "获取用户信息失败";

                if (isMounted) setError(errorMessage);

                postToOpener({
                    type: "KOOK_LOGIN_ERROR",
                    error: errorMessage,
                });
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchUserInfo();

        return () => {
            isMounted = false;
        };
    }, [code]);

    const Background = () => (
        <>
            <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: 'radial-gradient(#000 1.5px, transparent 0)',
                    backgroundSize: '32px 32px',
                }}
            />
            <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-transparent via-transparent to-black/5" />
        </>
    );

    const Container = ({ children }: { children: React.ReactNode }) => (
        <div className="h-screen w-full bg-slate-300 flex items-center justify-center relative overflow-hidden">
            <Background />
            <div className="relative z-10 bg-white border-4 border-slate-800 rounded-2xl shadow-[10px_10px_0px_rgba(0,0,0,0.15)] p-12 max-w-md w-full mx-6">
                {children}
            </div>
        </div>
    );

    if (loading) {
        return (
            <Container>
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-slate-300 rounded-full"></div>
                        <div className="absolute inset-0 w-20 h-20 border-4 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-2 w-16 h-16 border-4 border-slate-400 border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>

                    <div className="text-center space-y-2">
                        <p className="text-slate-700 font-black text-lg uppercase tracking-wide">从 KOOK 获取用户信息</p>
                        <p className="text-slate-500 text-sm font-bold">请稍候...</p>
                    </div>
                </div>

                <Footer text="KOOK OAUTH" />
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-red-100 border-4 border-red-500 rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_rgba(239,68,68,0.3)]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-10 h-10 text-red-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-3">授权失败</h1>
                    (error ? {
                        <p className="text-slate-600 font-bold text-sm bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-3 inline-block">
                            {error}
                        </p>
                    } : null)
                </div>

                <Footer text="AUTH FAILED" />
            </Container>
        );
    }

    return null;
}

function Footer({ text }: { text: string }) {
    return (
        <div className="mt-8 pt-6 border-t-2 border-slate-200">
            <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <span>獴鹫派对</span>
                <span>{text}</span>
            </div>
        </div>
    );
}
