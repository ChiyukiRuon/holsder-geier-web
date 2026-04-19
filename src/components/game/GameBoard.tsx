'use client';

import PointArea from "./PointArea";
import PlayArea from "./PlayArea";
import HistoryArea from "./HistoryArea";
import HandArea from "./HandArea";
import { GameState, PlayerInfo, UserInfo } from "@/types";
import { getGameStageName } from "@/utils/game";
import {useRef, useState} from "react";

interface GameBoardProps {
    gameState: GameState | null;
    players: PlayerInfo[];
    spectators?: PlayerInfo[];
    userInfo: UserInfo | null;
    roundWinner: PlayerInfo | null;
    isInRoom: boolean;
    isUserReady: boolean;
    onToggleReady: () => void;
    onPlayCard: (card: number) => void;
    roomId?: string;
    isConnected?: boolean;
}

export default function GameBoard({
                                      gameState,
                                      players,
                                      spectators = [],
                                      userInfo,
                                      roundWinner,
                                      isInRoom,
                                      isUserReady,
                                      onToggleReady,
                                      onPlayCard,
                                      roomId = '',
                                      isConnected = false
                                  }: GameBoardProps) {
    const playAreaRef = useRef<HTMLDivElement>(null);

    const [isPlayAreaHover, setIsPlayAreaHover] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    return (
        <>
            {/* 游戏区顶部状态栏 */}
            <div className="h-10 md:h-12 bg-slate-800 flex items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-2 md:gap-3">
                    <div
                        className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}
                    />
                    <span
                        className="text-white text-[10px] md:text-xs font-black tracking-widest uppercase italic"
                    >
                        Room{roomId ? `#${roomId}` : ''}
                    </span>
                </div>
                <div className="flex gap-2 md:gap-4">
                    <div
                        className="text-amber-400 font-mono text-xs md:text-sm font-black"
                    >
                        ROUND {gameState?.currentRound ?? 0} - {getGameStageName(gameState?.stage)}
                    </div>
                </div>
            </div>

            <div className="flex-1 h-full flex flex-col gap-3 md:gap-4 p-4 md:p-8 overflow-hidden">
                {/* 桌面区 */}
                <div className="flex-1 flex flex-col gap-4 md:gap-6 min-h-0">
                    {/* 得分牌展示区 */}
                    <PointArea gameState={gameState} />

                    {/* 出牌区 */}
                    <PlayArea
                        gameState={gameState}
                        players={players}
                        roundWinner={roundWinner}
                        playAreaRef={playAreaRef}
                        isHover={isPlayAreaHover}
                        isDragging={isDragging}
                    />

                    {/* 弃牌区 */}
                    <HistoryArea
                        gameState={gameState}
                        players={players}
                    />
                </div>

                {/* 手牌区 */}
                <HandArea
                    gameState={gameState}
                    players={players}
                    spectators={spectators}
                    userInfo={userInfo}
                    isInRoom={isInRoom}
                    isUserReady={isUserReady}
                    onToggleReady={onToggleReady}
                    onPlayCard={onPlayCard}
                    playAreaRef={playAreaRef}
                    setIsPlayAreaHover={setIsPlayAreaHover}
                    setIsDragging={setIsDragging}
                />
            </div>
        </>
    );
}
