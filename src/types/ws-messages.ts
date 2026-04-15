import type {
    WSMessageBase,
    UserInfo,
    RoomData,
    ChatMessage,
    PlayerGameState,
    RoomStatus,
} from './base';
import type { WSErrorCode } from './enums';
import type { GameStage, CardType } from './enums';
import type { ScoreCard, GameState } from './game';

// ==================== 客户端 → 服务端消息 ====================

export interface UserUpdateMessage extends WSMessageBase {
    type: 'user.update';
    payload: {
        nickname?: string;
        avatar?: string;
        background?: string;
    };
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

export interface RoomListMessage extends WSMessageBase {
    type: 'room.list';
    payload: Record<string, never>;
}

export interface GameReadyMessage extends WSMessageBase {
    type: 'game.ready';
    payload: {
        ready: boolean;
    };
}

export interface GameStageRequestMessage extends WSMessageBase {
    type: 'game.stage';
    payload: Record<string, never>;
}

export interface GameActionMessage extends WSMessageBase {
    type: 'game.action';
    payload: {
        actionId: string;
        actionType: string;
        data: { card: number };
    };
}

export interface ChatSendMessage extends WSMessageBase {
    type: 'chat.send';
    payload: {
        message: string;
    };
}

// ==================== 服务端 → 客户端消息 ====================

export interface ServerInfoMessage {
    type: 'server.info';
    payload: {
        service: string;
        version: string;
        environment: string;
    };
}

export interface ServerAckMessage extends WSMessageBase {
    type: 'server.ack';
}

export interface ServerErrorMessage extends WSMessageBase {
    type: 'server.error';
    payload: {
        code: WSErrorCode;
        message: string;
        requestId: string;
    };
}

export interface RoomUpdateMessage {
    type: 'room.update';
    payload: {
        room: RoomData;
    };
}

export interface RoomListResponseMessage {
    type: 'room.list';
    payload: {
        rooms: Array<{
            roomId: string;
            players: PlayerGameState[];
            status: RoomStatus;
            maxPlayers: number;
        }>;
    };
}

export interface GameStartMessage {
    type: 'game.start';
    payload: {
        players: Array<{ playerId: string; name: string }>;
        state: GameState;
    };
}

export interface GameStageResponseMessage {
    type: 'game.stage';
    payload: {
        stage: GameStage;
        round: number;
        scoreCard: ScoreCard;
        carriedOver: ScoreCard[];
        state: GameState;
    };
}

export interface GameSyncMessage {
    type: 'game.sync';
    payload: {
        action: {
            playerId: string;
            actionId: string;
            actionType: string;
            card: number;
        };
        state: GameState;
    };
}

export interface GameResolveMessage {
    type: 'game.resolve';
    payload: {
        round: number;
        playedCards: Array<{ playerId: string; card: number }>;
        winnerId: string;
        scoreCard: ScoreCard;
        carriedOver: ScoreCard[];
        playerPoints: Array<{ playerId: string; points: number[]; total: number }>;
        state: GameState;
    };
}

export interface GameEndMessage {
    type: 'game.end';
    payload: {
        winnerId: string;
        rankings: Array<{ playerId: string; total: number }>;
        playerPoints: Array<{ playerId: string; points: number[]; total: number }>;
        state: GameState;
    };
}

export interface ChatReceiveMessage {
    type: 'chat.receive';
    payload: {
        userId: string;
        message: string;
        timestamp: number;
    };
}

export interface ChatSyncMessage {
    type: 'chat.sync';
    payload: {
        messages: ChatMessage[];
    };
}

// ==================== 消息类型联合 ====================

export type ServerMessage =
    | ServerInfoMessage
    | ServerAckMessage
    | ServerErrorMessage
    | RoomUpdateMessage
    | RoomListResponseMessage
    | GameStartMessage
    | GameStageResponseMessage
    | GameSyncMessage
    | GameResolveMessage
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
    | GameStageRequestMessage
    | GameActionMessage
    | ChatSendMessage;

export type WSMessage = ServerMessage | ClientMessage;