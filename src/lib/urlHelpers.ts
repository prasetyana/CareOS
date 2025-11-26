/**
 * Get the demo URL based on the current environment
 * - Production: demo.careos.cloud
 * - Staging: demo.staging.careos.cloud
 * - Local: localhost with ?tenant=demo parameter
 */
export function getDemoUrl(): string {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `${protocol}//${hostname}:${window.location.port}/login?tenant=demo`;
    }

    // Vercel preview URLs
    if (hostname.includes('vercel.app')) {
        return `${protocol}//${hostname}/login?tenant=demo`;
    }

    // Staging environment (staging.careos.cloud)
    if (hostname === 'staging.careos.cloud') {
        return `${protocol}//demo.staging.careos.cloud/login`;
    }

    // Production environment (careos.cloud)
    if (hostname === 'careos.cloud' || hostname === 'www.careos.cloud') {
        return `${protocol}//demo.careos.cloud/login`;
    }

    // Fallback to URL parameter
    return `${protocol}//${hostname}/login?tenant=demo`;
}

/**
 * Get the base tenant URL (without /login)
 */
export function getTenantUrl(tenantSlug: string): string {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `${protocol}//${hostname}:${window.location.port}?tenant=${tenantSlug}`;
    }

    // Vercel preview URLs
    if (hostname.includes('vercel.app')) {
        return `${protocol}//${hostname}?tenant=${tenantSlug}`;
    }

    // Staging environment
    if (hostname === 'staging.careos.cloud') {
        return `${protocol}//${tenantSlug}.staging.careos.cloud`;
    }

    // Production environment
    if (hostname === 'careos.cloud' || hostname === 'www.careos.cloud') {
        return `${protocol}//${tenantSlug}.careos.cloud`;
    }

    // Fallback
    return `${protocol}//${hostname}?tenant=${tenantSlug}`;
}
