/**
 * Tenant Configuration
 * Manage tenant-specific settings and capabilities
 */

export interface TenantCapabilities {
    // Feature access
    hasLiveChat: boolean;
    hasReservations: boolean;
    hasLoyaltyProgram: boolean;
    hasOnlineOrdering: boolean;
    hasAnalytics: boolean;
    hasMultiLocation: boolean;

    // Limits
    maxMenuItems: number;
    maxStaff: number;
    maxLocations: number;
    maxOrdersPerDay: number;

    // Customization
    canCustomizeTheme: boolean;
    canCustomizeDomain: boolean;
    canCustomizeEmail: boolean;
}

export interface TenantBranding {
    logo?: string;
    favicon?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
    theme?: 'default' | 'minimal' | 'premium' | 'dark';
    homepageLayout?: 'food-hero' | 'modern' | 'classic';
}

export interface TenantHomepageSettings {
    heroTitle?: string;
    heroSubtitle?: string;
    ctaPrimary?: string;
    ctaSecondary?: string;
    showFeatures?: boolean;
    showMenuPreview?: boolean;
    showTestimonials?: boolean;
}

export interface TenantSEO {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
}

export interface TenantConfig {
    id: string;
    slug: string;
    name: string;
    domain?: string; // Custom domain
    subdomain: string; // Subdomain on platform
    capabilities: TenantCapabilities;
    branding?: TenantBranding;
    homepageSettings?: TenantHomepageSettings;
    seo?: TenantSEO;
    isActive: boolean;
    createdAt: string;
}

/**
 * Default capabilities for new tenants
 */
export const defaultCapabilities: TenantCapabilities = {
    hasLiveChat: true,
    hasReservations: true,
    hasLoyaltyProgram: true,
    hasOnlineOrdering: true,
    hasAnalytics: false,
    hasMultiLocation: false,
    maxMenuItems: 100,
    maxStaff: 5,
    maxLocations: 1,
    maxOrdersPerDay: 100,
    canCustomizeTheme: false,
    canCustomizeDomain: false,
    canCustomizeEmail: false,
};

/**
 * Get tenant configuration
 * In production, this would fetch from database
 */
export async function getTenantConfig(tenantId: string): Promise<TenantConfig | null> {
    // TODO: Implement actual database fetch
    // For now, return mock data
    return null;
}

/**
 * Check if tenant has a specific capability
 */
export function hasCapability(
    config: TenantConfig,
    capability: keyof TenantCapabilities
): boolean {
    return config.capabilities[capability] as boolean;
}

/**
 * Get tenant branding
 */
export function getTenantBranding(config: TenantConfig): TenantBranding {
    return config.branding || {};
}

/**
 * Get tenant SEO settings
 */
export function getTenantSEO(config: TenantConfig): TenantSEO {
    return config.seo || {};
}
