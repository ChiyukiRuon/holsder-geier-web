import React from "react";
import { Avatar, Card } from "@heroui/react";
import PointCard from "@/components/PointCard";
import LinkSlash from "@/components/icons/LinkSlash";
import {PlayerInfo, PlayerLatency, UserInfo} from "@/types";

interface UserCardProps {
    type: "sm" | "md" | "lg";
    size?: number;
    player?: PlayerInfo
    user?: UserInfo
    latency?: PlayerLatency["latency"]
    onEdit?: () => void;
    showEditButton?: boolean;
}

export default function ShowUserInfo({
    type,
    size = type === "lg" ? 12 : 7,
    player,
    user,
    latency,
    onEdit,
    showEditButton = false,
}: UserCardProps) {
    if (!player && !user) return null;
    const userInfo = (user || player?.user) as UserInfo;

    if (type === "sm") {
        return (
            <Avatar
                className={`rounded-lg size-${size}`}
                style={{
                    // boxShadow: latency < 0 ? 'none' : '0 0 10px rgba(34, 197, 94, 0.2)',
                    border: `2px solid ${userInfo.color}`
                }}
            >
                <Avatar.Image alt={`${userInfo.nickname}'s avatar`} src={userInfo.avatar} referrerPolicy={"no-referrer"} />
                <Avatar.Fallback className="rounded-lg bg-slate-100 font-bold text-slate-400">
                    {userInfo.nickname.slice(0, 2).toUpperCase()}
                </Avatar.Fallback>
            </Avatar>
        );
    }

    if (type === "md") {
        return (
            <div className="
                flex flex-row items-center gap-2 py-0.5 pl-0.5 pr-2.5
                bg-white/90 backdrop-blur-sm
                rounded-full border-2 border-slate-200
                shadow-[0_2px_0_#e5e7eb]
                transition-transform hover:scale-105
            ">
                <Avatar className={`rounded-full ring-2 ring-white size-${size} shadow-sm`}>
                    <Avatar.Image src={userInfo.avatar} alt={userInfo.nickname} referrerPolicy={"no-referrer"} />
                    <Avatar.Fallback className="rounded-full bg-slate-100 font-bold text-[10px]">
                        {userInfo.nickname.slice(0, 2).toUpperCase()}
                    </Avatar.Fallback>
                </Avatar>

                <span className="text-[11px] font-black text-slate-700 truncate tracking-tight uppercase">
                    {userInfo.nickname}
                </span>
            </div>
        );
    }

    if (!player || latency === undefined) return null;

    return (
        <Card
            className="w-full border-none bg-white/80 backdrop-blur-md shadow-[0_4px_0_#e5e7eb]"
            style={{
                padding: '6px',
                borderRadius: '12px',
                border: '2px solid #f3f4f6'
            }}
        >
            <Card.Content className="flex flex-row items-center gap-3 py-1 px-2">
                {/* 头像 */}
                <div className="relative">
                    <Avatar
                        className={`rounded-lg size-${size}`}
                        style={{
                            boxShadow: latency < 0 ? 'none' : '0 0 10px rgba(34, 197, 94, 0.2)',
                            border: `2px solid ${userInfo.color}`
                        }}
                    >
                        <Avatar.Image alt={`${userInfo.nickname}'s avatar`} src={userInfo.avatar} referrerPolicy={"no-referrer"} />
                        <Avatar.Fallback className="rounded-lg bg-slate-100 font-bold text-slate-400">
                            {userInfo.nickname.slice(0, 2).toUpperCase()}
                        </Avatar.Fallback>
                    </Avatar>
                    {/* 在线状态小点 */}
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${latency < 0 ? "bg-red-400" : "bg-green-500"}`} />
                </div>

                {/* 2. 信息区 */}
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <div className={`flex items-center gap-0.5`}>
                        <p className="text-sm font-black text-slate-700 truncate tracking-tight">
                            {userInfo.nickname}
                        </p>
                        {showEditButton && onEdit && (
                            <button
                                onClick={onEdit}
                                className={`cursor-pointer hover:text-slate-500 transition-colors`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                                     stroke="currentColor" className="size-3">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/>
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* 得分牌数量 */}
                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200 shadow-sm">
                            <PointCard cardFace={"back"} width={10} height={14} />
                            <span className="ml-1 text-[10px] font-bold text-slate-400">x</span>
                            <span className="ml-0.5 text-xs font-black text-amber-600 leading-none">
                        {player.point.count}
                    </span>
                        </div>
                    </div>
                </div>

                {/* 网络状态 */}
                <div className="flex flex-col items-end gap-1">
                    {latency === -999 ? (
                        <div
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-100">
                            <LinkSlash size={14}/>
                            <span className="text-[10px] font-bold">OFFLINE</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-end">
                        <div className="flex gap-0.5 mb-0.5">
                                {/* 模拟信号格 */}
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className={`w-1 h-${1 + i} rounded-full ${
                                            latency! < 50 ? "bg-green-500" :
                                                latency! > 150 && i > 1 ? "bg-slate-200" :
                                                    latency! <= 150 && i === 3 ? "bg-slate-200" : "bg-amber-400"
                                        }`}
                                    />
                                ))}
                            </div>
                            <div
                                className="text-[10px] font-mono font-bold"
                                style={{
                                    color: latency! < 50 ? "#22c55e" : latency! > 150 ? "#ef4444" : "#f59e0b"
                                }}
                            >
                                {latency}<span className="opacity-70 font-sans ml-0.5">ms</span>
                            </div>
                        </div>
                    )}
                </div>
            </Card.Content>
        </Card>
    );
}
