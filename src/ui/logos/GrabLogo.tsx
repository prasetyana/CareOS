import React from 'react';
import grabLogoImg from '../../assets/grab-logo.png';

interface GrabLogoProps {
    className?: string;
    size?: number;
}

const GrabLogo: React.FC<GrabLogoProps> = ({ className = '', size = 36 }) => {
    return (
        <div
            className={`rounded-full border border-black/10 dark:border-white/10 overflow-hidden flex items-center justify-center bg-white ${className}`}
            style={{ width: size, height: size }}
        >
            <img
                src={grabLogoImg}
                alt="Grab"
                width={size}
                height={size}
                style={{ objectFit: 'cover' }}
            />
        </div>
    );
};

export default GrabLogo;
