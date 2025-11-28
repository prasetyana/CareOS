import { supabase } from '../supabase/supabase'
import { RestaurantRegistrationData, OnboardingData, UserProfile, ActivityLog } from '../types/tenant'

export type { RestaurantRegistrationData, OnboardingData, UserProfile, ActivityLog }

/**
 * Register a new restaurant owner and create their tenant
 */
export async function registerRestaurantOwner(data: RestaurantRegistrationData) {
    try {
        // Step 1: Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.ownerEmail,
            password: data.ownerPassword,
            options: {
                data: {
                    full_name: data.ownerName,
                    phone: data.ownerPhone,
                }
            }
        })

        if (authError) throw authError
        if (!authData.user) throw new Error('Failed to create user')

        // Step 2: Create tenant
        const slug = generateSlugFromBusinessName(data.businessName)

        const { data: tenantData, error: tenantError } = await supabase
            .from('tenants')
            .insert({
                business_name: data.businessName,
                slug: slug,
                description: data.businessDescription,
                email: data.businessEmail,
                phone: data.businessPhone,
                primary_color: data.primaryColor || '#FF6B35',
                secondary_color: data.secondaryColor || '#004E89',
                subscription_tier: 'trial',
                status: 'active'
            })
            .select()
            .single()

        if (tenantError) throw tenantError

        // Step 3: Create profile for the owner
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: authData.user.id,
                full_name: data.ownerName,
                phone: data.ownerPhone,
                role: 'admin', // Changed from 'tenant_admin' to match DB constraint
                tenant_id: tenantData.id,
                username: data.username // Add username here
            })

        if (profileError) throw profileError

        // Step 4: Create subdomain entry
        const subdomain = `${slug}.careos.id`

        const { error: domainError } = await supabase
            .from('tenant_domains')
            .insert({
                tenant_id: tenantData.id,
                domain: subdomain,
                domain_type: 'subdomain',
                is_verified: true, // Auto-verify subdomains
                is_primary: true,
                is_active: true
            })

        if (domainError) throw domainError

        return {
            success: true,
            userId: authData.user.id,
            tenantId: tenantData.id,
            slug: slug,
            subdomain: subdomain
        }
    } catch (error: any) {
        console.error('Registration error:', error)
        return {
            success: false,
            error: error.message || 'Registration failed'
        }
    }
}

/**
 * Complete onboarding wizard
 */
export async function completeOnboarding(tenantId: string, data: Partial<OnboardingData>) {
    try {
        // Update tenant with branding
        if (data.primaryColor || data.secondaryColor || data.fontFamily) {
            const { error: tenantError } = await supabase
                .from('tenants')
                .update({
                    primary_color: data.primaryColor,
                    secondary_color: data.secondaryColor,
                    font_family: data.fontFamily,
                    logo_url: data.logoUrl
                })
                .eq('id', tenantId)

            if (tenantError) throw tenantError
        }

        // Create first branch if provided
        if (data.branchName && data.branchAddress) {
            const { error: branchError } = await supabase
                .from('branches')
                .insert({
                    tenant_id: tenantId,
                    name: data.branchName,
                    address: data.branchAddress,
                    city: data.branchCity || '',
                    area: data.branchArea,
                    opening_hours: data.openingHours || '09:00',
                    closing_hours: data.closingHours || '22:00',
                    status: 'open'
                })

            if (branchError) throw branchError
        }

        return { success: true }
    } catch (error: any) {
        console.error('Onboarding error:', error)
        return {
            success: false,
            error: error.message || 'Onboarding failed'
        }
    }
}

/**
 * Generate URL-friendly slug from business name
 */
function generateSlugFromBusinessName(businessName: string): string {
    return businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50)
}

/**
 * Check if slug is available
 */
export async function checkSlugAvailability(slug: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', slug)
        .single()

    return !data && !error
}

/**
 * Update tenant profile information
 */
export async function updateTenantProfile(tenantId: string, data: {
    businessName?: string;
    description?: string;
    email?: string;
    phone?: string;
    website?: string;
    logoUrl?: string;
    operatingHours?: any;
}) {
    try {
        const updateData: any = {};
        if (data.businessName !== undefined) updateData.business_name = data.businessName;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.email !== undefined) updateData.email = data.email;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.website !== undefined) updateData.website = data.website;
        if (data.logoUrl !== undefined) updateData.logo_url = data.logoUrl;
        if (data.operatingHours !== undefined) updateData.operating_hours = data.operatingHours;

        const { error } = await supabase
            .from('tenants')
            .update(updateData)
            .eq('id', tenantId);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error('Error updating tenant profile:', error);
        return {
            success: false,
            error: error.message || 'Failed to update profile'
        };
    }
}

/**
 * Get owner profile by User ID
 */
export async function getOwnerProfile(userId: string): Promise<UserProfile | null> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) throw error

        return data as UserProfile
    } catch (error: any) {
        console.error('Error fetching owner profile:', error)
        return null
    }
}

/**
 * Update owner profile
 */
export async function updateOwnerProfile(userId: string, data: Partial<UserProfile>) {
    try {
        const { error } = await supabase
            .from('profiles')
            .update(data)
            .eq('id', userId)

        if (error) throw error

        return { success: true }
    } catch (error: any) {
        console.error('Error updating owner profile:', error)
        return {
            success: false,
            error: error.message || 'Failed to update profile'
        }
    }
}

/**
 * Update user password with verification
 */
export async function updateUserPassword(userId: string, currentPassword: string, newPassword: string) {
    try {
        // 1. Get current user email
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || user.id !== userId) throw new Error('User not authenticated')

        // 2. Verify current password by signing in
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password: currentPassword
        })

        if (signInError) {
            return {
                success: false,
                message: 'Password saat ini salah'
            }
        }

        // 3. Update password
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
        })

        if (updateError) throw updateError

        return { success: true }
    } catch (error: any) {
        console.error('Error updating password:', error)
        return {
            success: false,
            message: error.message || 'Gagal mengubah password'
        }
    }
}

export async function fetchActivityLogs(
    userId: string,
    limit: number = 10,
    offset: number = 0,
    filters?: {
        action?: string,
        startDate?: Date,
        endDate?: Date
    }
): Promise<{ data: ActivityLog[], count: number }> {
    try {
        let query = supabase
            .from('activity_logs')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (filters?.action) {
            query = query.eq('action', filters.action)
        }

        if (filters?.startDate) {
            query = query.gte('created_at', filters.startDate.toISOString())
        }

        if (filters?.endDate) {
            // Set end date to end of day
            const endOfDay = new Date(filters.endDate)
            endOfDay.setHours(23, 59, 59, 999)
            query = query.lte('created_at', endOfDay.toISOString())
        }

        const { data, error, count } = await query

        if (error) throw error
        return { data: data as ActivityLog[], count: count || 0 }
    } catch (error) {
        console.error('Error fetching activity logs:', error)
        return { data: [], count: 0 }
    }
}

export async function logActivity(data: {
    userId: string
    action: string
    description: string
    ipAddress?: string
    device?: string
    status?: 'success' | 'failure' | 'warning'
    severity?: 'info' | 'low' | 'medium' | 'high' | 'critical'
    location?: string
    metadata?: any
}) {
    try {
        const { error } = await supabase
            .from('activity_logs')
            .insert({
                user_id: data.userId,
                action: data.action,
                description: data.description,
                ip_address: data.ipAddress,
                device: data.device,
                status: data.status || 'success',
                severity: data.severity || 'info',
                location: data.location,
                metadata: data.metadata
            })

        if (error) throw error
        return { success: true }
    } catch (error) {
        console.error('Error logging activity:', error)
        return { success: false }
    }
}
