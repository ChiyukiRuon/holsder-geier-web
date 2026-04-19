'use client';

import { Button, Input, Spinner, toast } from "@heroui/react";
import { PlayerInfo, UserInfo } from "@/types";
import type { useGameSession } from "@/hooks/useGameSession";

interface RoomControlsProps {
    session: ReturnType<typeof useGameSession>;
    userInfo: UserInfo | null;
}

export default function RoomControls({ session, userInfo }: RoomControlsProps) {
    const {
        isInRoom,
        roomId,
        setRoomId,
        handleJoinRoom,
        handleLeaveRoom,
        handleRoleChange,
        players,
        isConnected,
        isJoining,
        isUserReady,
        gameState
    } = session;

    const self = players.find((p: PlayerInfo) => p.user.userId === userInfo?.userId);
    const isGameStarted = gameState !== null && gameState.stage !== "idle" && gameState.stage !== "end";

    return (
        <div className="flex-none bg-white border-[3px] border-slate-800 rounded-2xl shadow-[6px_6px_0px_rgba(0,0,0,0.1)] p-3 md:p-4">
            <div className="text-[10px] font-black text-slate-400 mb-2 md:mb-3 uppercase tracking-tight">
                Room
            </div>

            {isInRoom ? (
                <div className="space-y-2 md:space-y-3">
                    <div className="flex gap-2">
                        <Button
                            className="w-full font-black text-xs uppercase tracking-wider"
                            style={{
                                height: '36px',
                                backgroundColor: '#f59e0b',
                                color: 'white',
                                border: '2px solid #d97706',
                                boxShadow: '0 2px 0 0 #b45309',
                            }}
                            onPress={() => {
                                const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
                                navigator.clipboard.writeText(currentUrl ? `${currentUrl}?join=${roomId}` : roomId).then(() => {
                                    toast.success(`已复制房间${currentUrl ? "链接" : "号"}`);
                                }).catch((e) => {
                                    console.error(e);
                                    toast.danger("分享失败");
                                });
                            }}
                        >
                            分享
                        </Button>
                        {self?.role === "player" ? (
                            <Button
                                className="w-full font-black text-xs uppercase tracking-wider"
                                style={{
                                    height: '36px',
                                    backgroundColor: '#8b5cf6',
                                    color: 'white',
                                    border: '2px solid #7c3aed',
                                    boxShadow: '0 2px 0 0 #6d28d9',
                                }}
                                onClick={() => handleRoleChange("spectator")}
                                isDisabled={isGameStarted || isUserReady}
                            >
                                观战
                            </Button>
                        ) : (
                            <Button
                                className="w-full font-black text-xs uppercase tracking-wider"
                                style={{
                                    height: '36px',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: '2px solid #059669',
                                    boxShadow: '0 2px 0 0 #047857',
                                }}
                                onClick={() => handleRoleChange("player")}
                                isDisabled={isGameStarted}
                            >
                                游玩
                            </Button>
                        )}
                        <Button
                            className="w-full font-black text-xs uppercase tracking-wider"
                            style={{
                                height: '36px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: '2px solid #dc2626',
                                boxShadow: '0 2px 0 0 #b91c1c',
                            }}
                            onPress={handleLeaveRoom}
                        >
                            离开
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-2 md:space-y-3">
                    <div className="flex gap-2">
                        <Input
                            placeholder="房间 ID"
                            className="flex-1"
                            style={{
                                height: '36px',
                            }}
                            value={roomId}
                            onChange={(e) => setRoomId?.(e.target.value)}
                        />
                        <Button
                            className="font-black text-xs uppercase tracking-wider"
                            style={{
                                height: '36px',
                                minWidth: '70px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: '2px solid #2563eb',
                            }}
                            onPress={() => handleJoinRoom(roomId)}
                            isDisabled={!roomId.trim() || !isConnected}
                            isPending={isJoining}
                        >
                            {isJoining ? <Spinner color="current" size="sm"/> : null}
                            加入
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
