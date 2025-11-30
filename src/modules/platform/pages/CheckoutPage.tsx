import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { UtensilsCrossed, Check, Shield, Zap, Smartphone, CreditCard, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { activateTenantSubscription, getOwnerProfile } from '@core/services/tenantService'
import { supabase } from '@core/supabase/supabase'

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const tenantIdParam = searchParams.get('tenantId')

    const [loading, setLoading] = useState(false)
    const [initializing, setInitializing] = useState(true)
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')
    const [selectedPayment, setSelectedPayment] = useState('qris')
    const [tenantData, setTenantData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchTenant = async () => {
            try {
                // Get current user
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    navigate('/login?redirect=/checkout')
                    return
                }

                // If tenantId is in params, verify it belongs to user, or just fetch user's tenant
                // For simplicity, we'll fetch the user's profile which has tenant_id
                const profile = await getOwnerProfile(user.id)
                if (!profile || !profile.tenant_id) {
                    throw new Error('Tenant not found')
                }

                // Fetch tenant details
                const { data: tenant, error: tenantError } = await supabase
                    .from('tenants')
                    .select('*')
                    .eq('id', profile.tenant_id)
                    .single()

                if (tenantError) throw tenantError
                setTenantData(tenant)
            } catch (err: any) {
                console.error('Error fetching tenant:', err)
                setError('Gagal memuat data restoran. Silakan coba lagi.')
            } finally {
                setInitializing(false)
            }
        }

        fetchTenant()
    }, [navigate])

    const handlePayment = async () => {
        if (!tenantData) return
        setLoading(true)
        setError(null)

        try {
            // Simulate payment processing delay
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Activate subscription
            const result = await activateTenantSubscription(tenantData.id, selectedPlan)

            if (result.success) {
                navigate('/start/success?slug=' + tenantData.slug)
            } else {
                throw new Error(result.error || 'Pembayaran gagal')
            }
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan saat memproses pembayaran')
        } finally {
            setLoading(false)
        }
    }

    if (initializing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FBFBFD]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    if (!tenantData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FBFBFD]">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-900 font-medium">Data tidak ditemukan</p>
                    <button onClick={() => navigate('/start')} className="mt-4 text-orange-600 hover:underline">
                        Kembali ke Pendaftaran
                    </button>
                </div>
            </div>
        )
    }

    const monthlyPrice = 99000
    const yearlyPrice = 990000
    const currentPrice = selectedPlan === 'monthly' ? monthlyPrice : yearlyPrice

    return (
        <div className="min-h-screen bg-[#FBFBFD] font-sans text-[#1D1D1F]">
            {/* 1. Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                            <UtensilsCrossed className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-lg">CareOS</span>
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                        Langkah Terakhir: Aktivasi Website
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* LEFT COLUMN: Plan & Payment */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* 2. Benefits */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-bold mb-4">Mengapa CareOS?</h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                        <Check className="w-3.5 h-3.5 text-green-600" strokeWidth={3} />
                                    </div>
                                    <span className="text-gray-700">Website restoran siap pakai dalam 1 menit</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                        <Check className="w-3.5 h-3.5 text-green-600" strokeWidth={3} />
                                    </div>
                                    <span className="text-gray-700">Terima pesanan langsung (Dine-in, Takeaway, Delivery)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                        <Check className="w-3.5 h-3.5 text-green-600" strokeWidth={3} />
                                    </div>
                                    <span className="text-gray-700">Integrasi WhatsApp Order gratis selamanya</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Select Plan */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold">Pilih Paket</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Monthly */}
                                <div
                                    onClick={() => setSelectedPlan('monthly')}
                                    className={`cursor-pointer p-6 rounded-2xl border-2 transition-all duration-200 relative ${selectedPlan === 'monthly'
                                        ? 'border-orange-500 bg-orange-50/50'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-gray-900">Bulanan</h3>
                                            <p className="text-sm text-gray-500">Bayar per bulan</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlan === 'monthly' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                                            {selectedPlan === 'monthly' && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <span className="text-2xl font-bold">Rp 99rb</span>
                                        <span className="text-gray-500 text-sm">/bulan</span>
                                    </div>
                                    <p className="text-xs text-gray-500">Batalkan kapan saja.</p>
                                </div>

                                {/* Yearly */}
                                <div
                                    onClick={() => setSelectedPlan('yearly')}
                                    className={`cursor-pointer p-6 rounded-2xl border-2 transition-all duration-200 relative ${selectedPlan === 'yearly'
                                        ? 'border-orange-500 bg-orange-50/50 shadow-md shadow-orange-500/10'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                >
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                        Hemat 2 Bulan
                                    </div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-gray-900">Tahunan</h3>
                                            <p className="text-sm text-gray-500">Bayar per tahun</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlan === 'yearly' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                                            {selectedPlan === 'yearly' && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <span className="text-2xl font-bold">Rp 990rb</span>
                                        <span className="text-gray-500 text-sm">/tahun</span>
                                    </div>
                                    <p className="text-xs text-gray-500">Termasuk domain .com gratis.</p>
                                </div>
                            </div>
                        </div>

                        {/* 4. Payment Method */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold">Metode Pembayaran</h2>
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                {[
                                    { id: 'qris', name: 'QRIS', icon: <Smartphone className="w-5 h-5" /> },
                                    { id: 'shopeepay', name: 'ShopeePay', icon: <CreditCard className="w-5 h-5" /> },
                                    { id: 'gopay', name: 'GoPay', icon: <CreditCard className="w-5 h-5" /> },
                                    { id: 'va', name: 'Virtual Account', icon: <CreditCard className="w-5 h-5" /> },
                                ].map((method) => (
                                    <div
                                        key={method.id}
                                        onClick={() => setSelectedPayment(method.id)}
                                        className={`flex items-center gap-4 p-4 cursor-pointer border-b last:border-0 hover:bg-gray-50 transition-colors ${selectedPayment === method.id ? 'bg-orange-50/30' : ''}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${selectedPayment === method.id ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                                            {selectedPayment === method.id && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                                            {method.icon}
                                        </div>
                                        <span className="font-medium text-gray-900">{method.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-6">Ringkasan Pesanan</h3>

                            <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Restoran</p>
                                    <p className="font-medium text-gray-900">{tenantData.business_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">URL</p>
                                    <p className="font-medium text-gray-900">{tenantData.slug}.careos.cloud</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Paket</p>
                                    <p className="font-medium text-gray-900 capitalize">{selectedPlan}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mb-8">
                                <span className="text-gray-600 font-medium">Total Bayar</span>
                                <span className="text-2xl font-bold text-gray-900">
                                    Rp {currentPrice.toLocaleString('id-ID')}
                                </span>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold text-base hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        Bayar & Aktivasi
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs text-gray-400 mt-4">
                                Pembayaran aman & terenkripsi.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default CheckoutPage
