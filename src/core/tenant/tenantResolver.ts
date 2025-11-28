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
 * Resolve tenant using multiple strategies
 * Priority: custom-domain > subdomain > path > header > default
 */
export async function resolveTenant(
    hostname: string,
    pathname: string,
    headers?: Headers
): Promise<TenantResolution> {
    // Try custom domain first
    const customDomain = await resolveFromCustomDomain(hostname);
    if (customDomain.isValid) return customDomain;

    // Try subdomain
    const subdomain = resolveFromSubdomain(hostname);
    if (subdomain.isValid) return subdomain;

    // Try path
    const path = resolveFromPath(pathname);
    if (path.isValid) return path;

    // Try header
    if (headers) {
        const header = resolveFromHeader(headers);
        if (header.isValid) return header;
    }

    // Return default/invalid
    return {
        tenantId: null,
        source: 'default',
        isValid: false,
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
