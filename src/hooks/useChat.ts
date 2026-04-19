'use client';

import { useEffect, useRef, useState } from 'react';
import type {ReceiveChatMessage, ChatSyncMessage, UserInfo, ChatReceiveMessage, ServerToastMessage} from '@/types';
import {useWS} from "@/components/providers/WebSocketProvider";
import {toast} from "@heroui/react";

export function useChat(userInfo: UserInfo | null) {
    const { isConnected, subscribe, sendChatMessage } = useWS();

    const [messages, setMessages] = useState<ReceiveChatMessage[]>([]);
    const [input, setInput] = useState('');

    const shouldAutoScrollRef = useRef(true);

    // 发送消息
    const sendMessage = (text: string) => {
        if (!text.trim() || !userInfo) return;

        sendChatMessage(text, userInfo).then(() => {
            setInput('');
            shouldAutoScrollRef.current = true;
        }).catch(err => {
            console.error('send chat message error', err);
            toast.danger(`发送消息失败: ${err.message}`, {timeout: 5000});
        });
    };

    // 表情发送
    const sendEmoji = async (emoji: string) => {
        sendMessage(emoji);
    };

    useEffect(() => {
        if (!isConnected) return;

        const unSubscribes = [
            subscribe<ChatReceiveMessage['payload']>('chat.receive', (msg) => {
                console.log('chat', msg);
                setMessages(prev => [...prev, msg]);
            }),

            subscribe<ChatSyncMessage['payload']>('chat.sync', (data) => {
                setMessages(data.messages);
            }),

            subscribe<ServerToastMessage['payload']>('server.toast', (data) => {
                switch (data.type) {
                    case 'info':
                        toast.info(data.message, { timeout: 5000 });
                        break;
                    case 'success':
                        toast.success(data.message, { timeout: 5000 });
                        break;
                    case 'warning':
                        toast.warning(data.message, { timeout: 5000 });
                        break;
                    case 'danger':
                        toast.danger(data.message, { timeout: 5000 });
                        break;
                }
            }),
        ];

        return () => unSubscribes.forEach(fn => fn());
    }, [isConnected, subscribe]);

    return {
        messages,
        input,
        setInput,
        sendMessage,
        sendEmoji,
        shouldAutoScrollRef,
    };
}
