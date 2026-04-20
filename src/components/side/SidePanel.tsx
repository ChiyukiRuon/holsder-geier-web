'use client';

import ChatBox from "./ChatBox";
import PlayerList from "./PlayerList";
import RoomControls from "./RoomControls";
import GitHub from "@/components/icons/GitHub";
import packageJson from "../../../package.json";
import type {UserInfo, PlayerLatency, PlayerInfo} from "@/types";
import type { useChat } from "@/hooks/useChat";
import {toast} from "@heroui/react";
import {useGameSession} from "@/hooks/useGameSession";

interface SidePanelProps {
    session: ReturnType<typeof useGameSession>;
    chat: ReturnType<typeof useChat>;
    userInfo: UserInfo | null;
    players?: PlayerInfo[];
    playerLatencies?: PlayerLatency[];
    onUpdateUserInfo?: (userInfo: UserInfo) => void;
}

export default function SidePanel({
                                      session,
                                      chat,
                                      userInfo,
                                      players,
                                      playerLatencies = [],
                                      onUpdateUserInfo
                                  }: SidePanelProps) {
    const handleUpdateUserInfo = (updatedUserInfo: UserInfo) => {
        if (!userInfo) return;

        // 优先使用父组件传入的更新函数
        if (onUpdateUserInfo) {
            onUpdateUserInfo(updatedUserInfo);
        } else {
            // 否则只更新 localStorage 和服务器
            localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

            session.updateUser(updatedUserInfo).catch(err => {
                console.error('update user error', err);
                toast.danger(`更新用户信息失败: ${err.message}`, {timeout: 5000});
            });
        }
    };

    // 使用传入的 players 或回退到 session.players
    const displayPlayers = players ?? session.players;

    return (
        <div className="hidden lg:flex flex-col gap-4 h-full min-h-0">
            <RoomControls session={session} userInfo={userInfo} />
            <PlayerList
                room={{ players: displayPlayers, spectators: session.spectators }}
                userInfo={userInfo}
                playerLatencies={playerLatencies}
                onUpdateUserInfo={handleUpdateUserInfo}
                isInRoom={session.isInRoom}
                isConnected={session.isConnected}
            />
            <ChatBox chat={chat} userInfo={userInfo} />

            {/* Footer */}
            <div className="flex items-center justify-between px-2 opacity-40 mt-auto shrink-0">
                <GitHub />
                <div className="flex gap-2 text-[10px] font-bold text-slate-600 uppercase">
                    <span>{session.isConnected ? session.serverInfo ? `SERVER ${session.serverInfo.version}` : 'Connected' : 'Disconnected'}</span>
                    <span>|</span>
                    <span>Client {packageJson.version}</span>
                </div>
            </div>
        </div>
    );
}
