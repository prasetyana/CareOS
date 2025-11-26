import React from 'react';

interface DineOSLogoProps {
    className?: string;
    size?: number;
}

const DineOSLogo: React.FC<DineOSLogoProps> = ({ className = '', size = 36 }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Orange circular background */}
            <circle cx="50" cy="50" r="50" fill="#FF6B35" />
            {/* Border */}
            <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />

            {/* White plate and utensils */}
            <g transform="translate(50, 50)">
                {/* Plate circle */}
                <circle cx="0" cy="0" r="18" fill="white" />
                <circle cx="0" cy="0" r="14" fill="#FF6B35" />
                <circle cx="0" cy="0" r="12" fill="white" />

                {/* Fork on left */}
                <g transform="translate(-22, 0)">
                    <rect x="-1" y="-12" width="2" height="24" rx="1" fill="white" />
                    <rect x="-4" y="-12" width="1.5" height="8" rx="0.5" fill="white" />
                    <rect x="2.5" y="-12" width="1.5" height="8" rx="0.5" fill="white" />
                </g>

                {/* Spoon on right */}
                <g transform="translate(22, 0)">
                    <rect x="-1" y="-4" width="2" height="16" rx="1" fill="white" />
                    <ellipse cx="0" cy="-8" rx="3" ry="5" fill="white" />
                </g>
            </g>
        </svg>
    );
};

export default DineOSLogo;
