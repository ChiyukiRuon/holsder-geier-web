'use client';

import { Suspense, useEffect, useState } from 'react';
import {Spinner, toast} from "@heroui/react";
import { useSearchParams } from "next/navigation";

import { generateNickname, generateUserColor } from "@/utils/user";
import type { UserInfo } from "@/types";

import { useChat } from "@/hooks/useChat";

import GameBoard from "@/components/game/GameBoard";
import SidePanel from "@/components/side/SidePanel";
import {WebSocketProvider} from "@/components/providers/WebSocketProvider";
import {GameEndModal} from "@/components/models/GameEndModal";
import {useGameSession} from "@/hooks/useGameSession";

function getInitialUserInfo(): UserInfo | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const stored = localStorage.getItem("userInfo");

    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            localStorage.removeItem("userInfo");
        }
    }

    const info: UserInfo = {
        userId: crypto.randomUUID(),
        nickname: generateNickname(),
        avatar: "",
        background: "",
        color: generateUserColor()
    };

    localStorage.setItem("userInfo", JSON.stringify(info));

    return info;
}

function GameRoomInner() {
    const searchParams = useSearchParams();
    const joinId = searchParams.get('join');

    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    // hooks
    const session = useGameSession(userInfo);
    const chat = useChat(userInfo);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserInfo(getInitialUserInfo());
    }, []);

    // 自动加入房间
    useEffect(() => {
        if (!joinId || !userInfo || !session.isConnected) return;

        const handleJoin = async () => {
            try {
                session.handleJoinRoom(joinId);
            } catch (err: unknown) {
                console.error(err);
                const errorMessage = err instanceof Error ? err.message : '未知错误';
                toast.danger(`加入房间失败:${errorMessage}`);
            }
        };

        void handleJoin();
    }, [joinId, userInfo, session.isConnected, session.handleJoinRoom, session]);

    // 获取当前玩家列表（游戏进行中优先使用 session.players）
    const currentPlayerList = session.gameState ? session.players : session.players;

    // loading 状态
    if (!userInfo) {
        return (
            <div className="h-screen w-full bg-slate-300 flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-slate-300 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 overflow-hidden relative">
            {/* 背景纹理与装饰 */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
                 style={{
                     backgroundSize: '32px 32px'
                 }}
            />
            <div
                className="absolute inset-0 pointer-events-none bg-linear-to-b from-transparent via-transparent to-black/5"/>

            {/* 游戏区域 */}
            <div className="col-span-1 lg:col-span-9 flex flex-col relative group order-1 lg:order-0">
                {/* 边框装饰 - 仅在大屏显示 */}
                <div
                    className="hidden lg:block absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-slate-800 z-10"/>
                <div
                    className="hidden lg:block absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-slate-800 z-10"/>

                <div
                    className="flex-1 bg-slate-100/80 backdrop-blur-sm border-4 border-slate-800 rounded-2xl shadow-[10px_10px_0px_rgba(0,0,0,0.15)] lg:shadow-[10px_10px_0px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col">
                    <GameBoard
                        gameState={session.gameState}
                        players={currentPlayerList}
                        spectators={session.spectators}
                        userInfo={userInfo}
                        roundWinner={session.roundWinner}
                        isInRoom={session.isInRoom}
                        isUserReady={session.isUserReady}
                        onToggleReady={session.toggleReady}
                        onPlayCard={session.playCard}
                        roomId={session.roomId}
                        isConnected={session.isConnected}
                    />
                </div>
            </div>

            {/* 控制面板与信息 */}
            <div
                className="col-span-1 lg:col-span-3 flex flex-col gap-4 md:gap-6 h-full flex-1 min-h-0 order-2 lg:order-0 max-h-[40vh] lg:max-h-none overflow-y-auto lg:overflow-visible">
                <SidePanel
                    session={session}
                    chat={chat}
                    userInfo={userInfo}
                    players={currentPlayerList}
                    playerLatencies={session.playerLatencies}
                />
            </div>

            {/* 游戏结算弹窗 */}
            <GameEndModal
                isOpen={!!session.gameEndData}
                onClose={() => session.setGameEndData?.(null)}
                onReady={session.toggleReady}
                gameEndData={session.gameEndData}
                players={currentPlayerList}
                selfId={userInfo.userId}
            />
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={
            <div className="h-screen w-full bg-slate-300 flex items-center justify-center">
                <Spinner size="lg"/>
            </div>
        }>
            <WebSocketProvider>
                <GameRoomInner />
            </WebSocketProvider>
        </Suspense>
    );
}
