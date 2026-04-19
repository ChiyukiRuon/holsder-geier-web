'use client';

import ShowUserInfo from "@/components/ShowUserInfo";
import {Badge} from "@heroui/react";
import Check from "@/components/icons/Check";
import Eye from "@/components/icons/Eye";
import {Tooltip} from "@heroui/react";
import {PlayerInfo, PlayerLatency, UserInfo} from "@/types";
import {useState} from "react";
import {EditUserInfo} from "@/components/models/EditUserInfo";

interface PlayerListProps {
    room: {
        players: PlayerInfo[];
        spectators: PlayerInfo[];
    };
    userInfo: UserInfo | null;
    playerLatencies?: PlayerLatency[];
    onUpdateUserInfo?: <K extends keyof UserInfo>(key: K, value: UserInfo[K]) => void;
    isConnected?: boolean;
    isInRoom?: boolean;
}

export default function PlayerList({
                                       room,
                                       userInfo,
                                       playerLatencies = [],
                                       onUpdateUserInfo,
                                       isConnected = true,
                                       isInRoom = false
                                   }: PlayerListProps) {
    const { players, spectators } = room;
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // 构建当前玩家信息（即使不在 players 列表中也能显示）
    const selfPlayerInfo: PlayerInfo | undefined = (() => {
        if (!userInfo) return undefined;

        // 先在 players 中查找
        const playerInList = players.find((p) => p.user.userId === userInfo.userId);
        if (playerInList) return playerInList;

        // 再在 spectators 中查找
        const spectatorInList = spectators.find((p) => p.user.userId === userInfo.userId);
        if (spectatorInList) return spectatorInList;

        // 如果都不在，创建一个默认的玩家信息
        return {
            user: userInfo,
            role: "player",
            latency: 0,
            ready: false,
            card: [],
            point: {
                count: 0,
                list: []
            },
            currentPlayerCard: undefined,
            lastPlayerCard: undefined
        };
    })();

    return (
        <>
            <div className="bg-white border-[3px] border-slate-800 rounded-2xl shadow-[6px_6px_0px_rgba(0,0,0,0.1)] p-2 md:p-3 flex flex-col">
                <div
                    className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-tight shrink-0 flex justify-between items-center"
                >
                    <div>Players</div>
                    {spectators.length > 0 && (
                        <Tooltip delay={0}>
                            <Tooltip.Trigger>
                                <div className={"text-[8px] flex gap-1 items-center"}>
                                    <Eye className={"w-4 h-4"} />
                                    <div className={"text-xs"}>{spectators.length}</div>
                                </div>
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                                <div className="text-xs">
                                    {spectators.map((s) => (
                                        <div key={s.user.userId}
                                             className="flex items-center gap-1"
                                             style={{
                                                 color: s.user.color,
                                                 textShadow: "0 0 1px rgba(0,0,0,0.5)"
                                             }}
                                        >{s.user.nickname}</div>
                                    ))}
                                </div>
                            </Tooltip.Content>
                        </Tooltip>
                    )}
                </div>
                <div className="flex-1 min-h-0 overflow-hidden max-h-32 lg:max-h-none">
                    {userInfo && selfPlayerInfo && (
                        <div className="flex flex-col gap-1 h-full overflow-y-auto">
                            {/* 当前玩家 */}
                            <Badge.Anchor className={"m-1"}>
                                <ShowUserInfo
                                    type={"lg"}
                                    player={selfPlayerInfo}
                                    latency={playerLatencies.find((pl) => pl.userId === userInfo.userId)?.latency ?? 0}
                                    showEditButton={true}
                                    onEdit={() => setIsEditModalOpen(true)}
                                />
                                {selfPlayerInfo.ready && (
                                    <Badge color={"success"} size={"sm"}>
                                        <Check size={10} />
                                    </Badge>
                                )}
                            </Badge.Anchor>

                            {/* 其他玩家 */}
                            {players.map((p) =>
                                    p.user.userId !== userInfo?.userId && (
                                        <div key={p.user.userId}
                                             className="flex items-center justify-between p-2 rounded-lg bg-content1 shrink-0">
                                            <Badge.Anchor className={"w-full"}>
                                                <ShowUserInfo
                                                    type={"lg"}
                                                    player={p}
                                                    latency={playerLatencies.find((pl) => pl.userId === p.user.userId)?.latency ?? p.latency}
                                                    onEdit={() => {}}
                                                />
                                                {p.ready && <Badge color={"success"} size={"sm"}>
                                                    <Check size={10} />
                                                </Badge>}
                                            </Badge.Anchor>
                                        </div>
                                    )
                            )}

                            {/* 空状态提示 */}
                            {players.length < 2 && (
                                <div className="text-center text-xs text-slate-400 py-4">
                                    {isConnected ? isInRoom ? '等待其他玩家加入...' : '未加入房间' : '未连接'}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 编辑用户信息弹窗 */}
            {isEditModalOpen && userInfo && (
                <EditUserInfo
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={(data) => {
                        if (onUpdateUserInfo) {
                            if (data.nickname) onUpdateUserInfo("nickname", data.nickname);
                            if (data.avatar) onUpdateUserInfo("avatar", data.avatar);
                            if (data.color) onUpdateUserInfo("color", data.color);
                            if (data.background) onUpdateUserInfo("background", data.background);
                        }
                    }}
                    initialData={userInfo}
                />
            )}
        </>
    );
}
