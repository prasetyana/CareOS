export interface RestaurantRegistrationData {
    // Owner Information
    ownerName: string
    ownerEmail: string
    ownerPassword: string
    ownerPhone?: string
    username?: string

    // Business Information
    businessName: string
    businessDescription?: string
    businessEmail: string
    businessPhone?: string

    // Branding (optional, can be set later)
    primaryColor?: string
    secondaryColor?: string
    logoUrl?: string
}

export interface OnboardingData {
    // Step 1: Business Info (already collected in registration)

    // Step 2: Branding
    primaryColor: string
    secondaryColor: string
    fontFamily: string
    logoUrl?: string

    // Step 3: Subdomain
    slug: string

    // Step 4: First Branch
    branchName: string
    branchAddress: string
    branchCity: string
    branchArea?: string
    openingHours: string
    closingHours: string
}

export interface UserProfile {
    id: string
    full_name: string
    email?: string
    phone?: string
    avatar_url?: string | null
    role: string
    username?: string
    last_username_change?: string
    birthdate?: string
    address?: string
    city?: string
    province?: string
    postal_code?: string
    two_factor_enabled?: boolean
}

export interface ActivityLog {
    id: string
    user_id: string
    action: string
    description: string
    ip_address?: string
    device?: string
    status?: 'success' | 'failure' | 'warning'
    severity?: 'info' | 'low' | 'medium' | 'high' | 'critical'
    location?: string
    metadata?: any
    created_at: string
}
