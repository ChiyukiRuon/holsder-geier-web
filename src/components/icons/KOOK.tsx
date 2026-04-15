import React from 'react';

interface KOOKProps {
    size?: number;
    color?: string;
}

const KOOK = ({ size = 15, color = "#87eb00" }: KOOKProps) => {
    return (
        <svg
            viewBox="0 0 256 256"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            style={{ transform: 'translateX(-2px) scale(1.2)' }}
        >
            <path
                d="M110 40L80 216H125L142 128L185 216H235L175 105L225 40H175L135 95L155 40H110Z"
                fill={color}
            />
        </svg>
    );
};

export default KOOK;
