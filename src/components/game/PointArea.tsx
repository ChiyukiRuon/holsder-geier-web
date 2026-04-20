'use client';

import { Badge } from "@heroui/react";
import PointCard from "@/components/PointCard";
import { GameState } from "@/types";

interface PointAreaProps {
    gameState: GameState | null;
}

function PointDeckBack({ count }: { count: number }) {
    return (
        <div className="relative transition-transform hover:-translate-y-1">
            <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-xl bg-slate-300/50"/>
            <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 rounded-xl bg-slate-400/50"/>

            <Badge.Anchor>
                <div className="relative overflow-hidden rounded-xl shadow-lg ring-1 ring-black/5">
                    <PointCard cardFace="back" width={112} height={160}/>
                </div>
                <Badge
                    color="default"
                    placement={"bottom-right"}
                    className="
                        bg-slate-900 text-white
                        border-4 border-dashed border-slate-400
                        w-10 h-10 rounded-full
                        shadow-[0_4px_0_#000,0_8px_15px_rgba(0,0,0,0.5)]
                        flex items-center justify-center"
                >
                    <Badge.Label className="font-bold">{count}</Badge.Label>
                </Badge>
            </Badge.Anchor>
        </div>
    );
}

function PointCardStack({ cards }: { cards: number[] }) {
    const filteredCards = cards.filter(card => card !== 0);

    if (!filteredCards || filteredCards.length === 0) return null;

    return (
        <div
            className="relative flex items-center"
            style={{
                width: 112 + (filteredCards.length - 1) * 32,
                height: 168
            }}
        >
            {filteredCards.map((v, i) => (
                <div
                    key={i}
                    className="absolute transition-all duration-300 ease-out hover:-translate-y-4 hover:z-50 cursor-pointer"
                    style={{
                        left: i * 32,
                        zIndex: i,
                    }}
                >
                    <div className="rounded-xl shadow-md hover:shadow-2xl ring-1 ring-black/5">
                        <PointCard cardFace="front" value={v} width={112} height={160}/>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function PointArea({ gameState }: PointAreaProps) {
    const deckCount = Math.max(gameState ? 15 - gameState.currentRound : 15, 0);

    return (
        <div className="flex flex-col items-center justify-center gap-4 md:gap-20 py-4 md:py-8 px-6 md:px-12 rounded-3xl bg-slate-50/40 backdrop-blur-sm border-2 border-slate-200/60 shadow-inner relative">
            {/* 背景水印 */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none text-4xl md:text-8xl font-black">
                BOARD
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-20 w-full md:w-auto">

                {/* 牌堆显示区域 */}
                <div className="flex flex-col items-center gap-2 md:gap-3">
                    {/* 桌面端：显示卡牌视觉效果 */}
                    <div className="hidden md:block">
                        <PointDeckBack count={deckCount} />
                    </div>

                    {/* 移动端/窄屏：显示文字形式，节省高度 */}
                    {gameState && (
                        <div className="block md:hidden bg-slate-200/50 px-4 py-1.5 rounded-full border border-slate-300/50 shadow-sm">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                剩余: <span className="text-slate-900 text-sm">{deckCount}</span>
                            </p>
                        </div>
                    )}
                </div>

                {/* 分隔线 */}
                <div className="hidden md:block h-24 w-0.5 bg-slate-300/50"/>
                {/*<div className="block md:hidden w-full h-px bg-linear-to-r from-transparent via-slate-300/50 to-transparent"/>*/}

                {/* 当前点数牌区域 */}
                <div className="flex flex-col items-center gap-2 md:gap-3">
                    <div className="transform scale-90 md:scale-100">
                        <PointCardStack
                            cards={[
                                ...(gameState?.carriedOverCards || []),
                                gameState?.currentPointCard ?? 0
                            ]}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
