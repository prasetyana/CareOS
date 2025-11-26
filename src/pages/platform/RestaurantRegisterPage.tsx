import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerRestaurantOwner } from '../../services/tenantService'
import { UtensilsCrossed, ArrowRight, Loader2, Check, Eye, EyeOff } from 'lucide-react'

interface InputFieldProps {
    label: string
    name: string
    type?: string
    placeholder?: string
    required?: boolean
    minLength?: number
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

const InputField: React.FC<InputFieldProps> = ({ label, name, type = "text", placeholder, required = false, minLength, value, onChange }) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                {label} {required && <span className="text-orange-500">*</span>}
            </label>
            <div className="relative">
                <input
                    type={inputType}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    minLength={minLength}
                    className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200"
                    placeholder={placeholder}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}

const RestaurantRegisterPage: React.FC = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        ownerName: '',
        ownerEmail: '',
        ownerPassword: '',
        ownerPasswordConfirm: '',
        ownerPhone: '',
        businessName: '',
        businessDescription: '',
        businessEmail: '',
        businessPhone: '',
        agreeToTerms: false
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // Validation
        if (formData.ownerPassword !== formData.ownerPasswordConfirm) {
            setError('Kata sandi tidak cocok')
            return
        }

        if (formData.ownerPassword.length < 6) {
            setError('Kata sandi minimal 6 karakter')
            return
        }

        if (!formData.agreeToTerms) {
            setError('Anda harus menyetujui syarat dan ketentuan')
            return
        }

        setLoading(true)

        try {
            // Generate username from owner name
            const firstName = formData.ownerName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            let username = firstName;

            // Import dynamically to avoid issues if mockDB isn't fully compatible with this file's environment
            // In a real app, this would be a server-side check or a separate API call
            const { checkUsernameAvailability } = await import('../../data/mockDB');

            let isAvailable = await checkUsernameAvailability(username);
            let counter = 1;
            while (!isAvailable) {
                username = `${firstName}${counter}`;
                isAvailable = await checkUsernameAvailability(username);
                counter++;
            }

            const result = await registerRestaurantOwner({
                ownerName: formData.ownerName,
                ownerEmail: formData.ownerEmail,
                ownerPassword: formData.ownerPassword,
                ownerPhone: formData.ownerPhone,
                username: username,
                businessName: formData.businessName,
                businessDescription: formData.businessDescription,
                businessEmail: formData.businessEmail,
                businessPhone: formData.businessPhone
            })

            if (result.success) {
                // Redirect to onboarding wizard
                navigate(`/onboarding?tenant=${result.slug}`)
            } else {
                setError(result.error || 'Pendaftaran gagal')
            }
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan saat pendaftaran')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex flex-col items-center justify-center p-6 font-sans text-[#1D1D1F] selection:bg-orange-100 selection:text-orange-900">
            <div className="w-full max-w-2xl bg-white rounded-[32px] shadow-2xl shadow-black/5 p-8 md:p-12 border border-gray-100 animate-fade-in-up">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
                        Mulai Perjalanan Restoran Anda
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Bergabung dengan CareOS dan dapatkan website restoran dengan brand Anda sendiri.
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-8 p-4 bg-red-50/50 border border-red-100 rounded-2xl text-red-600 text-xs font-medium text-center flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Owner Information */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold tracking-tight flex items-center gap-3 text-[#1D1D1F]">
                            <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold shadow-sm">1</span>
                            Informasi Pemilik
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputField
                                label="Nama Lengkap"
                                name="ownerName"
                                value={formData.ownerName}
                                onChange={handleChange}
                                placeholder="John Doe"
                                required
                            />
                            <InputField
                                label="Email"
                                name="ownerEmail"
                                type="email"
                                value={formData.ownerEmail}
                                onChange={handleChange}
                                placeholder="a.prasetyanaharudin@gmail.com"
                                required
                            />
                            <InputField
                                label="Kata Sandi"
                                name="ownerPassword"
                                type="password"
                                value={formData.ownerPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                            <InputField
                                label="Konfirmasi Kata Sandi"
                                name="ownerPasswordConfirm"
                                type="password"
                                value={formData.ownerPasswordConfirm}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                            <div className="md:col-span-2">
                                <InputField
                                    label="Nomor Telepon"
                                    name="ownerPhone"
                                    type="tel"
                                    value={formData.ownerPhone}
                                    onChange={handleChange}
                                    placeholder="+62 812 3456 7890"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Business Information */}
                    <div className="space-y-6 pt-8 border-t border-gray-100">
                        <h2 className="text-lg font-bold tracking-tight flex items-center gap-3 text-[#1D1D1F]">
                            <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold shadow-sm">2</span>
                            Informasi Restoran
                        </h2>
                        <div className="space-y-5">
                            <InputField
                                label="Nama Restoran"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleChange}
                                placeholder="Pizza Palace"
                                required
                            />

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                                    Deskripsi
                                </label>
                                <textarea
                                    name="businessDescription"
                                    value={formData.businessDescription}
                                    onChange={handleChange}
                                    rows={3}
                                    className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 resize-none"
                                    placeholder="Restoran Italia yang indah menyajikan pizza dan pasta otentik..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <InputField
                                    label="Email Bisnis"
                                    name="businessEmail"
                                    type="email"
                                    value={formData.businessEmail}
                                    onChange={handleChange}
                                    placeholder="agung45didi@gmail.com"
                                    required
                                />
                                <InputField
                                    label="Telepon Bisnis"
                                    name="businessPhone"
                                    type="tel"
                                    value={formData.businessPhone}
                                    onChange={handleChange}
                                    placeholder="+62 21 1234 5678"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="pt-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    name="agreeToTerms"
                                    checked={formData.agreeToTerms}
                                    onChange={handleChange}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-orange-500 checked:bg-orange-500 hover:border-orange-400"
                                />
                                <Check className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={3} />
                            </div>
                            <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors">
                                Saya setuju dengan{' '}
                                <a href="#" className="text-orange-600 hover:text-orange-700 font-bold hover:underline">
                                    Syarat dan Ketentuan
                                </a>{' '}
                                dan{' '}
                                <a href="#" className="text-orange-600 hover:text-orange-700 font-bold hover:underline">
                                    Kebijakan Privasi
                                </a>
                            </span>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-bold text-sm hover:bg-orange-600 transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wide"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Membuat Restoran Anda...
                            </>
                        ) : (
                            <>
                                Buat Akun Restoran
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default RestaurantRegisterPage
