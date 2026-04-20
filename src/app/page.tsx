'use client';

import React, { Suspense, useEffect, useState } from 'react';
import {Button, Spinner, toast} from "@heroui/react";
import { useSearchParams } from "next/navigation";

import { generateNickname, generateUserColor } from "@/utils/user";
import type { UserInfo } from "@/types";

import { useChat } from "@/hooks/useChat";

import GameBoard from "@/components/game/GameBoard";
import SidePanel from "@/components/side/SidePanel";
import {WebSocketProvider} from "@/components/providers/WebSocketProvider";
import {GameEndModal} from "@/components/models/GameEndModal";
import {useGameSession} from "@/hooks/useGameSession";
import ChatBox from "@/components/side/ChatBox";
import PlayerList from "@/components/side/PlayerList";
import RoomControls from "@/components/side/RoomControls";
import FaceSmile from "@/components/icons/FaceSmile";
import RocketLaunch from "@/components/icons/RocketLaunch";
import UserGroup from "@/components/icons/UserGroup";

function getInitialUserInfo(): UserInfo | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const stored = localStorage.getItem("userInfo");

    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            localStorage.removeItem("userInfo");
        }
    }

    const info: UserInfo = {
        userId: crypto.randomUUID(),
        nickname: generateNickname(),
        avatar: "",
        background: "",
        color: generateUserColor()
    };

    localStorage.setItem("userInfo", JSON.stringify(info));

    return info;
}

function NavButton({ active, isDisabled = false, onClick, icon }: { active: boolean, isDisabled?: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <Button
                isIconOnly
                isDisabled={isDisabled}
                onPress={onClick}
                variant={active ? "primary" : "secondary"}
                className={`
                    w-8 h-8 rounded-xl shadow-lg transition-all p-0
                    ${active ? '-translate-x-1' : ''}
                `}
            >
                {icon}
            </Button>
        </div>
    );
}

function GameRoomInner() {
    const searchParams = useSearchParams();
    const joinId = searchParams.get('join');

    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    const [activeTab, setActiveTab] = useState<'game' | 'room' | 'chat'>('room');

    // hooks
    const session = useGameSession(userInfo);
    const chat = useChat(userInfo);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserInfo(getInitialUserInfo());
    }, []);

    // 自动加入房间
    useEffect(() => {
        if (!joinId || !userInfo || !session.isConnected) return;

        const handleJoin = async () => {
            try {
                session.handleJoinRoom(joinId);
            } catch (err: unknown) {
                console.error(err);
                const errorMessage = err instanceof Error ? err.message : '未知错误';
                toast.danger(`加入房间失败:${errorMessage}`);
            }
        };

        void handleJoin();
    }, [joinId, userInfo, session.isConnected, session.handleJoinRoom, session]);

    // 获取当前玩家列表（游戏进行中优先使用 session.players）
    const currentPlayerList = session.gameState ? session.players : session.players;

    const handleUpdateUserInfo = (updatedUserInfo: UserInfo) => {
        setUserInfo(updatedUserInfo);
        localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

        session.updateUser(updatedUserInfo).catch(err => {
            console.error('update user error', err);
            toast.danger(`更新用户信息失败: ${err.message}`, {timeout: 5000});
        });
    };

    // loading 状态
    if (!userInfo) {
        return (
            <div className="h-screen w-full bg-slate-300 flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-slate-300 p-2 md:p-6 flex flex-col lg:flex-row gap-4 overflow-hidden relative">
            {/* 背景纹理与装饰 */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
                 style={{
                     backgroundSize: '32px 32px'
                 }}
            />
            <div
                className="absolute inset-0 pointer-events-none bg-linear-to-b from-transparent via-transparent to-black/5"
            />

            {/* 移动端导航按钮 */}
            <div className="lg:hidden fixed right-2 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-12">
                <NavButton
                    active={activeTab === 'game'}
                    isDisabled={!session.isInRoom}
                    onClick={() => setActiveTab('game')}
                    icon={<RocketLaunch className={"size-5"} />}
                    label="游戏"
                />
                <NavButton
                    active={activeTab === 'room'}
                    isDisabled={false}
                    onClick={() => setActiveTab('room')}
                    icon={<UserGroup className={"size-5"} />}
                    label="房间"
                />
                <NavButton
                    active={activeTab === 'chat'}
                    isDisabled={!session.isInRoom}
                    onClick={() => setActiveTab('chat')}
                    icon={<FaceSmile className={"size-5"} />}
                    label="聊天"
                />
            </div>

            {/* 游戏区域 - PC端占据剩余空间 */}
            <div className={`
                flex-1 flex-col relative min-h-0 min-w-0 order-1 lg:order-0
                ${activeTab === 'game' ? 'flex' : 'hidden lg:flex'} 
            `}>
                {/* PC端边框装饰 */}
                <div className="hidden lg:block absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-slate-800 z-10" />
                <div className="hidden lg:block absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-slate-800 z-10" />

                <div className="flex-1 bg-slate-100/80 backdrop-blur-sm border-4 border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                    <GameBoard
                        gameState={session.gameState}
                        players={currentPlayerList}
                        spectators={session.spectators}
                        userInfo={userInfo}
                        roundWinner={session.roundWinner}
                        isInRoom={session.isInRoom}
                        isUserReady={session.isUserReady}
                        onToggleReady={session.toggleReady}
                        onPlayCard={session.playCard}
                        roomId={session.roomId}
                        isConnected={session.isConnected}
                    />
                </div>
            </div>

            {/* 侧边栏 */}
            <div className={`
                flex flex-col gap-4 h-full lg:w-80 xl:w-96 shrink-0 order-2 lg:order-0
                ${activeTab === 'room' ? 'flex' : 'hidden lg:flex'}
            `}>
                {/* PC端显示 SidePanel */}
                <div className="hidden lg:flex flex-col h-full w-full">
                    <SidePanel
                        session={session}
                        chat={chat}
                        userInfo={userInfo}
                        onUpdateUserInfo={handleUpdateUserInfo}
                    />
                </div>

                {/* 移动端平铺组件 */}
                <div className="lg:hidden flex flex-col gap-4 h-full overflow-y-auto pb-20">
                    <RoomControls session={session} userInfo={userInfo} />
                    <PlayerList
                        room={{ players: session.players, spectators: session.spectators }}
                        userInfo={userInfo}
                        playerLatencies={session.playerLatencies}
                        onUpdateUserInfo={handleUpdateUserInfo}
                        isConnected={session.isConnected}
                        isInRoom={session.isInRoom}
                    />
                </div>
            </div>

            {/* 聊天区域 - 仅移动端 */}
            <div className={`
                lg:hidden h-full order-3
                ${activeTab === 'chat' ? 'flex' : 'hidden'}
            `}>
                <ChatBox chat={chat} userInfo={userInfo} />
            </div>

            {/* 游戏结算弹窗 */}
            <GameEndModal
                isOpen={!!session.gameEndData}
                onClose={() => session.setGameEndData?.(null)}
                onReady={session.toggleReady}
                gameEndData={session.gameEndData}
                players={currentPlayerList}
                selfId={userInfo.userId}
            />
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={
            <div className="h-screen w-full bg-slate-300 flex items-center justify-center">
                <Spinner size="lg"/>
            </div>
        }>
            <WebSocketProvider>
                <GameRoomInner />
            </WebSocketProvider>
        </Suspense>
    );
}
