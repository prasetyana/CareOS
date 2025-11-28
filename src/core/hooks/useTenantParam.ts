import { useSearchParams } from 'react-router-dom';

/**
 * Hook to get the current tenant slug from URL parameters
 * This ensures tenant context is preserved across navigation
 */
export const useTenantParam = () => {
    const [searchParams] = useSearchParams();
    const tenant = searchParams.get('tenant');

    /**
     * Adds tenant parameter to a path if tenant exists
     * @param path - The path to navigate to
     * @returns Path with tenant parameter appended
     */
    const withTenant = (path: string): string => {
        if (!tenant) return path;

        // Check if path already has query params
        const separator = path.includes('?') ? '&' : '?';
        return `${path}${separator}tenant=${tenant}`;
    };

    return {
        tenant,
        withTenant
    };
};
