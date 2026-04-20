'use client';

import React, {useLayoutEffect, useRef, useState} from "react";
import {HandCard} from "@/components/HandCard";
import {UserInfo} from "@/types";

interface DynamicHandProps {
    cards: number[];
    user: UserInfo;
    onCardPlayAction?: (card: number) => void;
    centerAreaRef?: React.RefObject<HTMLDivElement | null>;
    setIsPlayAreaHover?: (v: boolean) => void;
    setIsDragging?: (v: boolean) => void;
}

export const DynamicHand = ({
                                cards,
                                user,
                                onCardPlayAction,
                                centerAreaRef,
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

    useLayoutEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
                // 如果是纵向滚轮且有横向溢出，则转换滚动方向
                e.preventDefault();
                el.scrollLeft += e.deltaY;
            }
        };

        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, []);

    // 手牌布局
    const cardWidth = 112;
    const n = cards.length;

    // 设置最大重叠限制
    const maxOverlapLimit = cardWidth * 0.5;

    let negativeMargin = 0;
    let totalWidth = 0;

    if (n > 0) {
        // 尝试让手牌总宽度保持在容器宽度的 90%
        const maxAllowedWidth = containerWidth * 0.9;

        if (containerWidth > 0 && n > 1) {
            const idealWidthPerCard = maxAllowedWidth / n;

            if (cardWidth > idealWidthPerCard) {
                // 计算为了挤进容器需要的重叠量
                const requiredMargin = cardWidth - idealWidthPerCard;
                negativeMargin = Math.min(requiredMargin, maxOverlapLimit);
            } else {
                // 卡片较少时，保持 20% 的固定重叠，增加紧凑感
                negativeMargin = cardWidth * 0.2;
            }
        }

        // 2. 重新计算实际总宽度
        // 此时 totalWidth 可能会超过 containerWidth，从而触发横向滚动
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

        // (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
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
                    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
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

            const area = centerAreaRef?.current;
            if (area) {
                const rect = area.getBoundingClientRect();
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
                    WebkitOverflowScrolling: 'touch',
                    maxWidth: '100%'
                }}
            >
                <div
                    className="flex items-end pb-8 min-w-max mx-auto"
                    style={{
                        width: totalWidth,
                        maxWidth: 'none'
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
                                    visibility: containerWidth === 0 ? 'hidden' : 'visible',
                                    marginLeft: index === 0 ? 0 : -negativeMargin,
                                    opacity: isDragging && isActuallyDragging ? 0 : 1,
                                    transition: 'all 0.2s ease-out',
                                    touchAction: 'pan-x',
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
