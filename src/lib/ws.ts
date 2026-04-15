import { API_CONFIG } from './axios';
import type {
    WSErrorCode,
    GameStage,
    RoomStatus,
    CardType,
    UserInfo,
    PlayerCard,
    PlayerPoint,
    PlayerGameState,
    RoomData,
    ScoreCard,
    GameState,
    ChatMessage,
    WSMessageBase,
    UserUpdateMessage,
    RoomCreateMessage,
    RoomJoinMessage,
    RoomLeaveMessage,
    RoomListMessage,
    GameReadyMessage,
    GameStageRequestMessage,
    GameActionMessage,
    ChatSendMessage,
    ServerInfoMessage,
    ServerAckMessage,
    ServerErrorMessage,
    RoomUpdateMessage,
    RoomListResponseMessage,
    GameStartMessage,
    GameStageResponseMessage,
    GameSyncMessage,
    GameResolveMessage,
    GameEndMessage,
    ChatReceiveMessage,
    ChatSyncMessage,
    ServerMessage,
    ClientMessage,
    WSMessage,
    WSEventHandler,
    WSConnectionOptions,
} from '@/types';

class WebSocketManager {
    private ws: WebSocket | null = null;
    private options: WSConnectionOptions | null = null;
    private eventHandlers: Map<string, Set<WSEventHandler>> = new Map();
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private shouldReconnect: boolean = true;
    private messageQueue: WSMessage[] = [];

    /**
     * 连接到游戏房间
     */
    connect(options: WSConnectionOptions): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.disconnect();
        }

        this.options = options;
        this.shouldReconnect = options.reconnect ?? true;

        const wsUrl = `${API_CONFIG.WS_URL}/ws?roomId=${options.roomId}&userId=${options.userId}`;

        try {
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.flushMessageQueue();
                options.onOpen?.();
            };

            this.ws.onmessage = (event) => {
                try {
                    const message: WSMessage = JSON.parse(event.data);
                    this.handleMessage(message);
                    options.onMessage?.(message);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                options.onError?.(error);
            };

            this.ws.onclose = (event) => {
                console.log('WebSocket closed:', event.code, event.reason);
                this.cleanup();
                options.onClose?.(event);

                if (this.shouldReconnect && this.options) {
                    this.scheduleReconnect();
                }
            };
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
        }
    }

    /**
     * 处理接收到的消息
     */
    private handleMessage(message: WSMessage): void {
        const handlers = this.eventHandlers.get(message.type);
        if (handlers) {
            handlers.forEach((handler) => {
                try {
                    handler(message.payload);
                } catch (error) {
                    console.error('Event handler error:', error);
                }
            });
        }
    }

    /**
     * 发送消息
     */
    send<T extends WSMessage>(message: T): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            // 队列消息，等待连接后发送
            this.messageQueue.push(message as WSMessage);
        }
    }

    /**
     * 更新用户信息
     */
    updateUser(payload: { nickname?: string; avatar?: string; background?: string }): void {
        this.send<UserUpdateMessage>({
            type: 'user.update',
            payload,
        });
    }

    /**
     * 创建房间
     */
    createRoom(roomId: string, user: UserInfo): void {
        this.send<RoomCreateMessage>({
            type: 'room.create',
            requestId: this.generateRequestId(),
            payload: { roomId, user },
        });
    }

    /**
     * 加入房间
     */
    joinRoom(roomId: string, user: UserInfo, reconnect = false): void {
        this.send<RoomJoinMessage>({
            type: 'room.join',
            requestId: this.generateRequestId(),
            payload: { roomId, user, reconnect },
        });
    }

    /**
     * 离开房间
     */
    leaveRoom(): void {
        this.send<RoomLeaveMessage>({
            type: 'room.leave',
            requestId: this.generateRequestId(),
            payload: {},
        });
    }

    /**
     * 获取房间列表
     */
    getRoomList(): void {
        this.send<RoomListMessage>({
            type: 'room.list',
            requestId: this.generateRequestId(),
            payload: {},
        });
    }

    /**
     * 玩家准备/取消准备
     */
    setReady(ready: boolean): void {
        this.send<GameReadyMessage>({
            type: 'game.ready',
            requestId: this.generateRequestId(),
            payload: { ready },
        });
    }

    /**
     * 获取游戏状态
     */
    getGameStage(): void {
        this.send<GameStageRequestMessage>({
            type: 'game.stage',
            requestId: this.generateRequestId(),
            payload: {},
        });
    }

    /**
     * 发送游戏动作
     */
    sendGameAction(actionId: string, actionType: string, data: { card: number }): void {
        this.send<GameActionMessage>({
            type: 'game.action',
            requestId: this.generateRequestId(),
            payload: { actionId, actionType, data },
        });
    }

    /**
     * 发送聊天消息
     */
    sendChatMessage(message: string): void {
        this.send<ChatSendMessage>({
            type: 'chat.send',
            requestId: this.generateRequestId(),
            payload: { message },
        });
    }

    /**
     * 注册消息事件处理器
     */
    on<T = unknown>(type: string, handler: WSEventHandler<T>): () => void {
        if (!this.eventHandlers.has(type)) {
            this.eventHandlers.set(type, new Set());
        }
        this.eventHandlers.get(type)!.add(handler as WSEventHandler);

        // 返回取消订阅函数
        return () => {
            this.eventHandlers.get(type)?.delete(handler as WSEventHandler);
        };
    }

    /**
     * 移除所有事件处理器
     */
    off(type: string): void {
        this.eventHandlers.delete(type);
    }

    /**
     * 断开连接
     */
    disconnect(): void {
        this.shouldReconnect = false;
        this.cleanup();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    /**
     * 清理资源
     */
    private cleanup(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    /**
     * 调度重连
     */
    private scheduleReconnect(): void {
        if (!this.options || !this.shouldReconnect) return;

        const attempts = this.options.reconnectAttempts ?? 5;
        const interval = this.options.reconnectInterval ?? 3000;

        this.reconnectTimer = setTimeout(() => {
            console.log('Attempting to reconnect...');
            this.connect(this.options!);
        }, interval);
    }

    /**
     * 刷新消息队列
     */
    private flushMessageQueue(): void {
        while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
            const message = this.messageQueue.shift();
            if (message) {
                this.ws.send(JSON.stringify(message));
            }
        }
    }

    /**
     * 获取连接状态
     */
    getReadyState(): number {
        return this.ws?.readyState ?? WebSocket.CLOSED;
    }

    /**
     * 检查是否已连接
     */
    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    /**
     * 生成请求ID
     */
    private generateRequestId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

// 导出单例
export const wsManager = new WebSocketManager();
