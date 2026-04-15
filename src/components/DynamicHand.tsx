'use client';

import React, { useState, useLayoutEffect, useRef } from "react";
import { HandCard } from "@/components/HandCard";
import { UserInfo } from "@/types";

export const DynamicHand = ({ cards, user }: { cards: number[], user: UserInfo }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    // 监听容器大小变化
    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const updateWidth = () => {
            setContainerWidth(containerRef.current?.offsetWidth || 0);
        };

        const resizeObserver = new ResizeObserver(updateWidth);
        resizeObserver.observe(containerRef.current);

        updateWidth(); // 初始计算
        return () => resizeObserver.disconnect();
    }, []);

    // 计算逻辑
    const cardWidth = 112; // w-28 = 112px
    const n = cards.length;

    let negativeMargin = 0;
    if (containerWidth > 0 && n > 1) {
        const totalRequiredWidth = n * cardWidth;
        if (totalRequiredWidth > containerWidth) {
            // 计算为了挤进容器，每张牌需要重叠掉多少像素
            const visibleWidthPerCard = (containerWidth - cardWidth) / (n - 1);
            negativeMargin = cardWidth - visibleWidthPerCard;
        }
    }

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex justify-center items-end overflow-visible px-4"
        >
            <div className="flex items-end">
                {cards.map((val, index) => (
                    <div
                        key={`${val}-${index}`}
                        style={{
                            marginLeft: index === 0 ? 0 : -negativeMargin,
                            zIndex: index,
                        }}
                        className="transition-[margin] duration-300 ease-out"
                    >
                        <HandCard
                            value={val}
                            user={user}
                            cardFace={"front"}
                            showBadge={false}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
