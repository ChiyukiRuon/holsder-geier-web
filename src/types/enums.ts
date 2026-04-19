// 错误码枚举
export enum WSErrorCode {
    INVALID_REQUEST = 'INVALID_REQUEST',
    NOT_IN_ROOM = 'NOT_IN_ROOM',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    MISSING_USER = 'MISSING_USER',
    ROOM_NOT_FOUND = 'ROOM_NOT_FOUND',
    ROOM_ALREADY_EXISTS = 'ROOM_ALREADY_EXISTS',
    ROOM_FULL = 'ROOM_FULL',
    RECONNECT_FAILED = 'RECONNECT_FAILED',
    GAME_ALREADY_STARTED = 'GAME_ALREADY_STARTED',
    GAME_NOT_STARTED = 'GAME_NOT_STARTED',
    PLAYER_NOT_FOUND = 'PLAYER_NOT_FOUND',
    ACTION_FAILED = 'ACTION_FAILED',
    NOT_YOUR_TURN = 'NOT_YOUR_TURN',
    INVALID_ACTION = 'INVALID_ACTION',
    INVALID_CARD = 'INVALID_CARD',
    NOT_LOGGED_IN = 'NOT_LOGGED_IN',
}

// 游戏阶段
export type GameStage = 'idle' | 'reveal' | 'play' | 'resolve' | 'end';

// 房间状态
export type RoomStatus = 'waiting' | 'playing' | 'finished';

// 房间角色
export type RoomRole = 'player' | 'spectator';
