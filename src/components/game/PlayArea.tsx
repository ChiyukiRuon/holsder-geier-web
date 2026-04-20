'use client';

import {PlayAreaCard} from "@/components/PlayAreaCard";
import {GameState, PlayerInfo} from "@/types";
import React, {useRef} from "react";

interface PlayAreaProps {
    gameState: GameState | null;
    players: PlayerInfo[];
    roundWinner: PlayerInfo | null;
    playAreaRef?: React.RefObject<HTMLDivElement | null>;
}

export default function PlayArea({gameState, players, roundWinner, playAreaRef}: PlayAreaProps) {
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
            className="flex-1 flex flex-col items-center justify-center relative min-h-32 md:min-h-45"
            ref={ref}
        >
            {/* 顶部标签 */}
            <div className="absolute top-2 hidden md:flex items-center gap-2 text-[8px] md:text-[10px] font-black tracking-[0.3em] uppercase text-slate-400">
                CURRENT
            </div>

            {/* 卡牌展示区 */}
            <div className="flex gap-3 md:gap-6 items-center justify-center flex-wrap z-10">
                {playedCards.map((player) => {
                    return (
                        <div key={player.user.userId}
                             className="scale-50 md:scale-75 opacity-80 hover:opacity-100 transition-opacity">
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
        </div>
    );
}
