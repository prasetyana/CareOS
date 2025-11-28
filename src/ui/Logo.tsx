
import React from 'react';
import { Link } from 'react-router-dom';
import { useTenant } from '@core/contexts/TenantContext';

export const logoDataUri = `data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 3C8.82 3 3 8.82 3 16C3 23.18 8.82 29 16 29C23.18 29 29 23.18 29 16C29 8.82 23.18 3 16 3ZM16 26C10.486 26 6 21.514 6 16C6 10.486 10.486 6 16 6V26Z' fill='currentColor'/%3E%3C/svg%3E`;

interface LogoProps {
    showText?: boolean;
    className?: string;
    textClassName?: string;
}

const Logo: React.FC<LogoProps> = ({ showText = true, className = '', textClassName = 'text-xl' }) => {
    const { tenant } = useTenant();
    const logoSrc = tenant?.logoUrl || logoDataUri;

    return (
        <Link to="/home" className={`flex items-center gap-3 ${className}`}>
            <img src={logoSrc} alt="DineOS Logo" className="h-8 w-8 flex-shrink-0 object-contain" />
            {showText && (
                <span className={`font-semibold whitespace-nowrap ${textClassName}`}>
                    {tenant?.businessName || 'DineOS'}
                </span>
            )}
        </Link>
    );
};

export default Logo;
