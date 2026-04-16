import {API_CONFIG} from './axios';
import type {
    UserInfo,
    WSMessage,
    WSEventHandler,
    WSConnectionOptions,
    UserUpdateMessage,
    RoomCreateMessage,
    RoomJoinMessage,
    RoomLeaveMessage,
    RoomListMessage,
    GameReadyMessage,
    GameStateMessage,
    GameActionMessage,
    ChatSendMessage, WSRequestMap,
} from '@/types';

class WebSocketManager {
    private ws: WebSocket | null = null;
    private options: WSConnectionOptions | null = null;
    private eventHandlers: Map<string, Set<WSEventHandler>> = new Map();
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private shouldReconnect: boolean = true;
    private messageQueue: WSMessage[] = [];

    /**
     * 连接
     */
    connect(options: WSConnectionOptions): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            return;
        }

        this.options = options;
        this.shouldReconnect = options.reconnect ?? true;

        try {
            this.ws = new WebSocket(API_CONFIG.WS_URL);

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
     * 处理消息
     */
    private handleMessage(message: WSMessage): void {
        if (message.type === 'server.ping') {
            this.send({
                type: 'client.pong',
                payload: { clientTime: Date.now() },
            });
        }

        if (message.type === 'server.ack' && message.payload?.requestId) {
            const pending = this.pendingRequests.get(message.payload.requestId);
            if (pending) {
                clearTimeout(pending.timeout);
                pending.resolve(message.payload);
                this.pendingRequests.delete(message.payload.requestId);
            }
            return;
        }

        if (message.type === 'server.error' && message.payload?.requestId) {
            const pending = this.pendingRequests.get(message.payload.requestId);
            if (pending) {
                clearTimeout(pending.timeout);
                pending.reject(message.payload);
                this.pendingRequests.delete(message.payload.requestId);
            }
            return;
        }

        const handlers = this.eventHandlers.get(message.type);
        if (handlers) {
            handlers.forEach((handler) => {
                handler('payload' in message ? message.payload : undefined);
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
            this.messageQueue.push(message);
        }
    }

    sendWithAck<K extends keyof WSRequestMap>(
        message: WSMessage,
        timeoutMs = 5000
    ): Promise<WSRequestMap[K]> {
        const requestId = message.requestId ?? crypto.randomUUID();
        message.requestId = requestId;

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pendingRequests.delete(requestId);
                reject(new Error('Request timeout'));
            }, timeoutMs);

            this.pendingRequests.set(requestId, {
                resolve: resolve as (value: unknown) => void,
                reject,
                timeout,
            });

            this.send(message);
        });
    }

    /**
     * 用户更新
     */
    updateUser(payload: UserInfo) {
        return this.sendWithAck({
            type: 'user.update',
            payload,
        });
    }

    /**
     * 创建房间
     */
    createRoom(roomId: string, user: UserInfo) {
        return this.sendWithAck({
            type: 'room.create',
            requestId: this.generateRequestId(),
            payload: {roomId, user},
        });
    }

    /**
     * 加入房间
     */
    joinRoom(roomId: string, user: UserInfo, reconnect = false) {
        return this.sendWithAck({
            type: 'room.join',
            requestId: this.generateRequestId(),
            payload: { roomId, user, reconnect },
        });
    }

    /**
     * 离开房间
     */
    leaveRoom() {
        return this.sendWithAck({
            type: 'room.leave',
            requestId: this.generateRequestId(),
            payload: {},
        });
    }

    /**
     * 准备状态
     */
    setReady(ready: boolean) {
        return this.sendWithAck({
            type: 'game.ready',
            requestId: this.generateRequestId(),
            payload: {ready},
        });
    }

    /**
     * 游戏操作
     */
    sendGameAction(actionId: string, actionType: string, data: { card: number }) {
        return this.sendWithAck({
            type: 'game.action',
            requestId: this.generateRequestId(),
            payload: {actionId, actionType, data},
        });
    }

    /**
     * 聊天
     */
    sendChatMessage(message: string, user: UserInfo) {
        return this.sendWithAck({
            type: 'chat.send',
            requestId: this.generateRequestId(),
            payload: {
                user,
                message,
                timestamp: Date.now(),
            },
        });
    }

    /**
     * 事件订阅
     */
    on<T = unknown>(type: string, handler: WSEventHandler<T>): () => void {
        if (!this.eventHandlers.has(type)) {
            this.eventHandlers.set(type, new Set());
        }
        this.eventHandlers.get(type)!.add(handler as WSEventHandler);

        return () => {
            this.eventHandlers.get(type)?.delete(handler as WSEventHandler);
        };
    }

    /**
     * 移除事件
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

    private pendingRequests = new Map<
        string,
        {
            resolve: (value: unknown) => void;
            reject: (reason?: unknown) => void;
            timeout: ReturnType<typeof setTimeout>;
        }
    >();

    /**
     * 清理
     */
    private cleanup(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    /**
     * 重连
     */
    private scheduleReconnect(): void {
        if (!this.options || !this.shouldReconnect) return;

        const interval = this.options.reconnectInterval ?? 3000;

        this.reconnectTimer = setTimeout(() => {
            console.log('Reconnecting...');
            this.connect(this.options!);
        }, interval);
    }

    /**
     * 刷新队列
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
     * 状态
     */
    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    /**
     * 请求ID
     */
    private generateRequestId(): string {
        return crypto.randomUUID();
    }
}

export const wsManager = new WebSocketManager();
