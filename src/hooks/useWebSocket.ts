import {useCallback, useEffect, useState} from 'react';
import { wsManager } from '@/lib/ws';
import type { ServerMessage, UserInfo } from '@/types';
import {userInfo} from "os";

/**
 * 使用 WebSocket 连接的 Hook
 * @param options 连接选项
 * @returns WebSocket 状态和控制方法
 */
export function useWebSocket(options: {
    autoConnect?: boolean;
}) {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<ServerMessage | null>(null);

    const { autoConnect = true } = options;

    // 连接 WebSocket
    const connect = useCallback(() => {
        wsManager.connect({
            onOpen: () => setIsConnected(true),
            onClose: () => setIsConnected(false),
            onMessage: (message) => setLastMessage(message as ServerMessage),
        });
    }, []);

    // 断开连接
    const disconnect = useCallback(() => {
        wsManager.disconnect();
        setIsConnected(false);
    }, []);

    useEffect(() => {
        if (autoConnect && !wsManager.isConnected()) {
            connect();
        }

        return () => {
            if (!autoConnect) {
                disconnect();
            }
        };
    }, [autoConnect, connect, disconnect]);

    // 订阅消息
    const subscribe = useCallback(<T = unknown>(
        type: string,
        handler: (data: T) => void
    ) => {
        return wsManager.on<T>(type, handler);
    }, []);

    // 发送用户更新
    const updateUser = useCallback((payload: UserInfo) => {
        return wsManager.updateUser(payload);
    }, []);

    // 创建房间
    const createRoom = useCallback((roomId: string, user: UserInfo) => {
        return wsManager.createRoom(roomId, user);
    }, []);

    // 加入房间
    const joinRoom = useCallback((roomId: string, user: UserInfo, reconnect = false) => {
        return wsManager.joinRoom(roomId, user, reconnect);
    }, []);

    // 离开房间
    const leaveRoom = useCallback(() => {
        return wsManager.leaveRoom();
    }, []);

    // 设置准备状态
    const setReady = useCallback((ready: boolean) => {
        return wsManager.setReady(ready);
    }, []);

    // 发送游戏动作
    const sendGameAction = useCallback((actionId: string, actionType: string, data: { card: number }) => {
        return wsManager.sendGameAction(actionId, actionType, data);
    }, []);

    // 发送聊天消息
    const sendChatMessage = useCallback((message: string, userInfo: UserInfo) => {
        return wsManager.sendChatMessage(message, userInfo);
    }, []);

    return {
        isConnected,
        lastMessage,
        connect,
        disconnect,
        subscribe,
        updateUser,
        createRoom,
        joinRoom,
        leaveRoom,
        setReady,
        sendGameAction,
        sendChatMessage,
    };
}
