import React from "react";

interface PointCardIconProps {
    cardFace: "front" | "back";
    textColor?: string;
    width?: number | string;
    height?: number | string;
    value?: number;
}

const StarIcon = ({ color }: { color: string }) => (
    <g transform="translate(-12, -12) scale(0.5)">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            stroke={color}
            fill="none"
            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
        />
    </g>
);

const MoonIcon = ({ color }: { color: string }) => (
    <g transform="translate(-12, -12) scale(0.5)">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            stroke={color}
            fill="none"
            d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
        />
    </g>
);

export default function PointCard({
    cardFace,
    textColor,
    width = "112rem",
    height = "160rem",
    value,
}: PointCardIconProps) {
    if (cardFace === "front") {
        const isPositive = value !== undefined && value > 0;
        const displayValue = value !== undefined ? value.toString() : "?";

        const defaultColor = isPositive ? "#22c55e" : "#6366f1";
        const bgColor = isPositive ? "#ecfdf5" : "#eef2ff";

        const mainColor = textColor ?? defaultColor;
        const backgroundColor = textColor ? "#ffffff" : bgColor;

        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 140"
                width={width}
                height={height}
            >
                <defs>
                    <filter id="cardShadowFront" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="2" dy="3" stdDeviation="3" floodOpacity="0.12" floodColor={mainColor} />
                    </filter>
                </defs>
                <rect
                    x="5"
                    y="5"
                    width="90"
                    height="130"
                    rx="8"
                    ry="8"
                    fill={backgroundColor}
                    stroke={mainColor}
                    strokeWidth="3"
                    filter="url(#cardShadowFront)"
                />

                <circle cx="50" cy="60" r="35" fill={mainColor} fillOpacity={textColor ? 0.12 : 0.08} />

                <text
                    x="50"
                    y="80"
                    fontSize="60"
                    fontFamily="Arial, sans-serif"
                    fontWeight="700"
                    textAnchor="middle"
                    fill={mainColor}
                >
                    {displayValue}
                </text>
                <text
                    x="50"
                    y="107"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="Arial, sans-serif"
                    textAnchor="middle"
                    fill={mainColor}
                >
                    POINTS
                </text>

                <g transform="translate(10, 22)">
                    <text
                        fontSize="12"
                        fontFamily="Arial, sans-serif"
                        fontWeight="700"
                        fill={mainColor}
                    >
                        {displayValue}
                    </text>
                </g>

                <g transform="translate(20.2, 35)">
                    {isPositive ? <StarIcon color={mainColor} /> : <MoonIcon color={mainColor} />}
                </g>

                <g transform="translate(90, 118) rotate(180)">
                    <text
                        fontSize="12"
                        fontFamily="Arial, sans-serif"
                        fontWeight="700"
                        fill={mainColor}
                    >
                        {displayValue}
                    </text>
                </g>

                <g transform="translate(92, 117)">
                    {isPositive ? <StarIcon color={mainColor} /> : <MoonIcon color={mainColor} />}
                </g>
            </svg>
        );
    }

    if (cardFace === "back") {
        const defaultColor = "#334155";
        const bgColor = "#f1f5f9";

        const mainColor = textColor ?? defaultColor;
        const backgroundColor = textColor ? "#ffffff" : bgColor;

        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 140"
                width={width}
                height={height}
            >
                <defs>
                    <filter id="cardShadowBack" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="2" dy="3" stdDeviation="3" floodOpacity="0.12" floodColor={mainColor} />
                    </filter>
                </defs>
                <rect
                    x="5"
                    y="5"
                    width="90"
                    height="130"
                    rx="8"
                    ry="8"
                    fill={backgroundColor}
                    stroke={mainColor}
                    strokeWidth="3"
                    filter="url(#cardShadowBack)"
                />
                <text
                    x="50"
                    y="82"
                    fontSize="70"
                    fontFamily="Arial, sans-serif"
                    fontWeight="700"
                    textAnchor="middle"
                    fill={mainColor}
                >
                    P
                </text>
                <text
                    x="50"
                    y="100"
                    fontSize="10"
                    fontFamily="Arial, sans-serif"
                    fontWeight="700"
                    textAnchor="middle"
                    fill={mainColor}
                >
                    POINTS
                </text>
                <g transform="translate(10, 22)">
                    <text
                        fontSize="12"
                        fontFamily="Arial, sans-serif"
                        fontWeight="700"
                        fill={mainColor}
                    >
                        P
                    </text>
                </g>
                <g transform="translate(90, 118) rotate(180)">
                    <text
                        fontSize="12"
                        fontFamily="Arial, sans-serif"
                        fontWeight="700"
                        fill={mainColor}
                    >
                        P
                    </text>
                </g>
                <g transform="translate(50, 120)">
                    <g transform="translate(-24, -13) scale(0.5)">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" stroke={mainColor} fill="none" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                    </g>
                    <g transform="translate(-5, -13) scale(0.5)">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" stroke={mainColor} fill="none" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                    </g>
                    <g transform="translate(15, -13) scale(0.5)">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" stroke={mainColor} fill="none" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.610l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                    </g>
                </g>
            </svg>
        );
    }
}
