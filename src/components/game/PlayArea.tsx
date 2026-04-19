'use client';

import {PlayAreaCard} from "@/components/PlayAreaCard";
import {GameState, PlayerInfo} from "@/types";
import React, {useRef} from "react";

interface PlayAreaProps {
    gameState: GameState | null;
    players: PlayerInfo[];
    roundWinner: PlayerInfo | null;
    playAreaRef?: React.RefObject<HTMLDivElement | null>;
    isHover?: boolean;
    isDragging?: boolean;
}

export default function PlayArea({gameState, players, roundWinner, playAreaRef, isHover, isDragging}: PlayAreaProps) {
    const internalRef = useRef<HTMLDivElement>(null);
    const ref = playAreaRef ?? internalRef;

    const playedCards = (() => {
        if (!gameState) return players.map(player => ({user: player.user, card: null}));

        return players.map(player => {
            const playedCard = gameState.playedCards.find(
                item => item.playerId === player.user.userId
            );
            return {
                user: player.user,
                card: playedCard?.card ?? null
            };
        });
    })();

    return (
        <div
            className={`flex-1 flex flex-col items-center justify-center relative min-h-32 md:min-h-45 
                transition-all duration-300 ease-out rounded-2xl border-2
                ${isHover
                ? 'border-emerald-400/50 bg-emerald-500/5 scale-[1.02] z-10'
                : isDragging
                    ? 'border-blue-400/40 bg-blue-500/5 scale-[1.01]'
                    : 'border-transparent bg-transparent'}`}
            ref={ref}
            style={{
                boxShadow: isHover
                    ? '0 0 30px -5px rgba(52, 211, 153, 0.3), inset 0 0 20px rgba(52, 211, 153, 0.1)'
                    : isDragging
                        ? '0 0 20px -5px rgba(96, 165, 250, 0.25), inset 0 0 15px rgba(96, 165, 250, 0.08)'
                        : 'none',
            }}
        >
            {/* Hover 顶部标签 */}
            <div className={`absolute top-2 text-[8px] md:text-[10px] font-black tracking-[0.3em] uppercase transition-colors
                ${isHover ? 'text-emerald-400 animate-pulse' : isDragging ? 'text-blue-400' : 'text-slate-400'}`}>
                {isHover ? 'Release to Play' : isDragging ? 'Drag Here' : 'CURRENT'}
            </div>

            {/* 卡牌展示区 */}
            <div className="flex gap-3 md:gap-6 items-center justify-center flex-wrap z-10">
                {playedCards.map((player) => {
                    return (
                        <div key={player.user.userId}
                             className={`
                                transition-all duration-300
                                ${isHover ? 'scale-75 md:scale-90 opacity-40 blur-[1px]' : 'scale-50 md:scale-75 opacity-80'}
                                hover:opacity-100 hover:blur-0
                             `}>
                            <PlayAreaCard
                                user={player.user}
                                cardFace={player.card !== null ? "front" : "waiting"}
                                card={player.card ?? undefined}
                                isHighlighted={roundWinner?.user.userId === player.user.userId && gameState?.stage === 'resolve'}
                            />
                        </div>
                    );
                })}
            </div>

            {/* 居中提示文字 */}
            {(isHover || isDragging) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                     <span className={`font-bold text-sm md:text-lg drop-shadow-sm
                        ${isHover ? 'text-emerald-400' : 'text-blue-400'}`}>
                        {isHover ? '松手出牌' : '拖拽到此处'}
                     </span>
                </div>
            )}
        </div>
    );
}
