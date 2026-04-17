'use client';

import React from "react";
import {HandCard} from "@/components/HandCard";
import {UserInfo} from "@/types";

interface PlayAreaCardProps {
    user: UserInfo;
    cardFace: "front" | "back" | "waiting";
    card?: number;
    isHighlighted?: boolean;
}

export const PlayAreaCard = ({
    user,
    card,
    cardFace = "front",
    isHighlighted = false,
}: PlayAreaCardProps) => {
    const hasCard = card !== null && card !== undefined;

    const cardWidth = 112;
    const cardHeight = 160;

    return (
        <div className="flex flex-col items-center gap-2">
            <div
                className={`relative flex items-center justify-center transition-all duration-500 ${
                    isHighlighted ? '-translate-y-8 scale-110 z-20' : ''
                }`}
                style={{
                    width: cardWidth,
                    height: cardHeight,
                }}
            >
                <div className="relative" style={{ zIndex: 1 }}>
                    <HandCard value={card} user={user} cardFace={hasCard ? card === 0 ? "back" : cardFace : "waiting"} showBadge={true} enableHover={false} />
                </div>
            </div>
        </div>
    );
};
