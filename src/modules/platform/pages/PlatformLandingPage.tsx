import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Sparkles,
    Globe,
    Zap,
    TrendingUp,
    Shield,
    Smartphone,
    Check,
    ArrowRight,
    Star,
    UtensilsCrossed,
    Play
} from 'lucide-react'
import { getDemoUrl } from '@/core/utils/urlHelpers'

const PlatformLandingPage: React.FC = () => {
    const navigate = useNavigate()

    const features = [
        {
            icon: Globe,
            title: 'Website Bisnis Anda Sendiri',
            description: 'Dapatkan website yang sepenuhnya disesuaikan dengan branding, warna, dan domain Anda.'
        },
        {
            icon: Zap,
            title: 'Setup Instan',
            description: 'Langsung online dalam hitungan menit dengan panduan onboarding kami.'
        },
        {
            icon: TrendingUp,
            title: 'Manajemen Lengkap',
            description: 'Kelola pesanan, reservasi, menu, program loyalitas, dan analitik.'
        },
        {
            icon: Shield,
            title: 'Aman & Terpercaya',
            description: 'Keamanan tingkat perusahaan dengan jaminan uptime 99.9%.'
        },
        {
            icon: Smartphone,
            title: 'Desain Mobile-First',
            description: 'Antarmuka responsif yang indah dan bekerja sempurna di semua perangkat.'
        },
        {
            icon: Sparkles,
            title: 'Fitur Premium',
            description: 'Analitik canggih, program loyalitas, dan alat pemasaran sudah termasuk.'
        }
    ]

    const pricingTiers = [
        {
            name: 'Uji Coba',
            price: 'Gratis',
            period: '14 hari',
            description: 'Sempurna untuk mencoba',
            features: [
                'Akses platform penuh',
                'Subdomain kustom',
                'Hingga 100 pesanan',
                'Dukungan Email',
                'Tanpa kartu kredit'
            ],
            cta: 'Mulai Uji Coba Gratis',
            highlighted: false
        },
        {
            name: 'Profesional',
            price: 'Rp 799rb',
            period: 'per bulan',
            description: 'Terbaik untuk restoran berkembang',
            features: [
                'Semua fitur Uji Coba',
                'Dukungan domain kustom',
                'Pesanan tanpa batas',
                'Banyak lokasi cabang',
                'Analitik canggih',
                'Dukungan prioritas',
                'Opsi White-label'
            ],
            cta: 'Mulai Berlangganan',
            highlighted: true
        },
        {
            name: 'Enterprise',
            price: 'Kustom',
            period: 'hubungi kami',
            description: 'Untuk jaringan restoran besar',
            features: [
                'Semua fitur Profesional',
                'Manajer akun dedikasi',
                'Integrasi kustom',
                'Jaminan SLA',
                'Dukungan telepon 24/7',
                'Pelatihan & onboarding'
            ],
            cta: 'Hubungi Penjualan',
            highlighted: false
        }
    ]

    const testimonials = [
        {
            name: 'Sarah Johnson',
            restaurant: 'Bella Italia',
            image: '👩‍🍳',
            rating: 5,
            text: 'CareOS mengubah bisnis kami. Kami beralih dari pesanan kertas ke sistem digital sepenuhnya hanya dalam satu hari!'
        },
        {
            name: 'Michael Chen',
            restaurant: 'Dragon Wok',
            image: '👨‍🍳',
            rating: 5,
            text: 'Analitiknya saja sudah membayar biaya langganan. Pendapatan kami meningkat 40% di bulan pertama.'
        },
        {
            name: 'Maria Garcia',
            restaurant: 'Taco Fiesta',
            image: '👩‍🍳',
            rating: 5,
            text: 'Pelanggan kami menyukai program loyalitasnya. Pesanan berulang meningkat sebesar 60%!'
        }
    ]

    return (
        <div className="min-h-screen bg-[#FBFBFD] font-sans text-[#1D1D1F] selection:bg-orange-100 selection:text-orange-900">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-xl border-b border-gray-200/50 z-50 transition-all duration-300 supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between items-center h-[52px] md:h-16">
                        <div
                            className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => navigate('/')}
                        >
                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-md shadow-orange-500/20">
                                <UtensilsCrossed className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-semibold tracking-tight text-[#1D1D1F]">
                                CareOS
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => window.location.href = getDemoUrl()}
                                className="text-[13px] font-medium text-[#1D1D1F]/80 hover:text-[#1D1D1F] transition-colors"
                            >
                                Lihat Demo
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="px-4 py-1.5 bg-[#1D1D1F] text-white text-[13px] font-medium rounded-full hover:bg-black transition-all shadow-sm hover:shadow-md active:scale-95 transform duration-100"
                            >
                                Mulai Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-24 px-6 lg:px-8 overflow-hidden">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200/60 rounded-full shadow-sm mb-8 animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                        <span className="text-[13px] font-medium text-gray-600">Platform Restoran White-Label</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tighter text-[#1D1D1F] mb-6 leading-[1.05]">
                        Restoran Anda.<br />
                        <span className="text-gray-400">Brand Anda.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-[#86868B] mb-10 max-w-2xl mx-auto leading-relaxed font-normal tracking-tight">
                        Luncurkan website restoran dengan brand Anda sendiri dalam hitungan menit.
                        Sistem manajemen lengkap untuk pesanan, reservasi, dan loyalitas.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() => navigate('/register')}
                            className="px-6 py-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-95 transform duration-200 flex items-center gap-2 text-[15px]"
                        >
                            Mulai Uji Coba Gratis
                            <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => window.location.href = getDemoUrl()}
                            className="px-6 py-3 bg-white text-[#1D1D1F] rounded-full font-medium hover:bg-[#F5F5F7] transition-all border border-gray-200 active:scale-95 transform duration-200 flex items-center gap-2 text-[15px]"
                        >
                            <Play className="w-4 h-4 fill-[#1D1D1F]" />
                            Lihat Live Demo
                        </button>
                    </div>

                    <p className="text-[13px] text-[#86868B] mt-8 font-medium">
                        Tanpa kartu kredit • Uji coba gratis 14 hari • Setup dalam 5 menit
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-32 px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-semibold text-[#1D1D1F] mb-6 tracking-tight">
                            Semua yang Anda Butuhkan.
                        </h2>
                        <p className="text-xl text-[#86868B] max-w-2xl mx-auto tracking-tight">
                            Fitur canggih yang dirancang untuk restoran modern, dikemas dalam antarmuka yang indah.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="p-8 rounded-[32px] bg-[#F5F5F7] hover:bg-[#F0F0F2] transition-colors duration-300 group"
                            >
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm text-[#1D1D1F]">
                                    <feature.icon className="w-6 h-6" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-semibold text-[#1D1D1F] mb-3 tracking-tight">
                                    {feature.title}
                                </h3>
                                <p className="text-[#86868B] leading-relaxed text-[15px]">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-32 px-6 lg:px-8 bg-[#FBFBFD]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-semibold text-[#1D1D1F] mb-6 tracking-tight">
                            Setup Mudah.
                        </h2>
                        <p className="text-xl text-[#86868B] tracking-tight">
                            Dari pendaftaran hingga pesanan pertama dalam hitungan menit.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[1px] bg-gray-200 z-0"></div>

                        {[
                            {
                                step: '1',
                                title: 'Daftar',
                                description: 'Daftar dengan detail bisnis Anda.'
                            },
                            {
                                step: '2',
                                title: 'Kustomisasi',
                                description: 'Tambahkan branding dan menu Anda.'
                            },
                            {
                                step: '3',
                                title: 'Luncurkan',
                                description: 'Mulai terima pesanan segera.'
                            }
                        ].map((item, index) => (
                            <div key={index} className="text-center relative z-10">
                                <div className="w-24 h-24 bg-white border border-gray-200 rounded-full flex items-center justify-center text-3xl font-bold text-[#1D1D1F] mx-auto mb-8 shadow-lg shadow-gray-200/50">
                                    {item.step}
                                </div>
                                <h3 className="text-2xl font-semibold text-[#1D1D1F] mb-3 tracking-tight">
                                    {item.title}
                                </h3>
                                <p className="text-[#86868B]">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-32 px-6 lg:px-8 bg-[#1D1D1F] text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-semibold mb-6 tracking-tight">
                            Harga Transparan.
                        </h2>
                        <p className="text-xl text-gray-400 tracking-tight">
                            Tanpa biaya tersembunyi. Batalkan kapan saja.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {pricingTiers.map((tier, index) => (
                            <div
                                key={index}
                                className={`p-8 rounded-[32px] border transition-all duration-300 ${tier.highlighted
                                    ? 'bg-[#2D2D2F] border-orange-500 shadow-2xl shadow-orange-900/20 scale-105 z-10'
                                    : 'bg-transparent border-[#424245] hover:bg-[#2D2D2F]'
                                    }`}
                            >
                                {tier.highlighted && (
                                    <div className="inline-block px-3 py-1 bg-orange-500 text-white text-[11px] font-bold uppercase tracking-wider rounded-full mb-6">
                                        Paling Populer
                                    </div>
                                )}

                                <h3 className="text-2xl font-semibold mb-2 tracking-tight">
                                    {tier.name}
                                </h3>
                                <p className="text-gray-400 mb-8 text-[15px]">{tier.description}</p>

                                <div className="mb-8">
                                    <span className="text-5xl font-bold tracking-tight">
                                        {tier.price}
                                    </span>
                                    <span className="text-gray-400 ml-2 font-medium">
                                        {tier.period}
                                    </span>
                                </div>

                                <ul className="space-y-4 mb-10">
                                    {tier.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Check className="w-3 h-3 text-orange-500" strokeWidth={3} />
                                            </div>
                                            <span className="text-gray-300 text-[15px]">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => navigate('/register')}
                                    className={`w-full py-3.5 rounded-full font-medium transition-all active:scale-95 text-[15px] ${tier.highlighted
                                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                                        : 'bg-white text-[#1D1D1F] hover:bg-[#F5F5F7]'
                                        }`}
                                >
                                    {tier.cta}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-32 px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-semibold text-[#1D1D1F] mb-6 tracking-tight">
                            Kisah Sukses.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className="p-8 rounded-[32px] bg-[#F5F5F7] border border-transparent"
                            >
                                <div className="flex items-center gap-1 mb-6">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
                                    ))}
                                </div>

                                <p className="text-xl text-[#1D1D1F] mb-8 font-medium leading-relaxed tracking-tight">
                                    "{testimonial.text}"
                                </p>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
                                        {testimonial.image}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-[#1D1D1F]">
                                            {testimonial.name}
                                        </p>
                                        <p className="text-sm text-[#86868B]">
                                            {testimonial.restaurant}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6 lg:px-8 bg-[#F5F5F7]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-5xl md:text-6xl font-semibold text-[#1D1D1F] mb-8 tracking-tighter">
                        Siap untuk memulai?
                    </h2>
                    <p className="text-xl text-[#86868B] mb-12 max-w-2xl mx-auto tracking-tight">
                        Bergabunglah dengan ratusan restoran yang mengembangkan bisnis mereka dengan CareOS hari ini.
                    </p>
                    <button
                        onClick={() => navigate('/register')}
                        className="px-8 py-4 bg-[#1D1D1F] text-white rounded-full font-medium text-[17px] hover:bg-black transition-all shadow-xl active:scale-95 transform duration-200"
                    >
                        Mulai Uji Coba Gratis
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-16 px-6 lg:px-8 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                    <UtensilsCrossed className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-semibold text-[#1D1D1F]">CareOS</span>
                            </div>
                            <p className="text-[#86868B] leading-relaxed text-[13px]">
                                Memberdayakan restoran dengan teknologi modern.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-[#1D1D1F] mb-6 text-[13px]">Produk</h4>
                            <ul className="space-y-4 text-[#86868B] text-[13px]">
                                <li><a href="#" className="hover:text-orange-500 transition-colors">Fitur</a></li>
                                <li><a href="#" className="hover:text-orange-500 transition-colors">Harga</a></li>
                                <li><a href="#" className="hover:text-orange-500 transition-colors">Demo</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-[#1D1D1F] mb-6 text-[13px]">Perusahaan</h4>
                            <ul className="space-y-4 text-[#86868B] text-[13px]">
                                <li><a href="#" className="hover:text-orange-500 transition-colors">Tentang</a></li>
                                <li><a href="#" className="hover:text-orange-500 transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-orange-500 transition-colors">Kontak</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-[#1D1D1F] mb-6 text-[13px]">Member Area</h4>
                            <ul className="space-y-4 text-[#86868B] text-[13px]">
                                <li><a href="#" className="hover:text-orange-500 transition-colors">Komunitas</a></li>
                                <li><a href="#" className="hover:text-orange-500 transition-colors">Bantuan & Support</a></li>
                                <li><a href="#" className="hover:text-orange-500 transition-colors">Dokumentasi API</a></li>
                                <li><a href="#" className="hover:text-orange-500 transition-colors">Status Sistem</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-[#1D1D1F] mb-6 text-[13px]">Legal</h4>
                            <ul className="space-y-4 text-[#86868B] text-[13px]">
                                <li><a href="#" className="hover:text-orange-500 transition-colors">Privasi</a></li>
                                <li><a href="#" className="hover:text-orange-500 transition-colors">Syarat & Ketentuan</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-8 text-center text-[#86868B] text-[11px]">
                        <p>&copy; 2024 CareOS. Hak Cipta Dilindungi.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default PlatformLandingPage
