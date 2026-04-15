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

        const fetchUserInfo = async () => {
            try {
                const userInfo = await getKookUserInfo(code);

                // 将用户信息发送回主窗口
                if (window.opener) {
                    window.opener.postMessage(
                        {
                            type: "KOOK_LOGIN_SUCCESS",
                            data: userInfo
                        },
                        "*"
                    );
                }

                // 关闭当前窗口
                window.close();

                // 尝试返回上一页（如果窗口未被关闭）
                setTimeout(() => {
                    if (window.opener) {
                        router.back();
                    }
                }, 100);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "获取用户信息失败";
                console.error("获取KOOK用户信息失败:", errorMessage);
                setError(errorMessage);

                if (window.opener) {
                    window.opener.postMessage(
                        {
                            type: "KOOK_LOGIN_ERROR",
                            error: errorMessage
                        },
                        "*"
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, [code, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center from-indigo-50 to-blue-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-slate-700 font-bold text-lg">正在获取KOOK用户信息...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center from-indigo-50 to-blue-100">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl border-4 border-slate-200">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-black text-slate-800 mb-2">授权失败</h1>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.close()}
                        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                        关闭窗口
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
