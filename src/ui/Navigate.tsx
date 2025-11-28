import React from 'react';
import { Navigate as RouterNavigate, NavigateProps, useSearchParams } from 'react-router-dom';

/**
 * Custom Navigate component that preserves search parameters (like ?tenant=demo)
 * This ensures tenant context is maintained during redirects
 */
export const Navigate: React.FC<NavigateProps> = ({ to, ...props }) => {
    const [searchParams] = useSearchParams();

    // If 'to' is a string, append current search params
    if (typeof to === 'string') {
        const tenant = searchParams.get('tenant');
        if (tenant) {
            const separator = to.includes('?') ? '&' : '?';
            const newTo = `${to}${separator}tenant=${tenant}`;
            return <RouterNavigate to={newTo} {...props} />;
        }
    }

    return <RouterNavigate to={to} {...props} />;
};
