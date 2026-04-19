'use client';

import { useState, ReactNode } from "react";
import ChatBox from "@/components/side/ChatBox";
import PlayerList from "@/components/side/PlayerList";
import RoomControls from "@/components/side/RoomControls";
import type { UserInfo } from "@/types";
import type { useGameSession } from "@/hooks/useGameSession";
import type { useChat } from "@/hooks/useChat";
import {toast} from "@heroui/react";

interface MobileTabsProps {
    session: ReturnType<typeof useGameSession>;
    chat: ReturnType<typeof useChat>;
    userInfo: UserInfo | null;
}

interface TabBtnProps {
    active: boolean;
    children: ReactNode;
    onClick: () => void;
}

export default function MobileTabs({ session, chat, userInfo }: MobileTabsProps) {
    const [tab, setTab] = useState<'chat' | 'players' | 'room'>('chat');
    const [localUserInfo, setLocalUserInfo] = useState<UserInfo | null>(userInfo);

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

    return (
        <div className="flex flex-col h-full">

            {/* 内容 */}
            <div className="flex-1 min-h-0">
                {tab === 'chat' && <ChatBox chat={chat} userInfo={localUserInfo} />}
                {tab === 'players' && <PlayerList
                    room={{ players: session.players, spectators: session.spectators }}
                    userInfo={localUserInfo}
                    onUpdateUserInfo={handleUpdateUserInfo}
                />}
                {tab === 'room' && <RoomControls session={session} userInfo={localUserInfo} />}
            </div>

            {/* 底部导航 */}
            <div className="flex border-t bg-white">

                <TabBtn active={tab === 'chat'} onClick={() => setTab('chat')}>
                    聊天
                </TabBtn>

                <TabBtn active={tab === 'players'} onClick={() => setTab('players')}>
                    玩家
                </TabBtn>

                <TabBtn active={tab === 'room'} onClick={() => setTab('room')}>
                    房间
                </TabBtn>

            </div>

        </div>
    );
}

function TabBtn({ active, children, onClick }: TabBtnProps) {
    return (
        <button
            onClick={onClick}
            className={`
                flex-1 py-3 text-sm font-bold
                ${active ? 'text-blue-500 border-t-2 border-blue-500' : 'text-gray-400'}
            `}
        >
            {children}
        </button>
    );
}
