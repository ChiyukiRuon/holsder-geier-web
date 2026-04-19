import {Button, Modal} from "@heroui/react";
import PointCard from "@/components/PointCard";
import type {PlayerInfo, GameEndMessage} from "@/types";
import ShowUserInfo from "@/components/ShowUserInfo";

interface GameEndModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReady?: () => void;
    gameEndData: GameEndMessage["payload"] | null;
    players: PlayerInfo[];
    selfId?: string;
}

export function GameEndModal({
                                 isOpen,
                                 onClose,
                                 onReady,
                                 gameEndData,
                                 players,
                                 selfId
                             }: GameEndModalProps) {
    if (!gameEndData) return null;

    const hasWinner = !!gameEndData.winnerId;
    const winner = hasWinner ? players.find((p) => p.user.userId === gameEndData.winnerId) : null;

    const handleReady = () => {
        if (onReady) {
            onReady();
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose}>
            <Modal.Backdrop isDismissable={false} className="bg-black/60 backdrop-blur-sm">
                <Modal.Container placement="center" size="md">
                    <Modal.Dialog className="
                        bg-white border-4 border-slate-800 rounded-2xl
                        shadow-[12px_12px_0px_rgba(0,0,0,0.15)]
                        overflow-hidden
                    ">
                        {/* 标题区 */}
                        <div className="bg-slate-800 px-6 py-4 text-center">
                            <h2 className="text-2xl font-black text-white uppercase tracking-widest">
                                游戏结束
                            </h2>
                            <p className="text-slate-300 text-xs font-bold mt-1 uppercase tracking-wide">
                                Game Over
                            </p>
                        </div>

                        {/* 内容区 */}
                        <Modal.Body className="p-6 space-y-6">
                            {/* 获胜者展示 */}
                            {hasWinner && winner ? (
                                <div className="text-center space-y-4">
                                    <div className="inline-block relative">
                                        <div
                                            className="absolute -inset-4 bg-linear-to-r from-amber-400 via-yellow-500 to-amber-400 rounded-full opacity-20 animate-pulse"/>
                                        <ShowUserInfo
                                            type={"md"}
                                            player={winner}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="space-y-2">
                                            <div className="text-4xl font-black text-amber-500">
                                                🏆 {winner.user.nickname}
                                            </div>
                                            <div
                                                className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                                最终得分: <span
                                                className="text-amber-600 text-lg">{gameEndData.rankings.find((r) => r.playerId === winner.user.userId)?.totalPoint ?? 0}</span> 分
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-4">
                                    <div className="inline-block relative">
                                        无人获胜
                                    </div>
                                </div>
                            )}

                            {/* 排行榜 */}
                            <div className="border-t-2 border-slate-200 pt-4">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                                    最终排名与得分详情
                                </h3>
                                <div className="space-y-3">
                                    {gameEndData.rankings.map((player, index) => {
                                        // 获取该玩家的详细推牌记录
                                        const details = gameEndData?.playerPointDetails.find(
                                            (d) => d.playerId === player.playerId
                                        );

                                        return (
                                            <div
                                                key={player.playerId}
                                                className={`flex flex-col p-3 rounded-xl border-2 transition-all
                                                    ${hasWinner && index === 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}
                                                `}
                                            >
                                                {/* 玩家信息首行 */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm
                                                            ${hasWinner && index === 0 ? 'bg-amber-400 text-white' :
                                                            hasWinner && index === 1 ? 'bg-slate-400 text-white' :
                                                                hasWinner && index === 2 ? 'bg-orange-400 text-white' :
                                                                    'bg-slate-200 text-slate-600'}
                                                        `}>
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-slate-700 text-sm flex gap-1 items-center">
                                                                <div>
                                                                    {players.find((p) => p.user.userId === player.playerId)?.user.nickname}
                                                                </div>
                                                                {selfId === player.playerId && (
                                                                    <span className="text-[8px] text-amber-600 font-bold uppercase">
                                                                        (你)
                                                                    </span>
                                                                )}
                                                            </span>
                                                            <span
                                                                className="text-[10px] text-slate-400 font-bold uppercase">
                                                                Total: <span
                                                                className={hasWinner && index === 0 ? 'text-amber-600' : 'text-slate-600'}>{player.totalPoint} PT</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {hasWinner && index === 0 ? (
                                                        <span className="text-2xl animate-bounce">👑</span>
                                                    ) : (
                                                        <span
                                                            className="text-xs font-bold text-slate-400">#{index + 1}</span>
                                                    )}
                                                </div>

                                                {/* 卡牌展示区：横向滚动 */}
                                                <div
                                                    className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                                                    {details?.pointCards.map((cardValue: number, cardIdx: number) => (
                                                        <div
                                                            key={cardIdx}
                                                            className="shrink-0 transform hover:-translate-y-1 transition-transform"
                                                        >
                                                            <PointCard
                                                                cardFace="front"
                                                                value={cardValue}
                                                                width={32}
                                                                height={44}
                                                            />
                                                        </div>
                                                    ))}
                                                    {(!details || details.pointCards.length === 0) && (
                                                        <span
                                                            className="text-[10px] italic text-slate-400">未获得卡牌</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </Modal.Body>

                        {/* 底部按钮 */}
                        <Modal.Footer className="px-6 pb-6 pt-2 flex gap-3">
                            <Button
                                className="flex-1 font-black text-sm uppercase tracking-wider"
                                style={{
                                    height: '44px',
                                    backgroundColor: '#f43f5e',
                                    color: 'white',
                                    border: '2px solid #be123c',
                                }}
                                onPress={onClose}
                            >
                                关闭
                            </Button>
                            {selfId && (() => {
                                const selfPlayer = players.find((p) => p.user.userId === selfId);
                                return selfPlayer?.role === "player" ? (
                                    <Button
                                        className="flex-1 font-black text-sm uppercase tracking-wider"
                                        style={{
                                            height: '44px',
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            border: '2px solid #2563eb',
                                        }}
                                        onPress={handleReady}
                                    >
                                        准备
                                    </Button>
                                ) : (
                                    <Button
                                        className="flex-1 font-black text-sm uppercase tracking-wider"
                                        style={{
                                            height: '44px',
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            border: '2px solid #2563eb',
                                        }}
                                        onPress={onClose}
                                    >
                                        确定
                                    </Button>
                                );
                            })()}
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
