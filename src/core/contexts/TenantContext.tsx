import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { detectTenantFromDomain, TenantContext as TenantData } from '../tenant/tenantDetection'

interface TenantContextType {
    tenant: TenantData | null
    loading: boolean
    error: string | null
    refreshTenant: () => Promise<void>
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

interface TenantProviderProps {
    children: ReactNode
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
    const [tenant, setTenant] = useState<TenantData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const fetchingTenant = React.useRef(false);

    const loadTenant = async (silent = false) => {
        // Removed fetchingTenant ref check to prevent Strict Mode deadlock
        // if (fetchingTenant.current) return;

        try {
            fetchingTenant.current = true;
            if (!silent) setLoading(true);

            const tenantData = await detectTenantFromDomain();

            if (!tenantData) {
                setError('Restaurant not found. Please add ?tenant=demo to the URL for local development.')
            } else {
                setTenant(tenantData)
                // Apply branding dynamically
                document.documentElement.style.setProperty('--primary-color', tenantData.primaryColor)
                document.documentElement.style.setProperty('--secondary-color', tenantData.secondaryColor)
                document.documentElement.style.setProperty('--font-family', tenantData.fontFamily)

                // Update page title
                document.title = `${tenantData.businessName} - Order Online`
            }
        } catch (err) {
            console.error('Error detecting tenant:', err)
            setError('Failed to load restaurant data')
        } finally {
            if (!silent) setLoading(false)
            fetchingTenant.current = false;
        }
    };

    useEffect(() => {
        loadTenant();
    }, [])

    const refreshTenant = async () => {
        await loadTenant(true);
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                fontFamily: 'Inter, sans-serif'
            }}>
                <div>Loading restaurant...</div>
            </div>
        )
    }

    if (error || !tenant) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                fontFamily: 'Inter, sans-serif',
                padding: '20px',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Restaurant Not Found</h1>
                <p style={{ color: '#666' }}>{error}</p>
            </div>
        )
    }

    return (
        <TenantContext.Provider value={{ tenant, loading, error, refreshTenant }}>
            {children}
        </TenantContext.Provider>
    )
}

export const useTenant = () => {
    const context = useContext(TenantContext)
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider')
    }
    return context
}
