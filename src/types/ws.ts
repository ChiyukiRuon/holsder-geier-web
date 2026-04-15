import type { WSMessage } from './ws-messages';
import type { UserInfo } from './base';

// 事件处理器类型
export type WSEventHandler<T = unknown> = (data: T) => void;

// WebSocket 连接选项
export interface WSConnectionOptions {
    roomId: string;
    userId: string;
    userInfo?: UserInfo;
    onMessage?: (message: WSMessage) => void;
    onError?: (error: Event) => void;
    onClose?: (event: CloseEvent) => void;
    onOpen?: () => void;
    reconnect?: boolean;
    reconnectAttempts?: number;
    reconnectInterval?: number;
}