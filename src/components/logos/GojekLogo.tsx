import React from 'react';
import gojekLogoImg from '../../assets/gojek-logo.png';

interface GojekLogoProps {
    className?: string;
    size?: number;
}

const GojekLogo: React.FC<GojekLogoProps> = ({ className = '', size = 36 }) => {
    return (
        <div
            className={`rounded-full border border-black/10 dark:border-white/10 overflow-hidden flex items-center justify-center bg-white ${className}`}
            style={{ width: size, height: size }}
        >
            <img
                src={gojekLogoImg}
                alt="Gojek"
                width={size * 0.7}
                height={size * 0.7}
                style={{ objectFit: 'contain' }}
            />
        </div>
    );
};

export default GojekLogo;
