import { supabase } from '../supabase/supabase'

export interface TenantContext {
    id: string
    slug: string
    businessName: string
    logoUrl: string | null
    primaryColor: string
    secondaryColor: string
    fontFamily: string
    description?: string
    email?: string
    phone?: string
    website?: string
    layout?: string

    // Domain configuration
    domainType?: 'subdomain' | 'custom'
    subdomain?: string              // e.g., 'myrestaurant' for myrestaurant.dineos.com
    customDomain?: string           // e.g., 'myrestaurant.com'
    domainVerified?: boolean
    dnsRecords?: {
        aRecord: {
            host: string
            value: string
            verified: boolean
        }
        cnameRecord: {
            host: string
            value: string
            verified: boolean
        }
    }

    // Email configuration
    emailSettings?: {
        provider: 'default' | 'smtp'
        senderName: string
        senderEmail: string
        smtpConfig?: {
            host: string
            port: number
            username: string
            password?: string
            secure: boolean
        }
    }

    plan?: 'free' | 'starter' | 'pro' | 'enterprise'

    // Operating Hours
    operatingHours?: OperatingHours

    // Address & Location
    address?: string
    city?: string
    province?: string
    postalCode?: string
    latitude?: string
    longitude?: string
}

export interface OperatingHours {
    [key: string]: {
        isOpen: boolean;
        openTime: string;
        closeTime: string;
    };
}

/**
 * Detects tenant from current domain
 * Priority: subdomain → URL parameter → default
 */
export async function detectTenantFromDomain(): Promise<TenantContext | null> {
    const hostname = window.location.hostname

    // Priority 1: Check for subdomain (e.g., demo.careos.cloud)
    const subdomain = detectTenantFromSubdomain()

    // Priority 2: Check URL parameter for local development
    const params = new URLSearchParams(window.location.search)
    const tenantParam = params.get('tenant')

    // Determine which identifier to use
    const tenantIdentifier = subdomain || tenantParam

    let domain = hostname

    // If we have a tenant identifier (subdomain or param), look it up
    if (tenantIdentifier) {
        console.log('🔍 Detecting tenant from:', subdomain ? `subdomain: ${subdomain}` : `URL parameter: ${tenantParam}`)

        try {
            // Query by slug instead of domain for development
            console.log('🚀 Starting direct fetch for tenant:', tenantIdentifier)

            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
            const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

            const response = await fetch(`${supabaseUrl}/rest/v1/tenants?slug=eq.${tenantIdentifier}&select=id,slug,business_name,logo_url,primary_color,secondary_color,font_family,description,email,phone,website,operating_hours,layout`, {
                headers: {
                    'apikey': supabaseAnonKey,
                    'Authorization': `Bearer ${supabaseAnonKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`Fetch error: ${response.statusText}`);
            }

            const data = await response.json();
            const tenantData = data && data.length > 0 ? data[0] : null;

            console.log('📊 Fetch result:', { data: tenantData })

            if (tenantData) {
                console.log('✅ Tenant found:', tenantData)
                return {
                    id: tenantData.id,
                    slug: tenantData.slug,
                    businessName: tenantData.business_name,
                    logoUrl: tenantData.logo_url,
                    primaryColor: tenantData.primary_color || '#FF6B35',
                    secondaryColor: tenantData.secondary_color || '#004E89',
                    fontFamily: tenantData.font_family || 'Inter',
                    // Additional fields
                    description: tenantData.description,
                    email: tenantData.email,
                    phone: tenantData.phone,
                    website: tenantData.website,
                    // Operating hours from DB or default
                    operatingHours: tenantData.operating_hours || getDefaultOperatingHours(),
                    layout: tenantData.layout || 'default'
                }
            } else {
                console.warn('⚠️ Tenant not found in database, using mock tenant')
                // Return mock tenant for development
                return getMockTenant(tenantIdentifier)
            }
        } catch (error) {
            console.error('❌ Error fetching tenant from database:', error)
            console.log('🔄 Falling back to mock tenant')
            // Return mock tenant on error
            return getMockTenant(tenantIdentifier)
        }
    }

    // Production: Query tenant_domains table
    try {
        const { data: domainData, error } = await supabase
            .from('tenant_domains')
            .select(`
          tenant_id,
          tenants (
            id,
            slug,
            business_name,
            logo_url,
            primary_color,
            secondary_color,
            font_family,
            description,
            email,
            phone,
            website,
            website,
            operating_hours,
            layout
          )
        `)
            .eq('domain', domain)
            .eq('is_verified', true)
            .eq('is_active', true)
            .single()

        if (error || !domainData) {
            console.warn('Tenant not found for domain:', domain)
            // For development: return null to show error
            return null
        }

        const tenant = domainData.tenants as any

        return {
            id: tenant.id,
            slug: tenant.slug,
            businessName: tenant.business_name,
            logoUrl: tenant.logo_url,
            primaryColor: tenant.primary_color || '#FF6B35',
            secondaryColor: tenant.secondary_color || '#004E89',
            fontFamily: tenant.font_family || 'Inter',
            description: tenant.description,
            email: tenant.email,
            phone: tenant.phone,
            website: tenant.website,
            operatingHours: tenant.operating_hours || getDefaultOperatingHours(),
            layout: tenant.layout || 'default'
        }
    } catch (error) {
        console.error('❌ Error in production tenant detection:', error)
        return null
    }
}

function getDefaultOperatingHours(): OperatingHours {
    return {
        monday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
        tuesday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
        wednesday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
        thursday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
        friday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
        saturday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
        sunday: { isOpen: true, openTime: '10:00', closeTime: '22:00' },
    };
}

/**
 * Returns a mock tenant for local development
 */
function getMockTenant(slug: string): TenantContext {
    // Try to get saved tenant data from localStorage
    const savedTenant = localStorage.getItem(`mock_tenant_${slug}`);
    if (savedTenant) {
        try {
            const parsed = JSON.parse(savedTenant);
            // Ensure operatingHours exists in saved data, if not add default
            if (!parsed.operatingHours) {
                parsed.operatingHours = getDefaultOperatingHours();
            }
            return parsed;
        } catch (e) {
            console.error('Error parsing saved tenant data:', e);
        }
    }

    return {
        id: 'mock-tenant-id',
        slug: slug,
        businessName: 'DineOS Demo Restaurant',
        logoUrl: null,
        primaryColor: '#FF6B35',
        secondaryColor: '#004E89',
        fontFamily: 'Inter',
        operatingHours: getDefaultOperatingHours(),
        address: 'Jl. Jend. Sudirman Kav. 52-53',
        city: 'Jakarta Selatan',
        province: 'DKI Jakarta',
        postalCode: '12190',
        latitude: '-6.225014',
        longitude: '106.809715',
        layout: 'default'
    }
}

/**
 * Detect tenant from subdomain
 * Handles: demo.careos.cloud, demo.staging.careos.cloud, restaurant1.careos.cloud
 */
export function detectTenantFromSubdomain(): string | null {
    const hostname = window.location.hostname
    const parts = hostname.split('.')

    // Localhost - no subdomain
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return null
    }

    // For Vercel preview URLs (e.g., care-os-three.vercel.app)
    if (hostname.includes('vercel.app')) {
        return null
    }

    // For multi-level subdomains (e.g., demo.staging.careos.cloud)
    // We want to extract 'demo' from demo.staging.careos.cloud
    if (parts.length >= 4) {
        // demo.staging.careos.cloud → ['demo', 'staging', 'careos', 'cloud']
        // We want the first part: 'demo'
        return parts[0]
    }

    // For single-level subdomains (e.g., demo.careos.cloud)
    if (parts.length === 3) {
        // demo.careos.cloud → ['demo', 'careos', 'cloud']
        const subdomain = parts[0]

        // Ignore 'www' and 'staging' as tenant identifiers
        if (subdomain === 'www' || subdomain === 'staging') {
            return null
        }

        return subdomain
    }

    // No subdomain (e.g., careos.cloud)
    return null
}
