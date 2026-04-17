// 事件处理器类型
import {WSMessage} from "@/types/ws-messages";
import {PlayerInfo, SendChatMessage, UserInfo} from "@/types/base";
import {GameState} from "@/types/game";

export type WSEventHandler<T = unknown> = (data: T) => void;

// WebSocket 连接选项
export interface WSConnectionOptions {
    onMessage?: (message: WSMessage) => void;
    onError?: (error: Event) => void;
    onClose?: (event: CloseEvent) => void;
    onOpen?: () => void;
    reconnect?: boolean;
    reconnectAttempts?: number;
    reconnectInterval?: number;
}

export interface WSRequestMap {
    'user.update': UserInfo;
    'room.create': { roomId: string; user: UserInfo };
    'room.join': { roomId: string; user: UserInfo; reconnect?: boolean };
    'room.leave': Record<string, never>;
    'game.ready': { ready: boolean };
    'game.action': { actionId: string; actionType: string; data: { card: number } };
    'chat.send': SendChatMessage;
    'client.pong': { clientTime: number };
    'server.info': Record<string, never>;
}
