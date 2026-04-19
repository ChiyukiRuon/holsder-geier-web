'use client';

import ChatBox from "./ChatBox";
import PlayerList from "./PlayerList";
import RoomControls from "./RoomControls";
import MobileTabs from "@/components/mobile/MobileTabs";
import GitHub from "@/components/icons/GitHub";
import packageJson from "../../../package.json";
import type {UserInfo, PlayerLatency, PlayerInfo} from "@/types";
import type { useChat } from "@/hooks/useChat";
import { useState } from "react";
import {toast} from "@heroui/react";
import {useGameSession} from "@/hooks/useGameSession";

interface SidePanelProps {
    session: ReturnType<typeof useGameSession>;
    chat: ReturnType<typeof useChat>;
    userInfo: UserInfo | null;
    players?: PlayerInfo[];
    playerLatencies?: PlayerLatency[];
}

export default function SidePanel({
                                      session,
                                      chat,
                                      userInfo,
                                      players,
                                      playerLatencies = []
                                  }: SidePanelProps) {
    const [localUserInfo, setLocalUserInfo] = useState<UserInfo | null>(userInfo);

    // 同步外部 userInfo 变化
    if (userInfo !== localUserInfo) {
        setLocalUserInfo(userInfo);
    }

    const handleUpdateUserInfo = <K extends keyof UserInfo>(key: K, value: UserInfo[K]) => {
        if (!localUserInfo) return;

        const updated = { ...localUserInfo, [key]: value };
        setLocalUserInfo(updated);
        localStorage.setItem("userInfo", JSON.stringify(updated));

        session.updateUser(updated).catch(err => {
            console.error('update user error', err);
            toast.danger(`更新用户信息失败: ${err.message}`, {timeout: 5000});
        });
    };

    // 使用传入的 players 或回退到 session.players
    const displayPlayers = players ?? session.players;

    return (
        <>
            {/* PC */}
            <div className="
                hidden lg:flex
                lg:col-span-3
                flex-col gap-4
                h-full min-h-0
            ">
                <RoomControls session={session} userInfo={localUserInfo} />
                <PlayerList
                    room={{ players: displayPlayers, spectators: session.spectators }}
                    userInfo={localUserInfo}
                    playerLatencies={playerLatencies}
                    onUpdateUserInfo={handleUpdateUserInfo}
                />
                <ChatBox chat={chat} userInfo={localUserInfo} />

                {/* Footer */}
                <div className="flex items-center justify-between px-2 opacity-40 mt-auto">
                    <a href="https://github.com/ChiyukiRuon/holsder-geier-web" target="_blank" rel="noopener noreferrer"
                       className="hover:opacity-100 transition-opacity">
                        <GitHub />
                    </a>
                    <div className="flex gap-2 text-[10px] font-bold text-slate-600 uppercase">
                        <span>{session.isConnected ? session.serverInfo ? `SERVER ${session.serverInfo.version}` : 'Connected' : 'Disconnected'}</span>
                        <span>|</span>
                        <span>Client {packageJson.version}</span>
                    </div>
                </div>
            </div>

            {/* Mobile */}
            <div className="lg:hidden h-[40vh]">
                <MobileTabs
                    session={session}
                    chat={chat}
                    userInfo={localUserInfo}
                />
            </div>
        </>
    );
}
