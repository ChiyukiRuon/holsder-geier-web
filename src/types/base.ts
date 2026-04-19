// 用户信息
import {RoomRole, RoomStatus} from "@/types/enums";

export interface UserInfo {
    userId: string;
    nickname: string;
    avatar: string;
    background: string;
    color: string;
}

// 玩家积分信息
export interface PlayerPoint {
    count: number;
    list: number[];
}

// 玩家信息（用于 UI 显示）
export interface PlayerInfo {
    user: UserInfo;
    role: RoomRole;
    card: number[];
    point: PlayerPoint;
    currentPlayerCard?: number;
    lastPlayerCard?: number;
    ready: boolean;
    latency: number;
}

export interface PlayerLatency {
    userId: string;
    latency: number;
}

// 房间信息
export interface RoomInfo {
    roomId: string;
    players: PlayerInfo[];
    spectators: PlayerInfo[];
    status: RoomStatus;
    maxPlayers: number;
}

// 聊天消息
export type ReceiveChatMessage =
    | {
    user: UserInfo;
    type: 'user';
    message: string;
    timestamp: number;
}
    | {
    type: 'system';
    message: string;
    timestamp: number;
};

export interface SendChatMessage {
    user: UserInfo;
    message: string;
    timestamp: number;
}

// 消息基础结构（通用）
export interface WSMessageBase {
    type: string;
    requestId?: string;
}

// Kook 用户信息
export interface KookUserInfo {
    id: string;
    username: string;
    avatar: string;
    identify_num: string;
    online: boolean;
    os: string;
    status: number;
    banner: string;
    nickname: string;
    roles: string[];
    vip_amp: boolean;
    bot: boolean;
    nameplate: string[];
    kpm_vip: null;
    wealth_level: number;
    decorations_id_map: {
        join_voice: number;
        background: number;
        nameplate: number,
        nameplates: number[]
    },
    mobile_verified: boolean,
    is_sys: boolean
}

// 图片上传响应类型
export interface UploadResponse {
    key: string;
    etag: string;
    size: number;
    mimetype: string;
}

export interface ServerInfo {
    service: string;
    version: string;
    environment: string;
    serverTime: number;
}
