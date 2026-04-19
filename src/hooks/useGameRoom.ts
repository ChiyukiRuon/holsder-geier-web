'use client';

import { useEffect, useState } from 'react';
import type {
    GameState,
    PlayerInfo,
    GameEndMessage,
    GameStartMessage,
    GameStateMessage,
    GameResolveMessage,
    GameSyncMessage,
} from '@/types';
import {useWS} from "@/components/providers/WebSocketProvider";
import {toast} from "@heroui/react";

export function useGameRoom() {
    const { isConnected, subscribe, sendGameAction } = useWS();

    const [gameState, setGameState] = useState<GameState | null>(null);
    const [players, setPlayers] = useState<PlayerInfo[]>([]);
    const [spectators, setSpectators] = useState<PlayerInfo[]>([]);
    const [roundWinner, setRoundWinner] = useState<PlayerInfo | null>(null);
    const [gameEndData, setGameEndData] = useState<GameEndMessage['payload'] | null>(null);

    // 出牌
    const playCard = (card: number) => {
        sendGameAction(card).catch(err => {
            console.error('send game action error', err);
            toast.danger(`出现错误: ${err.message}`, {timeout: 5000});
        });
    };

    useEffect(() => {
        if (!isConnected) return;

        const unSubscribes = [
            subscribe<GameStartMessage['payload']>('game.start', (data) => {
                setGameState(data.state);
                setPlayers(data.players);
                setSpectators(data.spectators);
                setRoundWinner(null);
                setGameEndData(null);
            }),

            subscribe<GameStateMessage['payload']>('game.state', (data) => {
                setGameState(data.state);
                setPlayers(data.players);
                setSpectators(data.spectators);
                setRoundWinner(null);
            }),

            subscribe<GameResolveMessage['payload']>('game.resolve', (data) => {
                setGameState(data.state);
                setPlayers(data.players);
                setSpectators(data.spectators);
                setRoundWinner(data.roundWinner);
            }),

            subscribe<GameEndMessage['payload']>('game.end', (data) => {
                setGameState(data.state);
                setPlayers(data.players);
                setSpectators(data.spectators);
                setGameEndData(data);
            }),

            subscribe<GameSyncMessage['payload']>('game.sync', (data) => {
                const {player, card} = data.action;

                setGameState(prev => {
                    if (!prev) return prev;

                    const updatedPlayedCards = [...prev.playedCards];
                    const existingIndex = updatedPlayedCards.findIndex(
                        item => item.playerId === player.user.userId
                    );

                    if (existingIndex >= 0) {
                        updatedPlayedCards[existingIndex] = {playerId: player.user.userId, card};
                    } else {
                        updatedPlayedCards.push({playerId: player.user.userId, card});
                    }

                    return {
                        ...prev,
                        playedCards: updatedPlayedCards
                    };
                });

                setPlayers(prevPlayers =>
                    prevPlayers.map(p =>
                        p.user.userId === player.user.userId ? player : p
                    )
                );
            })
        ];

        return () => unSubscribes.forEach(fn => fn());
    }, [isConnected, subscribe]);

    return {
        gameState,
        players,
        spectators,
        roundWinner,
        gameEndData,
        setGameEndData,
        playCard,
    };
}
