/**
 * Tenant Resolver
 * Multi-strategy tenant resolution from various sources
 */

export type TenantSource = 'subdomain' | 'custom-domain' | 'path' | 'header' | 'default';

export interface TenantResolution {
    tenantId: string | null;
    source: TenantSource;
    isValid: boolean;
}

/**
 * Resolve tenant from subdomain
 * e.g., demo.dineos.app -> demo
 */
function resolveFromSubdomain(hostname: string): TenantResolution {
    const parts = hostname.split('.');

    // Check if it's a subdomain (e.g., demo.dineos.app)
    if (parts.length >= 3) {
        const subdomain = parts[0];

        // Ignore www and common subdomains
        if (subdomain !== 'www' && subdomain !== 'app' && subdomain !== 'api') {
            return {
                tenantId: subdomain,
                source: 'subdomain',
                isValid: true,
            };
        }
    }

    return {
        tenantId: null,
        source: 'subdomain',
        isValid: false,
    };
}

/**
 * Resolve tenant from custom domain
 * e.g., myrestaurant.com -> lookup in database
 */
async function resolveFromCustomDomain(hostname: string): Promise<TenantResolution> {
    // TODO: Implement database lookup for custom domains
    // For now, return invalid
    return {
        tenantId: null,
        source: 'custom-domain',
        isValid: false,
    };
}

/**
 * Resolve tenant from URL path
 * e.g., /tenant/demo -> demo
 */
function resolveFromPath(pathname: string): TenantResolution {
    const match = pathname.match(/^\/tenant\/([^\/]+)/);

    if (match) {
        return {
            tenantId: match[1],
            source: 'path',
            isValid: true,
        };
    }

    return {
        tenantId: null,
        source: 'path',
        isValid: false,
    };
}

/**
 * Resolve tenant from header
 * e.g., X-Tenant-ID: demo
 */
function resolveFromHeader(headers: Headers): TenantResolution {
    const tenantId = headers.get('X-Tenant-ID');

    if (tenantId) {
        return {
            tenantId,
            source: 'header',
            isValid: true,
        };
    }

    return {
        tenantId: null,
        source: 'header',
        isValid: false,
    };
}

/**
 * Mock tenant lookup by subdomain
 * TODO: Replace with actual Supabase query
 */
async function lookupSubdomainTenant(subdomain: string): Promise<string | null> {
    // Mock data - replace with actual database query
    const mockTenants: Record<string, string> = {
        'demo': 'demo-tenant-id',
        'staging': 'staging-tenant-id',
        'test': 'test-tenant-id',
    };

    return mockTenants[subdomain] || null;
}

/**
 * Mock tenant lookup by custom domain
 * TODO: Replace with actual Supabase query
 */
async function lookupCustomDomainTenant(domain: string): Promise<string | null> {
    // Mock data - replace with actual database query
    const mockCustomDomains: Record<string, string> = {
        'warungbunda.com': 'warungbunda-tenant-id',
        'restomakmur.com': 'restomakmur-tenant-id',
    };

    return mockCustomDomains[domain] || null;
}

/**
 * Resolve tenant using multiple strategies
 * Priority: platform > staging > custom-domain > subdomain > path > header > default
 */
export async function resolveTenant(
    hostname: string,
    pathname: string,
    headers?: Headers
): Promise<TenantResolution> {
    // 1. Check if platform domain (careos.cloud or localhost)
    if (hostname === 'careos.cloud' || hostname === 'localhost' || hostname.startsWith('localhost:')) {
        return {
            tenantId: 'platform',
            source: 'default',
            isValid: true,
        };
    }

    // 2. Check if staging domain
    if (hostname === 'staging.careos.cloud') {
        return {
            tenantId: 'staging',
            source: 'subdomain',
            isValid: true,
        };
    }

    // 3. Try custom domain first (highest priority for tenants)
    const customDomainTenantId = await lookupCustomDomainTenant(hostname);
    if (customDomainTenantId) {
        return {
            tenantId: customDomainTenantId,
            source: 'custom-domain',
            isValid: true,
        };
    }

    // 4. Try subdomain (e.g., demo.careos.cloud)
    if (hostname.endsWith('.careos.cloud')) {
        const parts = hostname.split('.');
        const subdomain = parts[0];

        // Ignore www and common subdomains
        if (subdomain !== 'www' && subdomain !== 'app' && subdomain !== 'api' && subdomain !== 'staging') {
            const tenantId = await lookupSubdomainTenant(subdomain);

            if (tenantId) {
                return {
                    tenantId,
                    source: 'subdomain',
                    isValid: true,
                };
            }
        }
    }

    // 5. Try path-based detection
    const path = resolveFromPath(pathname);
    if (path.isValid) return path;

    // 6. Try header-based detection
    if (headers) {
        const header = resolveFromHeader(headers);
        if (header.isValid) return header;
    }

    // 7. Return default (platform)
    return {
        tenantId: 'platform',
        source: 'default',
        isValid: true,
    };
}

/**
 * Cache for tenant resolutions
 */
const resolutionCache = new Map<string, { resolution: TenantResolution; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Resolve tenant with caching
 */
export async function resolveTenantCached(
    hostname: string,
    pathname: string,
    headers?: Headers
): Promise<TenantResolution> {
    const cacheKey = `${hostname}:${pathname}`;
    const cached = resolutionCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.resolution;
    }

    const resolution = await resolveTenant(hostname, pathname, headers);
    resolutionCache.set(cacheKey, { resolution, timestamp: Date.now() });

    return resolution;
}
