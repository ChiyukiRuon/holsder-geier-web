'use client';

import React, { useState, useLayoutEffect, useRef } from "react";
import { HandCard } from "@/components/HandCard";
import { UserInfo } from "@/types";

export const DynamicHand = ({ cards, user, onCardPlay }: { cards: number[], user: UserInfo, onCardPlay?: (card: number) => void }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [draggedCardIndex, setDraggedCardIndex] = useState<number | null>(null);

    // 监听容器大小变化
    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const updateWidth = () => {
            setContainerWidth(containerRef.current?.offsetWidth || 0);
        };

        const resizeObserver = new ResizeObserver(updateWidth);
        resizeObserver.observe(containerRef.current);

        updateWidth();
        return () => resizeObserver.disconnect();
    }, []);

    // 计算逻辑
    const cardWidth = 112;
    const n = cards.length;

    let negativeMargin = 0;
    if (containerWidth > 0 && n > 1) {
        const totalRequiredWidth = n * cardWidth;
        if (totalRequiredWidth > containerWidth) {
            const visibleWidthPerCard = (containerWidth - cardWidth) / (n - 1);
            negativeMargin = cardWidth - visibleWidthPerCard;
        }
    }

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedCardIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());

        const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-9999px';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(e.currentTarget, 56, 80);

        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);
    };

    const handleDragEnd = () => {
        setDraggedCardIndex(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const cardIndex = parseInt(e.dataTransfer.getData('text/plain'));
        if (!isNaN(cardIndex) && onCardPlay) {
            onCardPlay(cards[cardIndex]);
        }
        setDraggedCardIndex(null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex justify-center items-end overflow-visible px-4"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <div className="flex items-end">
                {cards.map((val, index) => (
                    <div
                        key={`${val}-${index}`}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        style={{
                            marginLeft: index === 0 ? 0 : -negativeMargin,
                            zIndex: draggedCardIndex === index ? 100 : index,
                            cursor: 'grabbing',
                            transition: 'all 0.2s ease-out',
                            transform: draggedCardIndex === index ? 'translateY(-30px) scale(1.05)' : 'translateY(0)',
                        }}
                        className="transition-[margin] duration-300 ease-out hover:-translate-y-4"
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
