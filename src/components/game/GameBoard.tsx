'use client';

import PointArea from "./PointArea";
import PlayArea from "./PlayArea";
import HistoryArea from "./HistoryArea";
import HandArea from "./HandArea";
import { GameState, PlayerInfo, UserInfo } from "@/types";
import { getGameStageName } from "@/utils/game";
import { useRef, useState } from "react";

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
    const centerAreaRef = useRef<HTMLDivElement>(null);

    const [isPlayAreaHover, setIsPlayAreaHover] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const [mobileView, setMobileView] = useState<'current' | 'history'>('current');

    return (
        <>
            {/* 游戏区顶部状态栏 */}
            <div className="h-10 md:h-12 bg-slate-800 flex items-center justify-between px-4 md:px-6 shrink-0">
                <div className="flex items-center gap-2 md:gap-3">
                    <div
                        className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}
                    />
                    <span className="text-white text-[10px] md:text-xs font-black tracking-widest uppercase italic">
                        Room{roomId ? `#${roomId}` : ''}
                    </span>
                </div>
                <div className="flex gap-2 md:gap-4">
                    <div className="text-amber-400 font-mono text-xs md:text-sm font-black">
                        ROUND {gameState?.currentRound ?? 0} - {getGameStageName(gameState?.stage)}
                    </div>
                </div>
            </div>

            <div className="flex-1 h-full flex flex-col gap-2 md:gap-4 p-2 md:p-8 overflow-hidden">
                {/* 得分牌展示区 */}
                <div className="shrink-0">
                    <PointArea gameState={gameState} />
                </div>

                {/* 中间切换区域 */}
                <div
                    className={`flex-1 flex flex-col min-h-0 relative transition-all duration-300 ease-out rounded-2xl border-2
                        ${isPlayAreaHover
                        ? 'border-emerald-400/50 bg-emerald-500/5 scale-[1.02] z-10'
                        : isDragging
                            ? 'border-blue-400/40 bg-blue-500/5 scale-[1.01]'
                            : 'border-transparent bg-transparent'}`}
                    ref={centerAreaRef}
                    style={{
                        boxShadow: isPlayAreaHover
                            ? '0 0 30px -5px rgba(52, 211, 153, 0.3), inset 0 0 20px rgba(52, 211, 153, 0.1)'
                            : isDragging
                                ? '0 0 20px -5px rgba(96, 165, 250, 0.25), inset 0 0 15px rgba(96, 165, 250, 0.08)'
                                : 'none',
                    }}
                >

                    {/* 拖拽提示层 */}
                    {(isPlayAreaHover || isDragging) && (
                        <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
                             <span className={`font-bold text-sm md:text-lg drop-shadow-sm
                                ${isPlayAreaHover ? 'text-emerald-400' : 'text-blue-400'}`}>
                                {isPlayAreaHover ? '松手出牌' : '拖拽到此处'}
                             </span>
                        </div>
                    )}

                    {/* 移动端切换开关 */}
                    <div className="md:hidden flex justify-center py-1">
                        <div className="bg-slate-200/50 p-1 rounded-xl flex gap-1 border border-slate-300/50">
                            <button
                                onClick={() => setMobileView('current')}
                                className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase transition-all 
                                    ${mobileView === 'current' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                            >
                                Current
                            </button>
                            <button
                                onClick={() => setMobileView('history')}
                                className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase transition-all 
                                    ${mobileView === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                            >
                                History
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center min-h-0">
                        <div className={`${mobileView === 'current' ? 'flex' : 'hidden md:flex'} flex-col flex-1 min-h-0 justify-center`}>
                            <PlayArea
                                gameState={gameState}
                                players={players}
                                roundWinner={roundWinner}
                                playAreaRef={playAreaRef}
                            />
                        </div>

                        <div className={`${mobileView === 'history' ? 'block' : 'hidden md:block'} mt-2`}>
                            <HistoryArea
                                gameState={gameState}
                                players={players}
                            />
                        </div>
                    </div>
                </div>

                {/* 手牌区 */}
                <div className="shrink-0">
                    <HandArea
                        gameState={gameState}
                        players={players}
                        spectators={spectators}
                        userInfo={userInfo}
                        isInRoom={isInRoom}
                        isUserReady={isUserReady}
                        onToggleReady={onToggleReady}
                        onPlayCard={onPlayCard}
                        centerAreaRef={centerAreaRef}
                        setIsPlayAreaHover={setIsPlayAreaHover}
                        setIsDragging={setIsDragging}
                    />
                </div>
            </div>
        </>
    );
}
