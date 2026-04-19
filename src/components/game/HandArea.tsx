'use client';

import { DynamicHand } from "@/components/DynamicHand";
import { GameState, PlayerInfo, UserInfo } from "@/types";
import { Button } from "@heroui/react";
import Eye from "@/components/icons/Eye";
import React from "react";

interface HandAreaProps {
    gameState: GameState | null;
    players: PlayerInfo[];
    spectators?: PlayerInfo[];
    userInfo: UserInfo | null;
    isInRoom: boolean;
    isUserReady: boolean;
    onToggleReady: () => void;
    onPlayCard: (card: number) => void;
    playAreaRef?: React.RefObject<HTMLDivElement | null>;
    setIsPlayAreaHover?: (v: boolean) => void;
    setIsDragging?: (v: boolean) => void;
}

export default function HandArea({
                                     gameState,
                                     players,
                                     spectators = [],
                                     userInfo,
                                     isInRoom,
                                     isUserReady,
                                     onToggleReady,
                                     onPlayCard,
                                     playAreaRef,
                                     setIsPlayAreaHover,
                                     setIsDragging
                                 }: HandAreaProps) {
    if (!isInRoom) return null;

    const self = players.find((p) => p.user.userId === userInfo?.userId)
        ?? spectators.find((p) => p.user.userId === userInfo?.userId);

    const isPlaying =
        gameState !== null &&
        gameState.stage !== "idle" &&
        gameState.stage !== "end";

    // 优先判断旁观者状态
    if (self?.role === 'spectator') {
        return (
            <div className="h-36 md:h-48 flex-none relative z-50">
                <div className="absolute -inset-x-8 top-12 -bottom-8 bg-linear-to-t from-slate-900/10 to-transparent pointer-events-none"/>
                <div className="flex flex-col gap-2 items-center justify-center h-full animate-in fade-in zoom-in duration-300">
                    <div
                        className="px-6 py-3 bg-slate-700 text-white rounded-xl border-[3px] border-slate-600 shadow-[4px_4px_0px_rgba(0,0,0,0.2)]"
                    >
                        <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            观战中 SPECTATING
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // 游戏进行中且用户信息存在
    if (isPlaying && userInfo) {
        return (
            <div className="h-36 md:h-48 flex-none relative z-50">
                <div className="absolute -inset-x-8 top-12 -bottom-8 bg-linear-to-t from-slate-900/10 to-transparent pointer-events-none"/>
                <div className="h-full flex items-end justify-center">
                    <DynamicHand
                        cards={self?.card ?? []}
                        user={userInfo}
                        onCardPlayAction={onPlayCard}
                        playAreaRef={playAreaRef}
                        setIsPlayAreaHover={setIsPlayAreaHover}
                        setIsDragging={setIsDragging}
                    />
                </div>
            </div>
        );
    }

    // 准备/取消准备状态
    return (
        <div className="h-36 md:h-48 flex-none relative z-50">
            <div className="absolute -inset-x-8 top-12 -bottom-8 bg-linear-to-t from-slate-900/10 to-transparent pointer-events-none"/>
            <div className="h-full flex items-center justify-center animate-in fade-in zoom-in duration-300">
                {isUserReady ? (
                    <Button
                        className="relative group transition-all duration-200 active:translate-y-1"
                        style={{
                            height: '40px',
                            padding: '0 30px',
                            backgroundColor: '#f43f5e',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: '900',
                            letterSpacing: '0.15em',
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 0 0 #be123c, 0 8px 15px -5px rgba(244, 63, 94, 0.4)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textTransform: 'uppercase'
                        }}
                        onClick={() => {
                            onToggleReady();
                        }}
                    >
                        <span className="relative z-10">取消 CANCEL</span>
                        <div
                            className="absolute inset-0 rounded-3xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"/>
                    </Button>
                ) : (
                    <Button
                        className="relative group transition-all duration-200 active:translate-y-1"
                        style={{
                            height: '40px',
                            padding: '0 30px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: '900',
                            letterSpacing: '0.15em',
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 0 0 #2563eb, 0 8px 15px -5px rgba(59, 130, 246, 0.5)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textTransform: 'uppercase'
                        }}
                        onClick={() => {
                            onToggleReady();
                        }}
                    >
                        <span className="relative z-10">准备 READY</span>
                        <div
                            className="absolute inset-0 rounded-12px bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"/>
                    </Button>
                )}
            </div>
        </div>
    );
}
