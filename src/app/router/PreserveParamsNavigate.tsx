import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface PreserveParamsNavigateProps {
    to: string;
    replace?: boolean;
}

/**
 * A wrapper around Navigate that preserves query parameters
 * Useful for index route redirects that should maintain tenant params
 */
export const PreserveParamsNavigate: React.FC<PreserveParamsNavigateProps> = ({ to, replace = false }) => {
    const location = useLocation();

    // Preserve existing search params
    const targetPath = `${to}${location.search}`;

    return <Navigate to={targetPath} replace={replace} />;
};
