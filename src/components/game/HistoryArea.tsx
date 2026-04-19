'use client';

import { PlayAreaCard } from "@/components/PlayAreaCard";
import { GameState, PlayerInfo } from "@/types";

interface HistoryAreaProps {
    gameState: GameState | null;
    players: PlayerInfo[];
}

export default function HistoryArea({ gameState, players }: HistoryAreaProps) {
    const lastPlayedCards = players
        .map((player) => {
            const played = gameState?.lastPlayedCards?.find(
                (i) => i.playerId === player.user.userId
            );
            return {
                user: player.user,
                card: played?.card ?? null
            };
        })
        .filter((i) => i.card !== null);

    return (
        <div className="flex flex-col gap-2 mt-auto">
            {/* 标签区域 */}
            <div className="flex items-center gap-2 px-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400"/>
                <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    History
                </span>
            </div>

            {/* 卡牌展示容器 */}
            <div className="rounded-2xl bg-slate-200/30 border-2 border-dashed border-slate-300/50">
                <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-center gap-4 md:gap-8 overflow-x-auto min-h-20 md:min-h-25">
                    {lastPlayedCards.length > 0 ? (
                        lastPlayedCards.map((player) => (
                            <div key={player.user.userId}
                                 className="scale-50 md:scale-75 opacity-80 hover:opacity-100 transition-opacity">
                                <PlayAreaCard
                                    user={player.user}
                                    cardFace={"front"}
                                    card={player.card ?? undefined}
                                />
                            </div>
                        ))
                    ) : (
                        <span className="text-[8px] md:text-[10px] font-bold text-slate-300 italic uppercase">
                            No cards discarded yet
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
