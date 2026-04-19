'use client';

import { useCallback, useEffect, useState } from 'react';
import type { RoomInfo, PlayerInfo, RoomRole, RoomUpdateMessage, UserInfo, PlayerLatency, ServerPingMessage } from '@/types';
import {useWS} from "@/components/providers/WebSocketProvider";
import {toast} from "@heroui/react";

export function useRoomConnection(userInfo: UserInfo | null) {
    const {
        isConnected,
        serverInfo,
        subscribe,
        joinRoom,
        leaveRoom,
        changeRole,
        setReady,
        updateUser,
    } = useWS();

    const [roomId, setRoomId] = useState('');
    const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
    const [players, setPlayers] = useState<PlayerInfo[]>([]);
    const [spectators, setSpectators] = useState<PlayerInfo[]>([]);
    const [playerLatencies, setPlayerLatencies] = useState<PlayerLatency[]>([]);
    const [isInRoom, setIsInRoom] = useState(false);
    const [isUserReady, setIsUserReady] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    // 加入房间
    const handleJoinRoom = useCallback((id: string) => {
        if (!userInfo || !id.trim()) return;

        setIsJoining(true);
        joinRoom(id, userInfo).then(() => {
            setRoomId(id);
            setIsInRoom(true);
        }).catch(err => {
            console.error('join room error', err);
            toast.danger(`加入房间失败: ${err.message}`, {timeout: 5000});
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
        }).catch(err => {
            console.error('leave room error', err);
            toast.danger(`离开房间失败: ${err.message}`, {timeout: 5000});
        });
    }, [leaveRoom]);

    // 切换角色
    const handleRoleChange = useCallback((role: RoomRole) => {
        changeRole(role).catch(err => {
            console.error('change role error', err);
            toast.danger(`切换失败: ${err.message}`, {timeout: 5000});
        });
    }, [changeRole]);

    // 准备状态
    const toggleReady = useCallback(() => {
        setReady(!isUserReady).then(() => {
            setIsUserReady(prev => !prev);
        }).catch(err => {
            console.error('set ready error', err);
            toast.danger(`出现错误: ${err.message}`, {timeout: 5000});
        });
    }, [setReady, isUserReady]);

    // 房间更新订阅
    useEffect(() => {
        if (!isConnected) return;

        const unSubscribes = [
            subscribe<RoomUpdateMessage['payload']>('room.update', (data) => {
                setRoomInfo(data.room);
                setPlayers(data.room.players);
                setSpectators(data.room.spectators);
            }),

            subscribe<ServerPingMessage['payload']>('server.ping', (ping) => {
                if (ping.latencies) {
                    setPlayerLatencies(ping.latencies);
                }
            }),
        ];

        return () => unSubscribes.forEach(fn => fn());
    }, [isConnected, subscribe]);

    return {
        // 状态
        isConnected,
        serverInfo,
        roomId,
        roomInfo,
        players,
        spectators,
        playerLatencies,
        isInRoom,
        isUserReady,
        isJoining,

        // 操作
        setRoomId,
        handleJoinRoom,
        handleLeaveRoom,
        handleRoleChange,
        toggleReady,
        updateUser,
    };
}
