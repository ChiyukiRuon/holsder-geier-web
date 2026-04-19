'use client';

import { useCallback, useEffect, useState } from 'react';
import type {
    RoomInfo,
    PlayerInfo,
    RoomRole,
    RoomUpdateMessage,
    UserInfo,
    PlayerLatency,
    ServerPingMessage,
    GameState,
    GameEndMessage,
    GameStartMessage,
    GameStateMessage,
    GameResolveMessage,
    GameSyncMessage,
} from '@/types';
import { useWS } from "@/components/providers/WebSocketProvider";
import { toast } from "@heroui/react";

export function useGameSession(userInfo: UserInfo | null) {
    const {
        isConnected,
        serverInfo,
        subscribe,
        joinRoom,
        leaveRoom,
        changeRole,
        setReady,
        updateUser,
        sendGameAction,
    } = useWS();

    // 房间状态
    const [roomId, setRoomId] = useState('');
    const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
    const [players, setPlayers] = useState<PlayerInfo[]>([]);
    const [spectators, setSpectators] = useState<PlayerInfo[]>([]);
    const [playerLatencies, setPlayerLatencies] = useState<PlayerLatency[]>([]);
    const [isInRoom, setIsInRoom] = useState(false);
    const [isUserReady, setIsUserReady] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    // 游戏状态
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [roundWinner, setRoundWinner] = useState<PlayerInfo | null>(null);
    const [gameEndData, setGameEndData] = useState<GameEndMessage['payload'] | null>(null);

    // 加入房间
    const handleJoinRoom = useCallback((id: string) => {
        if (!userInfo || !id.trim()) return;

        setIsJoining(true);
        joinRoom(id, userInfo).then(() => {
            setRoomId(id);
            setIsInRoom(true);
        }).catch(err => {
            console.error('join room error', err);
            toast.danger(`加入房间失败: ${err.message}`, { timeout: 5000 });
        }).finally(() => {
            setIsJoining(false);
        });
    }, [joinRoom, userInfo]);

    // 离开房间
    const handleLeaveRoom = useCallback(() => {
        leaveRoom().then(() => {
            setIsInRoom(false);
            setIsUserReady(false);
            setPlayers([]);
            setRoomId('');
            setRoomInfo(null);
            setSpectators([]);
            setGameState(null);
            setRoundWinner(null);
            setGameEndData(null);
        }).catch(err => {
            console.error('leave room error', err);
            toast.danger(`离开房间失败: ${err.message}`, { timeout: 5000 });
        });
    }, [leaveRoom]);

    // 切换角色
    const handleRoleChange = useCallback((role: RoomRole) => {
        changeRole(role).catch(err => {
            console.error('change role error', err);
            toast.danger(`切换失败: ${err.message}`, { timeout: 5000 });
        });
    }, [changeRole]);

    // 准备状态
    const toggleReady = useCallback(() => {
        setReady(!isUserReady).then(() => {
            setIsUserReady(prev => !prev);
        }).catch(err => {
            console.error('set ready error', err);
            toast.danger(`出现错误: ${err.message}`, { timeout: 5000 });
        });
    }, [setReady, isUserReady]);

    // 出牌
    const playCard = useCallback((card: number) => {
        sendGameAction(card).catch(err => {
            console.error('send game action error', err);
            toast.danger(`出现错误: ${err.message}`, { timeout: 5000 });
        });
    }, [sendGameAction]);

    // WebSocket 订阅
    useEffect(() => {
        if (!isConnected) return;

        const unSubscribes = [
            // 房间更新
            subscribe<RoomUpdateMessage['payload']>('room.update', (data) => {
                setRoomInfo(data.room);
                setPlayers(data.room.players);
                setSpectators(data.room.spectators);
            }),

            // 服务器心跳
            subscribe<ServerPingMessage['payload']>('server.ping', (ping) => {
                if (ping.latencies) {
                    setPlayerLatencies(ping.latencies);
                }
            }),

            // 游戏开始
            subscribe<GameStartMessage['payload']>('game.start', (data) => {
                setGameState(data.state);
                setPlayers(data.players);
                setSpectators(data.spectators);
                setRoundWinner(null);
                setGameEndData(null);
                setIsUserReady(false);
            }),

            // 游戏状态更新
            subscribe<GameStateMessage['payload']>('game.state', (data) => {
                setGameState(data.state);
                setPlayers(data.players);
                setSpectators(data.spectators);
                setRoundWinner(null);
                setIsUserReady(false);
            }),

            // 回合结算
            subscribe<GameResolveMessage['payload']>('game.resolve', (data) => {
                setGameState(data.state);
                setPlayers(data.players);
                setSpectators(data.spectators);
                setRoundWinner(data.roundWinner);
                setIsUserReady(false);
            }),

            // 游戏结束
            subscribe<GameEndMessage['payload']>('game.end', (data) => {
                setGameState(data.state);
                setPlayers(data.players);
                setSpectators(data.spectators);
                setGameEndData(data);
                setIsUserReady(false);
            }),

            // 游戏同步（其他玩家出牌）
            subscribe<GameSyncMessage['payload']>('game.sync', (data) => {
                const { player, card } = data.action;

                setGameState(prev => {
                    if (!prev) return prev;

                    const updatedPlayedCards = [...prev.playedCards];
                    const existingIndex = updatedPlayedCards.findIndex(
                        item => item.playerId === player.user.userId
                    );

                    if (existingIndex >= 0) {
                        updatedPlayedCards[existingIndex] = { playerId: player.user.userId, card };
                    } else {
                        updatedPlayedCards.push({ playerId: player.user.userId, card });
                    }

                    return {
                        ...prev,
                        playedCards: updatedPlayedCards
                    };
                });

                setPlayers(prevPlayers =>
                    prevPlayers.map(p =>
                        p.user.userId === player.user.userId ? player : p
                    )
                );
            })
        ];

        return () => unSubscribes.forEach(fn => fn());
    }, [isConnected, subscribe]);

    return {
        // 连接状态
        isConnected,
        serverInfo,

        // 房间状态
        roomId,
        roomInfo,
        players,
        spectators,
        playerLatencies,
        isInRoom,
        isUserReady,
        isJoining,

        // 游戏状态
        gameState,
        roundWinner,
        gameEndData,

        // 操作方法
        setRoomId,
        handleJoinRoom,
        handleLeaveRoom,
        handleRoleChange,
        toggleReady,
        updateUser,
        playCard,
        setGameEndData,
    };
}
