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

    return (
        <div className="flex flex-col items-center gap-1 md:gap-2">
            <div
                className={`relative flex items-center justify-center transition-all duration-500 w-14 h-20 md:w-28 md:h-40 ${
                    isHighlighted ? '-translate-y-8 scale-110 z-20' : ''
                }`}
            >
                <div className="relative" style={{ zIndex: 1 }}>
                    <HandCard value={card} user={user} cardFace={hasCard ? card === 0 ? "back" : cardFace : "waiting"} showBadge={true} enableHover={false} />
                </div>
            </div>
        </div>
    );
};
