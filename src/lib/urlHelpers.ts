/**
 * Get the base domain for the current environment
 * Returns the root domain without any subdomain
 */
function getBaseDomain(): string {
    const hostname = window.location.hostname;

    // For localhost, return as-is
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return hostname;
    }

    // For Vercel preview URLs (e.g., care-os-three.vercel.app)
    if (hostname.includes('vercel.app')) {
        return hostname;
    }

    const parts = hostname.split('.');

    // For multi-level subdomains (e.g., demo.staging.careos.cloud)
    // Extract base domain: staging.careos.cloud
    if (parts.length >= 4) {
        return parts.slice(1).join('.');
    }

    // For single-level subdomains (e.g., demo.careos.cloud)
    // Extract base domain: careos.cloud
    if (parts.length === 3) {
        const subdomain = parts[0];
        // If current subdomain is www or staging, keep it in base domain
        if (subdomain === 'www' || subdomain === 'staging') {
            return hostname;
        }
        return parts.slice(1).join('.');
    }

    // Already at base domain (e.g., careos.cloud)
    return hostname;
}

/**
 * Check if we're in local development environment
 */
function isLocalEnvironment(): boolean {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('vercel.app');
}

/**
 * Get the demo URL based on the current environment
 * Production: Uses subdomain format (demo.careos.cloud)
 * Development: Uses URL parameter format (localhost:3000/login?tenant=demo)
 */
export function getDemoUrl(): string {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;

    // For local development, use URL parameter
    if (isLocalEnvironment()) {
        const baseUrl = port ? `${protocol}//${hostname}:${port}` : `${protocol}//${hostname}`;
        return `${baseUrl}/login?tenant=demo`;
    }

    // For production, use subdomain
    const baseDomain = getBaseDomain();
    return `${protocol}//demo.${baseDomain}`;
}

/**
 * Get the tenant URL for a specific tenant slug
 * Production: Uses subdomain format (tenantSlug.careos.cloud)
 * Development: Uses URL parameter format (localhost:3000?tenant=tenantSlug)
 */
export function getTenantUrl(tenantSlug: string): string {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;

    // For local development, use URL parameter
    if (isLocalEnvironment()) {
        const baseUrl = port ? `${protocol}//${hostname}:${port}` : `${protocol}//${hostname}`;
        return `${baseUrl}?tenant=${tenantSlug}`;
    }

    // For production, use subdomain
    const baseDomain = getBaseDomain();
    return `${protocol}//${tenantSlug}.${baseDomain}`;
}
