'use client';

import React from "react";
import {HandCard} from "@/components/HandCard";
import {UserInfo} from "@/types";

interface PlayAreaCardProps {
    user: UserInfo;
    card?: number;
}

export const PlayAreaCard = ({
    user,
    card,
}: PlayAreaCardProps) => {
    const hasCard = card !== null && card !== undefined;

    const cardWidth = 112;
    const cardHeight = 160;

    return (
        <div className="flex flex-col items-center gap-2">
            <div
                className="relative flex items-center justify-center"
                style={{
                    width: cardWidth,
                    height: cardHeight,
                }}
            >
                <div className="relative" style={{ zIndex: 1 }}>
                    <HandCard value={card} user={user} cardFace={hasCard ? "back" : "waiting"} showBadge={true} />
                </div>
            </div>
        </div>
    );
};
