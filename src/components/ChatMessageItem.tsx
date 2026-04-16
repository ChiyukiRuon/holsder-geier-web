import React from 'react';
import {ReceiveChatMessage} from "@/types";

export const ChatMessageItem = ({ data, selfId }: { data: ReceiveChatMessage, selfId?: string }) => {
    // 系统消息
    if (data.type === 'system') {
        return (
            <div className="flex flex-col items-center py-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
                <div className="px-3 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full border border-amber-200 shadow-sm uppercase tracking-wider">
                    {data.message}
                </div>
            </div>
        );
    }

    const isSelf = data.user.userId === selfId;

    return (
        <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} gap-1 mb-2 group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            {/* 昵称展示 */}
            <span className={`text-[10px] font-black text-slate-400 uppercase tracking-tighter`}>
                {isSelf ? 'You' : data.user.nickname}
            </span>

            <div className="flex items-end gap-1 max-w-[85%]">
                {/* 时间戳 - 自己的消息在左边 */}
                {isSelf && (
                    <span className="text-[8px] font-medium text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pb-1 mr-1">
                        {new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}

                {/* 气泡主体 */}
                <div
                    className={`px-3 py-2 text-l font-bold border-2 transition-transform hover:scale-[1.02]
                        ${isSelf
                        ? 'bg-green-500 text-white border-green-600 rounded-2xl rounded-tr-none shadow-[-4px_4px_0px_rgba(34,197,94,0.2)]'
                        : 'bg-white text-slate-800 border-slate-200 rounded-2xl rounded-tl-none shadow-[4px_4px_0px_rgba(0,0,0,0.05)]'
                    }                    `}
                >
                    {data.message}
                </div>

                {/* 时间戳 - 别人的消息在右边 */}
                {!isSelf && (
                    <span className="text-[8px] font-medium text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pb-1 ml-1">
                        {new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}
            </div>
        </div>
    );
};
