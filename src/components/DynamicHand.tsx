'use client';

import React, {useLayoutEffect, useRef, useState} from "react";
import {HandCard} from "@/components/HandCard";
import {UserInfo} from "@/types";

interface DynamicHandProps {
    cards: number[];
    user: UserInfo;
    onCardPlayAction?: (card: number) => void;
    playAreaRef?: React.RefObject<HTMLDivElement | null>;
    setIsPlayAreaHover?: (v: boolean) => void;
    setIsDragging?: (v: boolean) => void;
}

export const DynamicHand = ({
                                cards,
                                user,
                                onCardPlayAction,
                                playAreaRef,
                                setIsPlayAreaHover,
                                setIsDragging
                            }: DynamicHandProps) => {

    const containerRef = useRef<HTMLDivElement>(null);

    const [containerWidth, setContainerWidth] = useState(0);

    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [ghostPos, setGhostPos] = useState({ x: 0, y: 0 });
    const [isOverPlayArea, setIsOverPlayArea] = useState(false);
    const [isReturning, setIsReturning] = useState(false);
    const [isActuallyDragging, setIsActuallyDragging] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);

    const startPosRef = useRef({ x: 0, y: 0 });

    // 手势判定状态
    const hasDecidedRef = useRef(false);

    // 宽度监听
    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const updateWidth = () => {
            setContainerWidth(containerRef.current?.offsetWidth || 0);
        };

        const observer = new ResizeObserver(updateWidth);
        observer.observe(containerRef.current);

        updateWidth();
        return () => observer.disconnect();
    }, []);

    // 手牌布局
    const cardWidth = 112;
    const n = cards.length;

    let negativeMargin = 0;
    let totalWidth = 0;

    if (n > 0) {
        // 计算总宽度：第一张卡完整宽度 + 后续卡牌的重叠部分
        // 目标：让手牌总宽度不超过容器宽度的 90%（留边距）
        const maxAllowedWidth = containerWidth * 0.9;

        if (containerWidth > 0 && n > 1) {
            // 理想情况下每张卡牌应该占据的宽度
            const idealWidthPerCard = maxAllowedWidth / n;

            if (cardWidth > idealWidthPerCard) {
                // 需要重叠：负边距 = 卡牌宽度 - 每张卡分配的宽度
                negativeMargin = cardWidth - idealWidthPerCard;
            } else {
                // 不需要重叠时，保持至少20%的重叠
                // 20%重叠意味着每张卡牌占据80%的宽度
                negativeMargin = cardWidth * 0.2;
            }
        }

        // 计算实际总宽度用于居中
        totalWidth = cardWidth + (n - 1) * (cardWidth - negativeMargin);
    }

    // Pointer
    const handlePointerDown = (e: React.PointerEvent, index: number) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

        setDraggingIndex(index);
        setGhostPos({
            x: rect.left,
            y: rect.top
        });

        startPosRef.current = {
            x: e.clientX,
            y: e.clientY
        };

        setIsActuallyDragging(false);
        setIsScrolling(false);
        hasDecidedRef.current = false;

        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (draggingIndex === null) return;

        const dx = e.clientX - startPosRef.current.x;
        const dy = e.clientY - startPosRef.current.y;

        // 手势判定 - 提高阈值到 15px,更容易触发拖拽
        if (!hasDecidedRef.current) {
            if (Math.abs(dx) > 15 || Math.abs(dy) > 15) {
                // 更宽松的判定:只要纵向移动明显就认为是拖拽
                if (Math.abs(dy) > Math.abs(dx) * 0.8) {
                    setIsActuallyDragging(true);
                } else {
                    setIsScrolling(true);
                }
                hasDecidedRef.current = true;
            }
            return; // 判定期间不更新位置
        }

        // 横向滑动不拖牌
        if (isScrolling) return;

        // 纵向拖动移动卡 - 使用绝对位置而非累加
        if (isActuallyDragging) {
            const originalRect = containerRef.current?.children[0]?.children[draggingIndex]?.getBoundingClientRect();

            if (originalRect) {
                setGhostPos({
                    x: originalRect.left + dx,
                    y: originalRect.top + dy
                });
            }

            // 出牌区检测
            const playArea = playAreaRef?.current;
            if (playArea) {
                const rect = playArea.getBoundingClientRect();

                const inside =
                    e.clientX >= rect.left &&
                    e.clientX <= rect.right &&
                    e.clientY >= rect.top &&
                    e.clientY <= rect.bottom;

                setIsOverPlayArea(inside);
                setIsPlayAreaHover?.(inside);
            }
        }
    };

    const handlePointerUp = () => {
        if (draggingIndex === null) return;

        // 滑动不算拖牌
        if (!isActuallyDragging) {
            reset();
            return;
        }

        if (isOverPlayArea) {
            onCardPlayAction?.(cards[draggingIndex]);
            reset();
            setIsPlayAreaHover?.(false);
        } else {
            setIsReturning(true);
            setIsPlayAreaHover?.(false);

            setTimeout(() => {
                reset();
                setIsReturning(false);
            }, 200);
        }
    };

    const reset = () => {
        setDraggingIndex(null);
        setIsOverPlayArea(false);
        setIsActuallyDragging(false);
        setIsScrolling(false);
        hasDecidedRef.current = false;
    };

    // 通知父组件
    React.useEffect(() => {
        setIsDragging?.(draggingIndex !== null && isActuallyDragging);
    }, [draggingIndex, isActuallyDragging, setIsDragging]);

    return (
        <>
            {/* 手牌 */}
            <div
                ref={containerRef}
                className={`w-full h-full px-4 no-scrollbar ${totalWidth > containerWidth ? 'overflow-x-auto' : 'overflow-x-visible'} ${totalWidth > containerWidth ? 'overflow-y-hidden' : 'overflow-y-visible'}`}
                style={{
                    touchAction: totalWidth > containerWidth ? 'pan-x' : 'auto',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                <div
                    className="flex items-end pb-8 min-w-max mx-auto"
                    style={{
                        width: totalWidth,
                        maxWidth: '100%'
                    }}
                >
                    {cards.map((val, index) => {

                        const isDragging = draggingIndex === index;

                        return (
                            <div
                                key={`${val}-${index}`}
                                onPointerDown={(e) => handlePointerDown(e, index)}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerUp}
                                style={{
                                    marginLeft: index === 0 ? 0 : -negativeMargin,
                                    opacity: isDragging && isActuallyDragging ? 0 : 1,
                                    transition: 'all 0.2s ease-out',
                                    touchAction: isScrolling ? 'auto' : 'none',
                                    flexShrink: 0,
                                    zIndex: isDragging ? 9999 : 1,
                                }}
                                className="group hover:-translate-y-6"
                            >
                                <HandCard
                                    value={val}
                                    user={user}
                                    cardFace={"front"}
                                    showBadge={false}
                                    enableHover={false}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 浮层卡 */}
            {draggingIndex !== null && isActuallyDragging && (
                <div
                    style={{
                        position: 'fixed',
                        left: ghostPos.x,
                        top: ghostPos.y,
                        zIndex: 9999,
                        pointerEvents: 'none',
                        transform: isOverPlayArea
                            ? 'scale(1.2)'
                            : 'scale(1.05)',
                        transition: isReturning
                            ? 'all 0.2s ease'
                            : 'none'
                    }}
                >
                    <HandCard
                        value={cards[draggingIndex]}
                        user={user}
                        cardFace={"front"}
                        showBadge={false}
                    />
                </div>
            )}
        </>
    );
};
