import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, ArrowRight, Store, ExternalLink } from 'lucide-react'
import { getTenantUrl } from '@core/utils/urlHelpers'
import Confetti from 'react-confetti'

const PaymentSuccessPage: React.FC = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const slug = searchParams.get('slug')
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight })

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight })
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const handleGoToDashboard = () => {
        if (slug) {
            const tenantUrl = getTenantUrl(slug)
            window.location.href = `${tenantUrl}/admin/dasbor`
        } else {
            navigate('/')
        }
    }

    return (
        <div className="min-h-screen bg-[#FBFBFD] flex items-center justify-center p-6 font-sans text-[#1D1D1F]">
            <Confetti
                width={windowSize.width}
                height={windowSize.height}
                recycle={false}
                numberOfPieces={500}
                gravity={0.2}
            />

            <div className="max-w-md w-full bg-white rounded-[32px] shadow-2xl p-8 md:p-12 text-center animate-fade-in-up border border-gray-100">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-in">
                    <CheckCircle2 className="w-10 h-10 text-green-600" strokeWidth={3} />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                    Website Aktif!
                </h1>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    Selamat! Website restoran Anda sudah siap digunakan. Anda sekarang dapat mulai mengatur menu dan menerima pesanan.
                </p>

                {slug && (
                    <div className="bg-gray-50 rounded-2xl p-4 mb-8 border border-gray-100">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2 font-semibold">URL Website Anda</p>
                        <a
                            href={getTenantUrl(slug)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 text-orange-600 font-bold hover:underline"
                        >
                            <Store className="w-4 h-4" />
                            {slug}.careos.cloud
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                )}

                <button
                    onClick={handleGoToDashboard}
                    className="w-full py-4 bg-[#1D1D1F] text-white rounded-xl font-bold text-base hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                >
                    Masuk ke Dashboard
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}

export default PaymentSuccessPage
