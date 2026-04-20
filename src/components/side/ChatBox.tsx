'use client';

import { Button, Input, Popover, ScrollShadow } from "@heroui/react";
import { ChatMessageItem } from "@/components/ChatMessageItem";
import React, { useRef, useEffect, useState } from "react";
import PaperAirplane from "@/components/icons/PaperAirplane";
import FaceSmile from "@/components/icons/FaceSmile";
import type { ReceiveChatMessage, UserInfo } from "@/types";

interface ChatBoxProps {
    chat: {
        messages: ReceiveChatMessage[];
        input: string;
        setInput: (value: string) => void;
        sendMessage: (message: string) => void;
        sendEmoji?: (emoji: string) => void;
        shouldAutoScrollRef: React.MutableRefObject<boolean>;
    };
    userInfo: UserInfo | null;
}

const commonEmojis = [
    '😀', '😂', '🤣', '😊', '😍', '🥰', '😘', '😜',
    '🤔', '😎', '🥳', '😭', '😱', '🤯', '👍', '👎',
    '👏', '🙏', '❤️', '🔥', '🎉', '💯', '☝️🤓', '🤣👉',
];

export default function ChatBox({ chat, userInfo }: ChatBoxProps) {
    const { messages, input, setInput, sendMessage, sendEmoji, shouldAutoScrollRef } = chat;
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current || !shouldAutoScrollRef.current) return;

        ref.current.scrollTop = ref.current.scrollHeight;
    }, [messages, shouldAutoScrollRef]);

    const handleEmojiClick = (emoji: string) => {
        if (sendEmoji) {
            sendEmoji(emoji);
        } else {
            sendMessage(emoji);
        }
        setEmojiPickerOpen(false);
    };

    return (
        <div className="flex flex-col h-full bg-white border-[3px] border-slate-800 rounded-2xl shadow-[6px_6px_0px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="flex-none px-3 md:px-4 py-2 bg-slate-800 text-white flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-1">
                    <span className="font-black text-[10px] uppercase tracking-[0.2em]">Chat</span>
                </div>
            </div>

            <div className={"flex-1 min-h-0 relative"}>
                <ScrollShadow
                    ref={ref}
                    hideScrollBar={true}
                    className="h-full p-3 md:p-4 space-y-3 md:space-y-4 bg-slate-50/50 relative"
                    onScroll={(e) => {
                        const target = e.currentTarget;
                        shouldAutoScrollRef.current = target.scrollHeight - target.scrollTop - target.clientHeight < 50;
                    }}
                >
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                         style={{
                             backgroundImage: 'radial-gradient(#000 1px, transparent 0)',
                             backgroundSize: '20px 20px'
                         }}/>

                    <div className="relative z-5">
                        {messages.map((message, index) => (
                            <ChatMessageItem
                                key={index}
                                data={message}
                                selfId={userInfo?.userId}
                            />
                        ))}
                    </div>
                </ScrollShadow>
            </div>

            <div className="flex-none p-2 md:p-3 border-t-[3px] border-slate-200 bg-white">
                <div className="flex gap-2"
                     style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <div className="relative flex-1">
                        <Input
                            style={{height: '32px'}}
                            placeholder="输入消息..."
                            className="group"
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    sendMessage(input);
                                }
                            }}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20">
                            <kbd className="font-sans">↵</kbd>
                        </div>
                    </div>

                    <Popover isOpen={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                        <Popover.Trigger>
                            <Button variant="outline" style={{width: '25px', height: '32px'}}>
                                <FaceSmile className={"size-5 md:size-6"} />
                            </Button>
                        </Popover.Trigger>
                        <Popover.Content className="p-2">
                            <Popover.Dialog>
                                <div className="grid grid-cols-8 gap-1">
                                    {commonEmojis.map((emoji, index) => (
                                        <button
                                            key={index}
                                            className="min-w-8 h-8 px-1 flex items-center justify-center text-xl hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                            onClick={() => handleEmojiClick(emoji)}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </Popover.Dialog>
                        </Popover.Content>
                    </Popover>

                    <Button style={{width: '25px', height: '32px'}}
                            onClick={() => {
                                sendMessage(input);
                            }}
                    >
                        <PaperAirplane className={"size-5 md:size-6"} transform="rotate(270)" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
