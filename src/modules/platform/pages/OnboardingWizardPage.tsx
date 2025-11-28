import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { completeOnboarding } from '@core/services/tenantService'
import { supabase } from '@core/supabase/supabase'
import { getTenantUrl } from '@core/utils/urlHelpers'
import { Check, ChevronRight, ArrowLeft, Store, Palette, Rocket } from 'lucide-react'

interface OnboardingStep {
    id: number
    title: string
    description: string
    icon: React.ElementType
}

const steps: OnboardingStep[] = [
    { id: 1, title: 'Branding', description: 'Sesuaikan warna dan logo', icon: Palette },
    { id: 2, title: 'Cabang', description: 'Lokasi restoran pertama', icon: Store },
    { id: 3, title: 'Selesai', description: 'Siap diluncurkan', icon: Rocket }
]

const OnboardingWizardPage: React.FC = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const tenantSlug = searchParams.get('tenant')

    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [tenantId, setTenantId] = useState<string | null>(null)

    // Branding data
    const [brandingData, setBrandingData] = useState({
        primaryColor: '#FF6B35',
        secondaryColor: '#004E89',
        fontFamily: 'Inter',
        logoUrl: ''
    })

    // Branch data
    const [branchData, setBranchData] = useState({
        name: '',
        address: '',
        city: '',
        area: '',
        openingHours: '09:00',
        closingHours: '22:00'
    })

    // Load tenant ID on mount
    React.useEffect(() => {
        const loadTenant = async () => {
            if (!tenantSlug) {
                setError('Tenant tidak valid')
                return
            }

            const { data } = await supabase
                .from('tenants')
                .select('id')
                .eq('slug', tenantSlug)
                .single()

            if (data) {
                setTenantId(data.id)
            }
        }

        loadTenant()
    }, [tenantSlug])

    const handleNext = async () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1)
        } else {
            // Final step - complete onboarding
            await handleComplete()
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleComplete = async () => {
        console.log('handleComplete called', { tenantId, tenantSlug })

        if (!tenantId) {
            console.error('Missing tenantId, cannot complete onboarding')
            setError('System Error: Missing Tenant ID')
            return
        }

        setLoading(true)
        setError(null)

        try {
            // Save to localStorage for demo persistence
            if (tenantSlug) {
                const storageKey = `mock_tenant_${tenantSlug}`;
                const existingData = localStorage.getItem(storageKey);
                const parsedData = existingData ? JSON.parse(existingData) : {};

                const updatedData = {
                    ...parsedData,
                    id: tenantId,
                    slug: tenantSlug,
                    businessName: parsedData.businessName || 'DineOS Demo Restaurant', // Fallback
                    primaryColor: brandingData.primaryColor,
                    secondaryColor: brandingData.secondaryColor,
                    fontFamily: brandingData.fontFamily,
                    logoUrl: brandingData.logoUrl,
                    // Branch/Address Data
                    address: branchData.address,
                    city: branchData.city,
                    province: branchData.area, // Using area as province/region for now
                    operatingHours: {
                        monday: { isOpen: true, openTime: branchData.openingHours, closeTime: branchData.closingHours },
                        tuesday: { isOpen: true, openTime: branchData.openingHours, closeTime: branchData.closingHours },
                        wednesday: { isOpen: true, openTime: branchData.openingHours, closeTime: branchData.closingHours },
                        thursday: { isOpen: true, openTime: branchData.openingHours, closeTime: branchData.closingHours },
                        friday: { isOpen: true, openTime: branchData.openingHours, closeTime: branchData.closingHours },
                        saturday: { isOpen: true, openTime: branchData.openingHours, closeTime: branchData.closingHours },
                        sunday: { isOpen: true, openTime: branchData.openingHours, closeTime: branchData.closingHours },
                    }
                };

                localStorage.setItem(storageKey, JSON.stringify(updatedData));
            }

            console.log('Calling completeOnboarding service...')
            const result = await completeOnboarding(tenantId, {
                ...brandingData,
                branchName: branchData.name,
                branchAddress: branchData.address,
                branchCity: branchData.city,
                branchArea: branchData.area,
                openingHours: branchData.openingHours,
                closingHours: branchData.closingHours
            })
            console.log('completeOnboarding result:', result)

            if (result.success) {
                // Redirect to admin dashboard using subdomain if available
                const tenantUrl = getTenantUrl(tenantSlug)
                console.log('Redirecting to:', tenantUrl)

                // Try to provision domain via Vercel API (fire and forget)
                try {
                    const urlObj = new URL(tenantUrl)
                    const domain = urlObj.hostname
                    console.log('Provisioning domain:', domain)

                    // Only call API if not localhost
                    if (!domain.includes('localhost') && !domain.includes('127.0.0.1')) {
                        const apiResponse = await fetch('/api/add-domain', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ domain })
                        })
                        console.log('Vercel API response status:', apiResponse.status)

                        if (!apiResponse.ok) {
                            const errorData = await apiResponse.json().catch(() => ({}))
                            const errorMessage = errorData.error || apiResponse.statusText
                            console.error('Vercel API Error:', errorMessage)
                            alert(`Debug Error: Gagal menambahkan domain ke Vercel.\nStatus: ${apiResponse.status}\nPesan: ${errorMessage}\n\nMohon screenshot pesan ini.`)
                            // Stop redirect for debugging
                            setLoading(false)
                            return
                        }
                    }
                } catch (e: any) {
                    console.error('Failed to provision domain:', e)
                    alert(`Debug Error: Terjadi kesalahan saat request ke API.\n${e.message}`)
                    setLoading(false)
                    return
                }

                window.location.href = `${tenantUrl}/admin/dasbor`
            } else {
                console.error('Onboarding failed:', result.error)
                setError(result.error || 'Gagal menyelesaikan onboarding')
            }
        } catch (err: any) {
            console.error('handleComplete exception:', err)
            setError(err.message || 'Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F] mb-2">Sesuaikan Branding Anda</h2>
                            <p className="text-gray-500 text-sm">Pilih warna yang mewakili identitas restoran Anda</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                                    Warna Utama
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-gray-200">
                                        <input
                                            type="color"
                                            value={brandingData.primaryColor}
                                            onChange={(e) => setBrandingData({ ...brandingData, primaryColor: e.target.value })}
                                            className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={brandingData.primaryColor}
                                        onChange={(e) => setBrandingData({ ...brandingData, primaryColor: e.target.value })}
                                        className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                        placeholder="#FF6B35"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                                    Warna Sekunder
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-gray-200">
                                        <input
                                            type="color"
                                            value={brandingData.secondaryColor}
                                            onChange={(e) => setBrandingData({ ...brandingData, secondaryColor: e.target.value })}
                                            className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={brandingData.secondaryColor}
                                        onChange={(e) => setBrandingData({ ...brandingData, secondaryColor: e.target.value })}
                                        className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                        placeholder="#004E89"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                                    Jenis Font
                                </label>
                                <div className="relative">
                                    <select
                                        value={brandingData.fontFamily}
                                        onChange={(e) => setBrandingData({ ...brandingData, fontFamily: e.target.value })}
                                        className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="Inter">Inter (Modern & Bersih)</option>
                                        <option value="Roboto">Roboto (Profesional)</option>
                                        <option value="Poppins">Poppins (Ramah)</option>
                                        <option value="Playfair Display">Playfair Display (Elegan)</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronRight className="w-4 h-4 rotate-90" />
                                    </div>
                                </div>
                            </div>
                        </div >

                        {/* Preview */}
                        < div className="mt-8 p-6 rounded-2xl border border-gray-100 bg-gray-50/50" >
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Pratinjau Tampilan</p>
                            <div className="flex gap-4">
                                <div
                                    className="w-32 h-24 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg transition-all duration-300"
                                    style={{ backgroundColor: brandingData.primaryColor, fontFamily: brandingData.fontFamily }}
                                >
                                    Utama
                                </div>
                                <div
                                    className="w-32 h-24 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg transition-all duration-300"
                                    style={{ backgroundColor: brandingData.secondaryColor, fontFamily: brandingData.fontFamily }}
                                >
                                    Sekunder
                                </div>
                            </div>
                        </div >
                    </div >
                )

            case 2:
                return (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F] mb-2">Tambahkan Cabang Pertama</h2>
                            <p className="text-gray-500 text-sm">Beritahu kami tentang lokasi restoran Anda</p>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                                    Nama Cabang <span className="text-orange-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={branchData.name}
                                    onChange={(e) => setBranchData({ ...branchData, name: e.target.value })}
                                    required
                                    className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    placeholder="CareOS Plaza Indonesia"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                                    Alamat <span className="text-orange-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={branchData.address}
                                    onChange={(e) => setBranchData({ ...branchData, address: e.target.value })}
                                    required
                                    className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    placeholder="Jl. Sudirman No. 123"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                                        Kota <span className="text-orange-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={branchData.city}
                                        onChange={(e) => setBranchData({ ...branchData, city: e.target.value })}
                                        required
                                        className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                        placeholder="Jakarta"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                                        Area
                                    </label>
                                    <input
                                        type="text"
                                        value={branchData.area}
                                        onChange={(e) => setBranchData({ ...branchData, area: e.target.value })}
                                        className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                        placeholder="Menteng"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                                        Jam Buka
                                    </label>
                                    <input
                                        type="time"
                                        value={branchData.openingHours}
                                        onChange={(e) => setBranchData({ ...branchData, openingHours: e.target.value })}
                                        className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                                        Jam Tutup
                                    </label>
                                    <input
                                        type="time"
                                        value={branchData.closingHours}
                                        onChange={(e) => setBranchData({ ...branchData, closingHours: e.target.value })}
                                        className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )

            case 3:
                return (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F] mb-2">Semua Sudah Siap!</h2>
                            <p className="text-gray-500 text-sm">Restoran Anda siap untuk diluncurkan</p>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Langkah Selanjutnya</h3>
                            <ul className="space-y-4">
                                {[
                                    'Tambahkan item menu dan kategori',
                                    'Konfigurasi metode pembayaran',
                                    'Atur opsi pengiriman',
                                    'Undang anggota tim Anda'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                                        <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
                            <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">URL Restoran Anda</h3>
                            <div className="bg-white border border-blue-100 rounded-xl px-4 py-3 font-mono text-sm text-blue-600 mb-2 shadow-sm">
                                https://{tenantSlug}.careos.id
                            </div>
                            <p className="text-xs text-blue-600/80 font-medium">
                                Anda dapat menghubungkan domain kustom nanti di pengaturan
                            </p>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-6 font-sans text-[#1D1D1F] selection:bg-orange-100 selection:text-orange-900">
            <div className="w-full max-w-3xl">
                {/* Progress Steps */}
                <div className="mb-10">
                    <div className="flex items-center justify-between relative">
                        {/* Connecting Line */}
                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 -z-10" />

                        {steps.map((step) => {
                            const isActive = currentStep >= step.id
                            const isCurrent = currentStep === step.id
                            const Icon = step.icon

                            return (
                                <div key={step.id} className="flex flex-col items-center bg-transparent">
                                    <div
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive
                                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-110'
                                            : 'bg-white text-gray-300 border-2 border-gray-200'
                                            }`}
                                    >
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className={`mt-3 text-center transition-all duration-300 ${isCurrent ? 'opacity-100 translate-y-0' : 'opacity-60'}`}>
                                        <p className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-orange-600' : 'text-gray-400'}`}>
                                            {step.title}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-[32px] shadow-2xl shadow-black/5 p-8 md:p-12 border border-gray-100 transition-all duration-500">
                    {error && (
                        <div className="mb-8 p-4 bg-red-50/50 border border-red-100 rounded-2xl text-red-600 text-xs font-medium text-center flex items-center justify-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            {error}
                        </div>
                    )}

                    {renderStepContent()}

                    {/* Navigation Buttons */}
                    <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${currentStep === 1
                                ? 'opacity-0 cursor-default'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Kembali
                        </button>

                        <button
                            onClick={handleNext}
                            disabled={loading || (currentStep === 2 && (!branchData.name || !branchData.address || !branchData.city))}
                            className="bg-orange-500 text-white py-3 px-8 rounded-xl font-bold text-sm hover:bg-orange-600 transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                'Menyelesaikan...'
                            ) : (
                                <>
                                    {currentStep === steps.length ? 'Selesaikan' : 'Lanjut'}
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OnboardingWizardPage
