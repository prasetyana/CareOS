/**
 * Tenant Module
/**
 * Tenant Module
 * Central export point for all tenant-related functionality
 */

export { detectTenantFromSubdomain } from './tenantDetection';
export { resolveTenant, resolveTenantCached } from './tenantResolver';
export {
    getTenantConfig,
    hasCapability,
    getTenantBranding,
    getTenantSEO,
    defaultCapabilities,
} from './tenantConfig';

// Tenant Context
export { TenantProvider, useTenant } from './TenantContext';

export type { TenantSource, TenantResolution } from './tenantResolver';
export type { TenantConfig, TenantCapabilities, TenantBranding, TenantSEO } from './tenantConfig';

// Note: TenantContext will be moved here in a future update
// For now, it remains in core/contexts/TenantContext for backward compatibility
