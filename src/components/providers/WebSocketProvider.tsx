'use client';

import React, { createContext, useContext } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

const WSContext = createContext<ReturnType<typeof useWebSocket> | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const ws = useWebSocket({ autoConnect: true });

    return (
        <WSContext.Provider value={ws}>
            {children}
        </WSContext.Provider>
    );
}

export function useWS() {
    const ctx = useContext(WSContext);
    if (!ctx) throw new Error('useWS must be used inside WebSocketProvider');
    return ctx;
}
