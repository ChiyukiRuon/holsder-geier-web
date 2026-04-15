import React from "react";
import { Badge } from "@heroui/react";
import ShowUserInfo from "@/components/ShowUserInfo";
import type { UserInfo } from "@/types";

interface HandCardProps {
    value?: number | null;
    isSelected?: boolean;
    isDisabled?: boolean;
    user: UserInfo;
    showBadge?: boolean;
    cardFace: "front" | "back" | "waiting";
    onClick?: () => void;
}

export const HandCard = ({
    value = null,
    isSelected,
    isDisabled,
    user,
    showBadge = false,
    cardFace = "front",
    onClick,
}: HandCardProps) => {
    if (cardFace === "back") {
        return (
            <div
                className={`
                    relative w-28 h-40 select-none transition-all duration-300 ease-out
                `}
            >
                {/* 厚度层 */}
                <div
                    className="absolute inset-0 translate-x-1 translate-y-1 rounded-lg opacity-40"
                    style={{ backgroundColor: user.color, filter: 'brightness(0.7)' }}
                />

                {/* 主体容器 */}
                <div
                    className="relative h-full w-full rounded-lg overflow-hidden border-[3px] bg-white shadow-md flex flex-col items-center justify-center"
                    style={{ borderColor: user.color }}
                >
                    {/* 背景底色 */}
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            background: `radial-gradient(circle at center, ${user.color} 0%, transparent 100%)`,
                            backgroundColor: 'white',
                        }}
                    />

                    {/* 背景图片 */}
                    {user.background && (
                        <div
                            className="absolute inset-0 opacity-40 mix-blend-multiply"
                            style={{
                                backgroundImage: `url(${user.background})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                filter: "grayscale(0.5) contrast(1.2)",
                            }}
                        />
                    )}

                    {/* 装饰性边框 */}
                    <svg viewBox="0 0 100 140" className="absolute inset-0 w-full h-full pointer-events-none px-1 py-1">
                        {/* 四角装饰 */}
                        <path d="M10 20 L10 10 L20 10" fill="none" stroke={user.color} strokeWidth="2" strokeLinecap="round" />
                        <path d="M80 10 L90 10 L90 20" fill="none" stroke={user.color} strokeWidth="2" strokeLinecap="round" />
                        <path d="M10 120 L10 130 L20 130" fill="none" stroke={user.color} strokeWidth="2" strokeLinecap="round" />
                        <path d="M90 120 L90 130 L80 130" fill="none" stroke={user.color} strokeWidth="2" strokeLinecap="round" />

                        {/* 中心菱形装饰线 */}
                        <rect x="25" y="45" width="50" height="50" rx="4" transform="rotate(45 50 70)" stroke={user.color} strokeWidth="1" strokeDasharray="4 2" opacity="0.3" />
                        <text x="50" y="125" textAnchor="middle" fill={user.color} className="text-[10px] font-black opacity-40 tracking-widest">PLAYER</text>
                    </svg>

                    {/* 中心 Badge 区域 */}
                    <div className="relative z-10 flex flex-col items-center gap-2 scale-110">
                        {showBadge && (
                            <>
                                <div
                                    // className="p-1 rounded-full bg-white shadow-sm ring-2"
                                >
                                    <ShowUserInfo
                                        type="sm"
                                        size={16}
                                        name={user.nickname}
                                        color={user.color}
                                        avatarUrl={user.avatar}
                                    />
                                </div>
                                {/* 辅助文字 */}
                                <span
                                    className="text-[10px] font-black uppercase tracking-tighter"
                                    style={{ color: user.color, textShadow: '0 0 4px rgba(255,255,255,0.9), 0 0 8px rgba(255,255,255,0.6)' }}
                                >
                                    {user.nickname}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (cardFace === "waiting") {
        return (
            <div
                className={`
                    relative w-28 h-40 select-none rounded-lg transition-all duration-500
                    animate-pulse
                `}
            >
                {/* 槽位内阴影 */}
                <div
                    className="absolute inset-0 rounded-lg shadow-inner opacity-20"
                    style={{ backgroundColor: user.color }}
                />

                {/* 主体虚线框 */}
                <div
                    className="relative h-full w-full rounded-lg border-[3px] border-dashed flex flex-col items-center justify-center overflow-hidden"
                    style={{
                        borderColor: user.color,
                        backgroundColor: `${user.color}08`,
                    }}
                >
                    {/* 背景 */}
                    <svg viewBox="0 0 100 140" className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
                        <defs>
                            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1" fill={user.color} />
                            </pattern>
                        </defs>
                        <rect width="100" height="140" fill="url(#grid)" />

                        <circle cx="50" cy="70" r="35" stroke={user.color} strokeWidth="2" strokeDasharray="4 4" fill="none" />
                    </svg>

                    {/* 居中的状态提示 */}
                    <div className="relative z-10 flex flex-col items-center gap-2">
                        {/* 加载动画 */}
                        <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                                    style={{
                                        backgroundColor: user.color,
                                        animationDelay: `${i * 0.15}s`
                                    }}
                                />
                            ))}
                        </div>
                        <span
                            className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40"
                            style={{ color: user.color }}
                        >
                            Waiting
                        </span>
                    </div>
                </div>

                {showBadge && (
                    <Badge
                        placement="top-right"
                        style={{ border: 'none' }}
                    >
                        <ShowUserInfo type="sm" size={10} name={user.nickname} color={user.color} avatarUrl={user.avatar} />
                    </Badge>
                )}
            </div>
        );
    }

    return (
        <div
            onClick={!isDisabled ? onClick : undefined}
            className={`
                relative w-28 h-40 select-none transition-all duration-300 ease-out cursor-pointer
                ${isSelected
                        ? "-translate-y-12"
                        : "hover:-translate-y-6 hover:scale-105 active:scale-95"
                }
            `}
        >
            {/* 厚度层 */}
            {/*<div*/}
            {/*    className="absolute inset-0 translate-x-1 translate-y-1 rounded-lg opacity-40 transition-transform duration-300"*/}
            {/*    style={{ backgroundColor: user.color, filter: 'brightness(0.8)' }}*/}
            {/*/>*/}

            {/* 阴影层 */}
            <div
                className={`
                    absolute inset-0 rounded-lg blur-xl transition-opacity duration-300
                    ${isSelected ? "opacity-60" : "opacity-0 group-hover:opacity-30"}
                `}
                style={{ backgroundColor: user.color }}
            />

            {/* 3. 卡牌主体容器 */}
            <div className="relative h-full w-full rounded-lg overflow-hidden bg-white shadow-md border-2"
                 style={{ borderColor: isSelected ? user.color : '#e5e7eb' }}>

                {/* 背景图 */}
                <div className="absolute inset-0">
                    {user.background ? (
                        <svg viewBox="0 0 100 140" className="w-full h-full">
                            <defs>
                                <clipPath id={`cardClip-${value}`}>
                                    <rect x="0" y="0" width="100" height="140" rx="8" />
                                </clipPath>
                            </defs>
                            <image
                                href={user.background}
                                width="100"
                                height="140"
                                clipPath={`url(#cardClip-${value})`}
                                preserveAspectRatio="xMidYMid slice"
                            />
                        </svg>
                    ) : (
                        <div className="w-full h-full bg-slate-50" />
                    )}
                </div>

                {/* 文字与图形 */}
                <svg viewBox="0 0 100 140" fill="none" className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* 顶部数字 */}
                    <text x="8" y="22" fill={user.color} stroke="white" strokeWidth="1.5" paintOrder="stroke" className="text-[18px] font-black">{value}</text>

                    {/* 倒置数字 */}
                    <g transform="rotate(180 50 70)">
                        <text x="8" y="22" fill={user.color} stroke="white" strokeWidth="1.5" paintOrder="stroke" className="text-[18px] font-black">{value}</text>
                    </g>

                    {/* 中心装饰线圈 */}
                    <circle cx="50" cy="70" r="32" stroke={user.color} strokeWidth="1" strokeDasharray="4 2" opacity="0.2" />
                    <circle cx="50" cy="70" r="28" fill={user.color} fillOpacity="0.08" />

                    {/* 中心主数字 */}
                    <text
                        x="45" y="90"
                        textAnchor="middle"
                        fill={user.color}
                        stroke="white"
                        strokeWidth="3"
                        paintOrder="stroke"
                        className="text-[52px] font-black italic"
                        style={{ filter: `drop-shadow(0 4px 4px ${user.color}44)` }}
                    >
                        {value}
                    </text>
                </svg>
            </div>

            {showBadge && (
                <Badge
                    placement="top-right"
                    style={{ border: 'none' }}
                >
                    <ShowUserInfo type="sm" size={10} name={user.nickname} color={user.color} avatarUrl={user.avatar} />
                </Badge>
            )}
        </div>
    );
};
