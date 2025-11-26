/**
 * Get the demo URL based on the current environment
 * Uses URL parameters since Vercel free tier doesn't support wildcard domains
 */
export function getDemoUrl(): string {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;

    // Build base URL
    const baseUrl = port ? `${protocol}//${hostname}:${port}` : `${protocol}//${hostname}`;

    // Always use URL parameter for demo
    return `${baseUrl}/login?tenant=demo`;
}

/**
 * Get the base tenant URL (without /login)
 */
export function getTenantUrl(tenantSlug: string): string {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;

    // Build base URL
    const baseUrl = port ? `${protocol}//${hostname}:${port}` : `${protocol}//${hostname}`;

    // Use URL parameter for tenant
    return `${baseUrl}?tenant=${tenantSlug}`;
}
