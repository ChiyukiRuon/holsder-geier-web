import { useCallback, useState } from 'react';
import { wsManager } from '@/lib/ws';
import type { WSMessage, ServerMessage, UserInfo } from '@/types';

/**
 * 使用 WebSocket 连接的 Hook
 * @param options 连接选项
 * @returns WebSocket 状态和控制方法
 */
export function useWebSocket(options: {
  roomId: string;
  userId: string;
  userInfo?: UserInfo;
  autoConnect?: boolean;
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<ServerMessage | null>(null);

  const { roomId, userId, userInfo, autoConnect = true } = options;

  // 连接 WebSocket
  const connect = useCallback(() => {
    wsManager.connect({
      roomId,
      userId,
      userInfo,
      onOpen: () => setIsConnected(true),
      onClose: () => setIsConnected(false),
      onMessage: (message) => setLastMessage(message as ServerMessage),
    });
  }, [roomId, userId, userInfo]);

  // 断开连接
  const disconnect = useCallback(() => {
    wsManager.disconnect();
    setIsConnected(false);
  }, []);

  // 自动连接
  if (autoConnect) {
    connect();
  }

  // 订阅消息
  const subscribe = useCallback(<T = unknown>(
    type: string,
    handler: (data: T) => void
  ) => {
    return wsManager.on<T>(type, handler);
  }, []);

  // 发送用户更新
  const updateUser = useCallback((payload: { nickname?: string; avatar?: string; background?: string }) => {
    wsManager.updateUser(payload);
  }, []);

  // 创建房间
  const createRoom = useCallback((roomId: string, user: UserInfo) => {
    wsManager.createRoom(roomId, user);
  }, []);

  // 加入房间
  const joinRoom = useCallback((roomId: string, user: UserInfo, reconnect = false) => {
    wsManager.joinRoom(roomId, user, reconnect);
  }, []);

  // 离开房间
  const leaveRoom = useCallback(() => {
    wsManager.leaveRoom();
  }, []);

  // 获取房间列表
  const getRoomList = useCallback(() => {
    wsManager.getRoomList();
  }, []);

  // 设置准备状态
  const setReady = useCallback((ready: boolean) => {
    wsManager.setReady(ready);
  }, []);

  // 获取游戏状态
  const getGameStage = useCallback(() => {
    wsManager.getGameStage();
  }, []);

  // 发送游戏动作
  const sendGameAction = useCallback((actionId: string, actionType: string, data: { card: number }) => {
    wsManager.sendGameAction(actionId, actionType, data);
  }, []);

  // 发送聊天消息
  const sendChatMessage = useCallback((message: string) => {
    wsManager.sendChatMessage(message);
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
    getRoomList,
    setReady,
    getGameStage,
    sendGameAction,
    sendChatMessage,
  };
}
