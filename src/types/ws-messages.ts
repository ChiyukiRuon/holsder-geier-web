import type {
    WSMessageBase,
    UserInfo,
    RoomInfo,
    SendChatMessage, PlayerInfo, PlayerLatency, ReceiveChatMessage,
} from './base';
import type {RoomStatus, WSErrorCode} from './enums';
import type { GameState } from './game';

// 客户端 → 服务端消息
export interface UserUpdateMessage extends WSMessageBase {
    type: 'user.update';
    payload: UserInfo;
}

export interface RoomCreateMessage extends WSMessageBase {
    type: 'room.create';
    payload: {
        roomId: string;
        user: UserInfo;
    };
}

export interface RoomJoinMessage extends WSMessageBase {
    type: 'room.join';
    payload: {
        roomId: string;
        user: UserInfo;
        reconnect?: boolean;
    };
}

export interface RoomLeaveMessage extends WSMessageBase {
    type: 'room.leave';
    payload: Record<string, never>;
}

export interface GameReadyMessage extends WSMessageBase {
    type: 'game.ready';
    payload: {
        ready: boolean;
    };
}

export interface GameActionMessage extends WSMessageBase {
    type: 'game.action';
    payload: {
        action: {
            card: number
        }
    };
}

export interface ChatSendMessage extends WSMessageBase {
    type: 'chat.send';
    payload: SendChatMessage;
}

export interface ServerPongMessage extends WSMessageBase {
    type: 'client.pong';
    payload: {
        pingTime: number;
    };
}

// 服务端 → 客户端消息
export interface ServerPingMessage extends WSMessageBase {
    type: 'server.ping';
    payload: {
        serverTime: number;
        latencies?: PlayerLatency[];
    };
}

export interface ServerToastMessage extends WSMessageBase {
    type: 'server.toast';
    payload: {
        type: 'info' | 'success' | 'warning' | 'danger';
        message: string;
    };
}

export interface ServerInfoMessage extends WSMessageBase {
    type: 'server.info';
    payload: {
        service: string;
        version: string;
        environment: string;
        serverTime: number;
    };
}

export interface ServerAckMessage extends WSMessageBase {
    type: 'server.ack';
    payload: {
        requestId: string;
    };
}

export interface ServerErrorMessage extends WSMessageBase {
    type: 'server.error';
    payload: {
        code: WSErrorCode;
        message: string;
        requestId: string;
    };
}

export interface RoomUpdateMessage extends WSMessageBase {
    type: 'room.update';
    payload: {
        room: RoomInfo;
    };
}

export interface RoomListMessage extends WSMessageBase {
    type: 'room.list';
    payload: {
        rooms: Array<{
            roomId: string;
            players: PlayerInfo[];
            status: RoomStatus;
            maxPlayers: number;
        }>;
    };
}

export interface GameStartMessage extends WSMessageBase {
    type: 'game.start';
    payload: {
        players: PlayerInfo[];
        state: GameState;
    };
}

export interface GameStateMessage extends WSMessageBase {
    type: 'game.state';
    payload: {
        players: PlayerInfo[];
        state: GameState;
    };
}

export interface GameResolveMessage extends WSMessageBase {
    type: 'game.resolve';
    payload: {
        players: PlayerInfo[];
        state: GameState;
        roundWinner: PlayerInfo | null;
    };
}

export interface GameSyncMessage extends WSMessageBase {
    type: 'game.sync';
    payload: {
        action: {
            player: PlayerInfo;
            card: number;
        };
    };
}

export interface GameEndMessage extends WSMessageBase {
    type: 'game.end';
    payload: {
        winnerId?: string;
        rankings?: Array<{
            playerId: string
            total: number
        }>;
        playerPoints: Array<{
            playerId: string
            points: number[]
            total: number
        }>;
        players: PlayerInfo[];
        state: GameState;
    };
}

export interface ChatReceiveMessage extends WSMessageBase {
    type: 'chat.receive';
    payload: ReceiveChatMessage;
}

export interface ChatSyncMessage extends WSMessageBase {
    type: 'chat.sync';
    payload: {
        messages: ReceiveChatMessage[];
    };
}

// 消息类型联合

export type ServerMessage =
    | ServerPingMessage
    | ServerInfoMessage
    | ServerAckMessage
    | ServerErrorMessage
    | RoomUpdateMessage
    | RoomListMessage
    | GameStartMessage
    | GameStateMessage
    | GameResolveMessage
    | GameSyncMessage
    | GameEndMessage
    | ChatReceiveMessage
    | ChatSyncMessage;

export type ClientMessage =
    | UserUpdateMessage
    | RoomCreateMessage
    | RoomJoinMessage
    | RoomLeaveMessage
    | RoomListMessage
    | GameReadyMessage
    | GameStateMessage
    | GameActionMessage
    | ChatSendMessage
    | ServerPongMessage;

export type WSMessage = ServerMessage | ClientMessage;
