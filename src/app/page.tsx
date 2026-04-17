'use client';

import packageJson from "../../package.json";
import {Badge, Button, Input, Popover, ScrollShadow, toast} from "@heroui/react";
import ShowUserInfo from "@/components/ShowUserInfo";
import {EditUserInfo} from "@/components/EditUserInfo";
import {DynamicHand} from "@/components/DynamicHand";
import {PlayAreaCard} from "@/components/PlayAreaCard";
import {
    PlayerInfo,
    RoomUpdateMessage,
    RoomInfo,
    UserInfo,
    GameSyncMessage,
    GameState,
    ServerErrorMessage, PlayerLatency, ServerPingMessage,
    GameStartMessage, GameStateMessage, GameEndMessage, ChatSyncMessage,
    ChatReceiveMessage, ReceiveChatMessage, GameResolveMessage, ServerInfo, ServerInfoMessage
} from "@/types";
import PointCard from "@/components/PointCard";
import {useEffect, useRef, useState} from "react";
import {generateNickname, generateUserColor} from "@/utils/user";
import {useWebSocket} from "@/hooks/useWebSocket";
import {ChatMessageItem} from "@/components/ChatMessageItem";
import {getGameStageName} from "@/utils/game";

function PointDeckBack({count}: { count: number }) {
    return (
        <div className="relative transition-transform hover:-translate-y-1">
            <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-xl bg-slate-300/50"/>
            <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 rounded-xl bg-slate-400/50"/>

            <Badge.Anchor>
                <div className="relative overflow-hidden rounded-xl shadow-lg ring-1 ring-black/5">
                    <PointCard cardFace={"back"} width={112} height={160}/>
                </div>
                <Badge
                    color="default"
                    placement={"bottom-right"}
                    className="
                        bg-slate-900 text-white
                        border-4 border-dashed border-slate-400
                        w-10 h-10 rounded-full
                        shadow-[0_4px_0_#000,0_8px_15px_rgba(0,0,0,0.5)]
                        flex items-center justify-center"
                >
                    <Badge.Label className="font-bold">{count}</Badge.Label>
                </Badge>
            </Badge.Anchor>
        </div>
    );
}

function PointCardStack({cards}: {cards: number[]}) {
    const filteredCards = cards.filter(card => card !== 0);

    if (!filteredCards || filteredCards.length === 0) return null;

    return (
        <div
            className="relative flex items-center"
            style={{
                width: 112 + (filteredCards.length - 1) * 32,
                height: 168
            }}
        >
            {filteredCards.map((v, i) => (
                <div
                    key={i}
                    className="absolute transition-all duration-300 ease-out hover:-translate-y-4 hover:z-50 cursor-pointer"
                    style={{
                        left: i * 32,
                        zIndex: i,
                    }}
                >
                    <div className="rounded-xl shadow-md hover:shadow-2xl ring-1 ring-black/5">
                        <PointCard cardFace={"front"} value={v} width={112} height={160}/>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function GameRoom() {
    const [userInfo, setUserInfo] = useState<UserInfo>({
        userId: crypto.randomUUID(),
        nickname: generateNickname(),
        avatar: "",
        background: "",
        color: generateUserColor()
    });
    const [players, setPlayers] = useState<PlayerInfo[]>([]);
    const [playerLatencies, setPlayerLatencies] = useState<PlayerLatency[]>([]);

    const [roomId, setRoomId] = useState("");
    const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
    const [chatInputValue, setChatInputValue] = useState("");
    const [roomChatMessages, setRoomChatMessages] = useState<ReceiveChatMessage[]>([]);

    const [gameState, setGameState] = useState<GameState | null>(null);
    const [roundWinner, setRoundWinner] = useState<PlayerInfo | null>(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isInRoom, setIsInRoom] = useState(false);
    const [isUserReady, setIsUserReady] = useState(false);

    const [isJoining, setIsJoining] = useState(false);
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const shouldAutoScrollRef = useRef(true);

    const commonEmojis = [
        '😀', '😂', '🤣', '😊', '😍', '🥰', '😘', '😜',
        '🤔', '😎', '🥳', '😭', '😱', '🤯', '👍', '👎',
        '👏', '🙏', '❤️', '🔥',  '🎉', '💯', '☝️🤓', '🤣👉',
    ];

    const {
        isConnected,
        serverInfo,
        subscribe,
        joinRoom,
        leaveRoom,
        setReady,
        sendGameAction,
        sendChatMessage,
        updateUser
    } = useWebSocket({
        autoConnect: true,
    });

    const isGameStarted = (() => {
        if (!gameState) return false;
        return gameState.stage !== "idle" && gameState.stage !== "end";
    })();

    const playedCards = (() => {
        if (!gameState) return players.map(player => ({
            user: player.user,
            card: null
        }));

        return players.map(player => {
            const playedCard = gameState.playedCards.find(
                item => item.playerId === player.user.userId
            );
            return {
                user: player.user,
                card: playedCard?.card ?? null
            };
        });
    })();

    const lastPlayedCards = (() => {
        if (!gameState?.lastPlayedCards) return [];

        // 按照 players 的顺序来构建 lastPlayedCards
        return players
            .map(player => {
                const playedCard = gameState.lastPlayedCards?.find(
                    item => item.playerId === player.user.userId
                );
                return {
                    user: player.user,
                    card: playedCard?.card ?? null
                };
            })
            .filter(item => item.card !== null);
    })();

    // 初始化玩家信息
    useEffect(() => {
        const stored = localStorage.getItem("userInfo");

        if (stored) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUserInfo(JSON.parse(stored));
        } else {
            const info: UserInfo = {
                userId: crypto.randomUUID(),
                nickname: generateNickname(),
                avatar: "",
                background: "",
                color: generateUserColor()
            };
            localStorage.setItem("userInfo", JSON.stringify(info));
            setUserInfo(info);
        }
    }, []);

    // WS 消息处理
    useEffect(() => {
        if (!isConnected) return;

        const unsubscribes = [
            subscribe('server.ping', (ping: ServerPingMessage["payload"]) => {
                if (ping.latencies) {
                    setPlayerLatencies(ping.latencies);
                }
            }),

            subscribe('server.error', (error: ServerErrorMessage["payload"]) => {
                console.log('server error', error);
                toast.danger(error.message);
            }),

            subscribe('room.update', (data: RoomUpdateMessage["payload"]) => {
                console.log('room update', data.room);
                setPlayers(data.room.players);
                setRoomInfo(data.room);
            }),

            subscribe('game.start', (data: GameStartMessage["payload"]) => {
                console.log('game start', data);
                setGameState(data.state);
                setPlayers(data.players);
                setIsUserReady(false);
            }),

            subscribe('game.end', (data: GameEndMessage["payload"]) => {
                console.log('game end', data);
                setGameState(data.state);
                setPlayers(data.players);
                setIsUserReady(false);
            }),

            subscribe('game.resolve', (data: GameResolveMessage["payload"]) => {
                console.log('game resolve', data);
                setGameState(data.state);
                setPlayers(data.players);
                setRoundWinner(data.roundWinner);
                setIsUserReady(false);
            }),

            subscribe('game.sync', (data: GameSyncMessage["payload"]) => {
                console.log('game sync', data);

                const { player, card } = data.action;

                setGameState(prevState => {
                    if (!prevState) return prevState;

                    const updatedPlayedCards = [...prevState.playedCards];
                    const existingIndex = updatedPlayedCards.findIndex(
                        item => item.playerId === player.user.userId
                    );

                    if (existingIndex >= 0) {
                        updatedPlayedCards[existingIndex] = { playerId: player.user.userId, card };
                    } else {
                        updatedPlayedCards.push({ playerId: player.user.userId, card });
                    }

                    return {
                        ...prevState,
                        playedCards: updatedPlayedCards
                    };
                });

                setPlayers(prevPlayers =>
                    prevPlayers.map(p =>
                        p.user.userId === player.user.userId ? player : p
                    )
                );
            }),

            subscribe('game.state', (data: GameStateMessage["payload"]) => {
                console.log('game state', data);
                setGameState(data.state);
                setPlayers(data.players);
                setRoundWinner(null);
            }),

            subscribe('chat.receive', (msg: ChatReceiveMessage["payload"]) => {
                console.log('chat', msg);
                setRoomChatMessages(prev => [...prev, msg]);
            }),

            subscribe('chat.sync', (data: ChatSyncMessage["payload"]) => {
                setRoomChatMessages(data.messages);
            }),
        ];

        return () => {
            unsubscribes.forEach(unsubscribe => unsubscribe());
        };
    }, [isConnected, subscribe]);

    useEffect(() => {
        if (!roomInfo) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPlayers(roomInfo.players);
    }, [roomInfo]);

    useEffect(() => {

    }, [gameState])

    useEffect(() => {
        if (shouldAutoScrollRef.current && chatContainerRef.current) {
            const scrollContainer = chatContainerRef.current.querySelector('[data-slot="scroll-shadow-viewport"]') ||
                chatContainerRef.current;
            setTimeout(() => {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }, 100);
        }
    }, [roomChatMessages]);

    const updateUserInfo = <K extends keyof UserInfo>(
        key: K,
        value: UserInfo[K]
    ) => {
        setUserInfo(prev => {
            if (!prev) return prev;

            const updated = {
                ...prev,
                [key]: value
            };

            localStorage.setItem("userInfo", JSON.stringify(updated));
            updateUser(updated).then(() => {

            }).catch(err => {
                console.error('update user error', err);
                toast.danger(`更新用户信息失败: ${err.message}`, {timeout: 5000})
            });

            console.log('updateUserInfo', updated);

            return updated;
        });
    };

    const handleJoinRoom = (inputRoomId: string) => {
        if (!inputRoomId.trim()) return;

        setIsJoining(true);
        joinRoom(inputRoomId, userInfo).then((res) => {
            setRoomId(inputRoomId);
            setIsInRoom(true);
        }).catch(err => {
            console.error('join room error', err);
            toast.danger(`加入房间失败: ${err.message}`, {timeout: 5000})
        }).finally(() => {
            setIsJoining(false);
        });
    };

    const handleLeaveRoom = () => {
        leaveRoom().then(() => {
            toast.success('已离开房间');
            setIsInRoom(false);
            setIsUserReady(false);
            setPlayers([]);
            setRoomId("");
            setRoomInfo(null);
            setGameState(null);
            setRoomChatMessages([]);
        }).catch(err => {
            console.error('leave room error', err);
            toast.danger(`离开房间失败: ${err.message}`, {timeout: 5000})
        });
    };

    const handleUserReady = () => {
        setReady(!isUserReady).then(() => {
            setIsUserReady(!isUserReady);
        }).catch(err => {
            console.error('set ready error', err);
            toast.danger(`出现错误: ${err.message}`, {timeout: 5000})
        });
    };

    const handleCardPlay = (card: number) => {
        sendGameAction(card).then(() => {
            console.log('send game action', card);

            setGameState(prevState => {
                if (!prevState) return prevState;

                const updatedPlayedCards = [...prevState.playedCards];
                const existingIndex = updatedPlayedCards.findIndex(
                    item => item.playerId === userInfo.userId
                );

                if (existingIndex >= 0) {
                    updatedPlayedCards[existingIndex] = { playerId: userInfo.userId, card };
                } else {
                    updatedPlayedCards.push({ playerId: userInfo.userId, card });
                }

                return {
                    ...prevState,
                    playedCards: updatedPlayedCards
                };
            });
        }).catch(err => {
            console.error('send game action error', err);
            toast.danger(`出现错误: ${err.message}`, {timeout: 5000})
        });
    };

    const handleSendChatMessage = (message: string) => {
        if (!message.trim()) return;
        sendChatMessage(message, userInfo).then(() => {
            setChatInputValue("");
            shouldAutoScrollRef.current = true;
        }).catch(err => {
            console.error('send chat message error', err);
            toast.danger(`发送消息失败: ${err.message}`, {timeout: 5000})
        });
    };

    const handleEmojiClick = (emoji: string) => {
        handleSendChatMessage(emoji);
        setEmojiPickerOpen(false);
    };

    return (
        <div className="h-screen w-full bg-slate-300 p-6 grid grid-cols-12 gap-6 overflow-hidden relative">

            {/* 1. 背景纹理与装饰 */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
                 style={{
                     // backgroundImage: 'radial-gradient(#000 1.5px, transparent 0)',
                     backgroundSize: '32px 32px'
                 }}
            />
            <div
                className="absolute inset-0 pointer-events-none bg-linear-to-b from-transparent via-transparent to-black/5"/>

            {/* 游戏区域 */}
            <div className="col-span-9 flex flex-col relative group">
                {/* 边框装饰 */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-slate-800 z-10"/>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-slate-800 z-10"/>

                <div
                    className="flex-1 bg-slate-100/80 backdrop-blur-sm border-4 border-slate-800 rounded-2xl shadow-[10px_10px_0px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col">
                    {/* 游戏区顶部状态栏 */}
                    <div className="h-12 bg-slate-800 flex items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}/>
                            <span className="text-white text-xs font-black tracking-widest uppercase italic">
                                Room{roomId ? `#${roomId}` : ''}
                            </span>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-amber-400 font-mono text-sm font-black">ROUND {gameState?.currentRound ?? 0} - {getGameStageName(gameState?.stage)}</div>
                        </div>
                    </div>

                    {/* 主画布区域 */}
                    <div className="flex-1 h-full flex flex-col gap-4 p-8 overflow-hidden">

                        {/* 桌面区 */}
                        <div className="flex-1 flex flex-col gap-6 min-h-0">
                            {/* 得分牌展示区 */}
                            <div
                                className="flex flex-col items-center justify-center gap-20 py-8 px-12 rounded-3xl bg-slate-50/40 backdrop-blur-sm border-2 border-slate-200/60 shadow-inner relative">
                                {/* 背景水印 */}
                                <div
                                    className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none text-8xl font-black">
                                    BOARD
                                </div>

                                <div className="relative z-10 flex items-center gap-20">
                                    <div className="flex flex-col items-center gap-3">
                                        <PointDeckBack count={gameState ? 15 - gameState.currentRound : 15}/>
                                    </div>

                                    <div className="h-24 w-0.5 bg-slate-300/50"/>

                                    <div className="flex flex-col items-center gap-3">
                                        {(gameState?.carriedOverCards?.length || gameState?.currentPointCard) && (
                                            <PointCardStack cards={[
                                                ...(gameState?.carriedOverCards || []),
                                                gameState?.currentPointCard ?? 0
                                            ]}/>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 出牌区 */}
                            <div className="flex-1 flex flex-col items-center justify-center relative min-h-45">
                                <div
                                    className="absolute top-0 text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase">
                                    Current
                                </div>
                                <div className="flex gap-6 items-center justify-center">
                                    {playedCards.map((player) => (
                                        <div key={player.user.userId}
                                             className="scale-75 opacity-80 hover:opacity-100 transition-opacity">
                                            <PlayAreaCard
                                                user={player.user}
                                                cardFace={"front"}
                                                card={player.card ?? undefined}
                                                isHighlighted={roundWinner?.user.userId === player.user.userId && gameState?.stage === 'resolve'}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 弃牌区 */}
                            <div className="flex flex-col gap-2 mt-auto">
                                <div className="flex items-center gap-2 px-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"/>
                                    <span
                                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest">History</span>
                                </div>
                                <div className="rounded-2xl bg-slate-200/30 border-2 border-dashed border-slate-300/50">
                                    <div
                                        className="px-6 py-4 flex items-center justify-center gap-8 overflow-x-auto min-h-25">
                                        {lastPlayedCards.length > 0 ? (
                                            lastPlayedCards.map((player) => (
                                                <div key={player.user.userId}
                                                     className="scale-75 opacity-80 hover:opacity-100 transition-opacity">
                                                    <PlayAreaCard
                                                        user={player.user}
                                                        cardFace={"front"}
                                                        card={player.card ?? undefined}
                                                    />
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-300 italic uppercase">No cards discarded yet</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 手牌区 */}
                        <div className="h-48 flex-none relative z-50">
                            {/* 手牌区背景阴影 */}
                            <div
                                className="absolute -inset-x-8 top-12 -bottom-8 bg-linear-to-t from-slate-900/10 to-transparent pointer-events-none"/>

                            {isGameStarted ?
                                (
                                    <div className="h-full flex items-end justify-center">
                                        <DynamicHand
                                            cards={players.find(p => p.user.userId === userInfo.userId)?.card ?? []}
                                            user={userInfo}
                                            onCardPlay={(card) => handleCardPlay(card)}
                                        />
                                    </div>
                                ) : (
                                    isInRoom && (
                                        <div
                                            className="h-full flex items-center justify-center animate-in fade-in zoom-in duration-300">
                                            {isUserReady ?
                                                (
                                                    <Button
                                                        className="relative group transition-all duration-200 active:translate-y-1"
                                                        style={{
                                                            height: '48px',
                                                            padding: '0 40px',
                                                            // 使用更具警示感但不刺眼的色调
                                                            backgroundColor: '#f43f5e',
                                                            color: 'white',
                                                            fontSize: '14px',
                                                            fontWeight: '900',
                                                            letterSpacing: '0.2em',
                                                            borderRadius: '12px',
                                                            border: 'none',
                                                            boxShadow: '0 4px 0 0 #be123c, 0 8px 15px -5px rgba(244, 63, 94, 0.4)',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            textTransform: 'uppercase'
                                                        }}
                                                        onClick={() => {
                                                            handleUserReady();
                                                        }}
                                                    >
                                                        <span className="relative z-10">取消 CANCEL</span>
                                                        <div
                                                            className="absolute inset-0 rounded-3xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"/>
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        className="relative group transition-all duration-200 active:translate-y-1"
                                                        style={{
                                                            height: '48px',
                                                            padding: '0 40px',
                                                            backgroundColor: '#3b82f6',
                                                            color: 'white',
                                                            fontSize: '14px',
                                                            fontWeight: '900',
                                                            letterSpacing: '0.2em',
                                                            borderRadius: '12px',
                                                            border: 'none',
                                                            boxShadow: '0 4px 0 0 #2563eb, 0 8px 15px -5px rgba(59, 130, 246, 0.5)',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            textTransform: 'uppercase'
                                                        }}
                                                        onClick={() => {
                                                            handleUserReady();
                                                        }}
                                                    >
                                                        <span className="relative z-10">准备 READY</span>
                                                        <div
                                                            className="absolute inset-0 rounded-12px bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"/>
                                                    </Button>
                                                )}
                                        </div>
                                    )
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* 控制面板与信息 */}
            <div className="col-span-3 flex flex-col gap-6 h-full flex-1 min-h-0">

                {/* 房间控制区 */}
                <div
                    className="flex-none bg-white border-[3px] border-slate-800 rounded-2xl shadow-[6px_6px_0px_rgba(0,0,0,0.1)] p-4">
                    <div className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-tight">Room</div>

                    {isInRoom ? (
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <Button
                                    className="w-full font-black text-xs uppercase tracking-wider"
                                    style={{
                                        height: '40px',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        border: '2px solid #2563eb',
                                    }}
                                    onPress={() => {
                                        navigator.clipboard.writeText(roomId);
                                    }}
                                >
                                    分享
                                </Button>
                                <Button
                                    className="w-full font-black text-xs uppercase tracking-wider"
                                    style={{
                                        height: '40px',
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        border: '2px solid #dc2626',
                                    }}
                                    onPress={handleLeaveRoom}
                                >
                                    离开
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="房间 ID"
                                    className="flex-1"
                                    style={{
                                        height: '40px',
                                    }}
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                />
                                <Button
                                    className="font-black text-xs uppercase tracking-wider"
                                    style={{
                                        height: '40px',
                                        minWidth: '80px',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        border: '2px solid #2563eb',
                                    }}
                                    onPress={() => handleJoinRoom(roomId)}
                                    isDisabled={!roomId.trim() || !isConnected}
                                >
                                    加入
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 玩家状态面板*/}
                <div
                    className="bg-white border-[3px] border-slate-800 rounded-2xl shadow-[6px_6px_0px_rgba(0,0,0,0.1)] p-3 flex flex-col">
                    <div
                        className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-tight shrink-0">Players
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <div className="flex flex-col gap-1 h-full overflow-y-auto">
                            <Badge.Anchor className={"m-1"}>
                                <ShowUserInfo
                                    type={"lg"}
                                    player={{
                                        user: userInfo,
                                        latency: playerLatencies.find(pl => pl.userId === userInfo.userId)?.latency ?? 0,
                                        ready: false,
                                        card: [],
                                        point: players.find((p) => p.user.userId === userInfo.userId)?.point || { count: 0, list: [] },
                                        currentPlayerCard: undefined,
                                        lastPlayerCard: undefined
                                    }}
                                    latency={players.find((p) => p.user.userId === userInfo.userId)?.latency || 0}
                                    showEditButton={true}
                                    onEdit={() => {
                                        setIsEditModalOpen(true);
                                    }}
                                />
                                {isUserReady && (
                                    <Badge color={"success"} size={"sm"}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                             strokeWidth="1.5" stroke="currentColor" className="size-2.5" color={"white"}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                                        </svg>
                                    </Badge>
                                )}
                            </Badge.Anchor>
                            {players.length === 0 && (
                                <div className="text-center text-xs text-slate-400 py-4">
                                {isConnected ? isInRoom ? '等待其他玩家加入...' : '未加入房间' : '未连接'}
                                </div>
                            )}
                            {players.map((p) => (
                                p.user.userId !== userInfo?.userId && (
                                    <div key={p.user.userId}
                                         className="flex items-center justify-between p-2 rounded-lg bg-content1 shrink-0">
                                        <Badge.Anchor className={"w-full"}>
                                            <ShowUserInfo
                                                type={"lg"}
                                                player={p}
                                                latency={playerLatencies.find(pl => pl.userId === p.user.userId)?.latency ?? p.latency}
                                                onEdit={() => setIsEditModalOpen(true)}
                                            />
                                            {p.ready && <Badge color={"success"} size={"sm"}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                     strokeWidth="1.5" stroke="currentColor" className="size-2.5" color={"white"}>
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                          d="m4.5 12.75 6 6 9-13.5"/>
                                                </svg>
                                            </Badge>}
                                        </Badge.Anchor>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </div>

                {/* 聊天与日志 */}
                <div
                    className="flex-1 flex flex-col min-h-0 bg-white border-[3px] border-slate-800 rounded-2xl shadow-[6px_6px_0px_rgba(0,0,0,0.1)] overflow-hidden">
                    {/* 聊天区域 */}
                    <div
                        className="flex-none px-4 py-2 bg-slate-800 text-white flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-1">
                            <span className="font-black text-[10px] uppercase tracking-[0.2em]">Chat</span>
                        </div>
                    </div>

                    {/* Chat */}
                    <div className={"flex-1 min-h-0 relative"}>
                        <ScrollShadow
                            ref={chatContainerRef}
                            hideScrollBar={true}
                            className="h-full p-4 space-y-4 bg-slate-50/50 relative"
                            onScroll={(e) => {
                                const target = e.currentTarget;
                                const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 50;
                                shouldAutoScrollRef.current = isAtBottom;
                            }}
                        >
                            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                                 style={{
                                     backgroundImage: 'radial-gradient(#000 1px, transparent 0)',
                                     backgroundSize: '20px 20px'
                                 }}/>

                            <div className="relative z-10"> {/* 消息内容包裹层 */}
                                {roomChatMessages.map((message, index) => (
                                    <ChatMessageItem key={index} data={message} selfId={userInfo?.userId} />
                                ))}
                            </div>
                        </ScrollShadow>
                    </div>

                    {/* 3. Input Area: 模拟控制台输入 */}
                    <div className="flex-none p-3 border-t-[3px] border-slate-200 bg-white">
                        <div className="flex gap-2"
                             style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                            <div className="relative flex-1">
                                <Input
                                    style={{height: '35px'}}
                                    placeholder="输入消息..."
                                    className="group"
                                    value={chatInputValue}
                                    onChange={(event) => setChatInputValue(event.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSendChatMessage(chatInputValue);
                                        }
                                    }}
                                />
                                {/* 输入框装饰图标 */}
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20">
                                    <kbd className="font-sans">↵</kbd>
                                </div>
                            </div>

                            <Popover isOpen={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                                <Popover.Trigger>
                                    <Button variant="outline" style={{width: '25px', height: '35px'}}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                             strokeWidth="1.5" stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                  d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"/>
                                        </svg>
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
                            <Button style={{width: '25px', height: '35px'}}
                                  onClick={() => {
                                     handleSendChatMessage(chatInputValue);
                                 }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                     strokeWidth="1.5" stroke="currentColor" className="size-6"
                                     transform={"rotate(270)"}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"/>
                                </svg>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 4. 底部品牌/版本标识 */}
                <div className="flex items-center justify-between px-2 opacity-40">
                    <a href="https://github.com/ChiyukiRuon/holsder-geier-web" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                    </a>
                    <div className="flex gap-2 text-[10px] font-bold text-slate-600 uppercase">
                        <span>{isConnected ? serverInfo ? `SERVER ${serverInfo.version}`: 'Connected' : 'Disconnected'}</span>
                        <span>|</span>
                        <span>Client {packageJson.version}</span>
                    </div>
                </div>
            </div>

            {isEditModalOpen && (
                <EditUserInfo
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={(data) => {
                        if (data.nickname) updateUserInfo("nickname", data.nickname);
                        if (data.avatar) updateUserInfo("avatar", data.avatar);
                        if (data.color) updateUserInfo("color", data.color);
                        if (data.background) updateUserInfo("background", data.background);
                    }}
                    initialData={userInfo}
                />
            )}
        </div>
    );
}
