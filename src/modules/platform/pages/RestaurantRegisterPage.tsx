import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerRestaurantOwner, checkSlugAvailability, generateSlugFromBusinessName, checkEmailAvailability, checkPhoneAvailability } from '@core/services/tenantService'
import { ArrowRight, Loader2, Check, Eye, EyeOff, User, Store, Sparkles, AlertCircle, CheckCircle2, XCircle, Smartphone, Mail, Lock, Link as LinkIcon, RefreshCw, Info, LayoutTemplate, Monitor, Smartphone as MobileIcon, Palette } from 'lucide-react'
import Modal from '@ui/Modal'

// Color Presets
const COLOR_PRESETS = [
    { name: 'Orange', value: '#FF6B35' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Green', value: '#22C55E' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Black', value: '#171717' },
    { name: 'Brown', value: '#78350F' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
]

interface InputFieldProps {
    label: string
    name: string
    type?: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    onBlur?: () => void
    placeholder?: string
    required?: boolean
    error?: string
    touched?: boolean
    helperText?: string
    minLength?: number
    rightElement?: React.ReactNode
    icon?: React.ElementType
    tooltip?: string
    focusColor?: 'orange' | 'blue'
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    onBlur,
    placeholder,
    required,
    error,
    touched,
    helperText,
    minLength,
    rightElement,
    icon: Icon,
    tooltip,
    focusColor = 'orange'
}) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 ml-1">
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                    {label} {required && <span className="text-orange-500">*</span>}
                </label>
                {tooltip && (
                    <div className="group/tooltip relative">
                        <Info className="w-3 h-3 text-gray-400 cursor-help" />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                            {tooltip}
                            <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-900"></div>
                        </div>
                    </div>
                )}
            </div>
            <div className="relative group">
                {Icon && (
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors ${focusColor === 'blue' ? 'group-focus-within:text-blue-500' : 'group-focus-within:text-orange-500'}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                )}
                <input
                    type={inputType}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    required={required}
                    minLength={minLength}
                    className={`block w-full ${Icon ? 'pl-8' : 'pl-3'} pr-8 py-2.5 bg-gray-50/50 hover:bg-white border-[1.5px] rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus:ring-4 transition-all duration-200 ${touched && error
                        ? 'border-red-300 focus:border-red-500 bg-red-50/30'
                        : focusColor === 'blue'
                            ? 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/10'
                            : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500/10'
                        }`}
                    style={{ outline: '0', outlineOffset: '0', boxShadow: 'none' }}
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {rightElement}
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    )}
                </div>
            </div>
            {(touched && error) ? (
                <p className="text-[11px] text-red-500 font-medium ml-1 animate-fade-in flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {error}
                </p>
            ) : helperText ? (
                <p className="text-[11px] text-gray-500 ml-1">{helperText}</p>
            ) : null}
        </div>
    )
}

const RestaurantRegisterPage: React.FC = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [generalError, setGeneralError] = useState<string | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        ownerName: '',
        ownerEmail: '',
        ownerPassword: '',
        ownerPhone: '',
        businessName: '',
        businessDescription: '',
        primaryColor: '#FF6B35',
        agreeToTerms: false
    })

    // Validation State
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    // Slug State
    const [slug, setSlug] = useState('')
    const [isSlugTouched, setIsSlugTouched] = useState(false)
    const [isCheckingSlug, setIsCheckingSlug] = useState(false)
    const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
    const [slugError, setSlugError] = useState<string | null>(null)
    const [showTerms, setShowTerms] = useState(false)
    const [showPrivacy, setShowPrivacy] = useState(false)

    // Email & Phone Check State
    const [isCheckingEmail, setIsCheckingEmail] = useState(false)
    const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null)
    const [isCheckingPhone, setIsCheckingPhone] = useState(false)
    const [phoneAvailable, setPhoneAvailable] = useState<boolean | null>(null)

    // Preview State
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')

    // Description Textarea Ref
    const descriptionTextareaRef = React.useRef<HTMLTextAreaElement>(null)

    // Auto-generate slug from business name if not manually touched
    useEffect(() => {
        if (!isSlugTouched && formData.businessName) {
            const generatedSlug = generateSlugFromBusinessName(formData.businessName)
            setSlug(generatedSlug)
        }
    }, [formData.businessName, isSlugTouched])

    // Check slug availability
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (slug.length >= 3) {
                setIsCheckingSlug(true)
                try {
                    const available = await checkSlugAvailability(slug)
                    setSlugAvailable(available)
                    if (!available) {
                        setSlugError('URL ini sudah digunakan')
                    } else {
                        setSlugError(null)
                    }
                } catch (err) {
                    console.error('Error checking slug:', err)
                } finally {
                    setIsCheckingSlug(false)
                }
            } else {
                setSlugAvailable(null)
                setSlugError(null)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [slug])

    // Debounce timer for email check
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (formData.ownerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) {
                setIsCheckingEmail(true)
                try {
                    const available = await checkEmailAvailability(formData.ownerEmail)
                    setEmailAvailable(available)
                    if (!available) {
                        setErrors(prev => ({ ...prev, ownerEmail: 'Email sudah terdaftar' }))
                    } else {
                        setErrors(prev => {
                            const newErrors = { ...prev }
                            delete newErrors.ownerEmail
                            return newErrors
                        })
                    }
                } catch (err) {
                    console.error('Error checking email:', err)
                } finally {
                    setIsCheckingEmail(false)
                }
            } else {
                setEmailAvailable(null)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [formData.ownerEmail])

    // Debounce timer for phone check
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (formData.ownerPhone && formData.ownerPhone.length >= 10) {
                setIsCheckingPhone(true)
                try {
                    const available = await checkPhoneAvailability(formData.ownerPhone)
                    setPhoneAvailable(available)
                    if (!available) {
                        setErrors(prev => ({ ...prev, ownerPhone: 'Nomor telepon sudah terdaftar' }))
                    } else {
                        setErrors(prev => {
                            const newErrors = { ...prev }
                            delete newErrors.ownerPhone
                            return newErrors
                        })
                    }
                } catch (err) {
                    console.error('Error checking phone:', err)
                } finally {
                    setIsCheckingPhone(false)
                }
            } else {
                setPhoneAvailable(null)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [formData.ownerPhone])

    const validateField = (name: string, value: any) => {
        let error = ''

        switch (name) {
            case 'ownerName':
                if (!value.trim()) error = 'Nama lengkap wajib diisi'
                else if (/\d/.test(value)) error = 'Tidak boleh ada angka'
                break
            case 'ownerEmail':
                if (!value) error = 'Email wajib diisi'
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Format email salah'
                else if (emailAvailable === false) error = 'Email sudah terdaftar'
                break
            case 'ownerPassword':
                if (!value) error = 'Kata sandi wajib diisi'
                else if (value.length < 8) error = 'Min 8 karakter'
                else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(value)) error = 'Huruf & angka'
                break
            case 'ownerPhone':
                if (!value) error = 'Nomor telepon wajib diisi'
                else if (phoneAvailable === false) error = 'Nomor telepon sudah terdaftar'
                break
            case 'businessName':
                if (!value) error = 'Nama restoran wajib diisi'
                else if (value.length < 3) error = 'Min 3 karakter'
                break
        }

        return error
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        let newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value

        // Auto-format phone number
        if (name === 'ownerPhone' && typeof newValue === 'string') {
            let cleaned = newValue.replace(/[^\d+]/g, '')
            if (cleaned.startsWith('0')) cleaned = '+62' + cleaned.substring(1)
            if (cleaned.startsWith('62')) cleaned = '+' + cleaned
            newValue = cleaned
        }

        setFormData(prev => ({ ...prev, [name]: newValue }))

        if (touched[name]) {
            const error = validateField(name, newValue)
            setErrors(prev => ({ ...prev, [name]: error || '' }))
            if (!error) {
                const newErrors = { ...errors }
                delete newErrors[name]
                setErrors(newErrors)
            }
        }

        // Auto-resize textarea for business description
        if (name === 'businessDescription' && descriptionTextareaRef.current) {
            const textarea = descriptionTextareaRef.current
            textarea.style.height = 'auto'
            textarea.style.height = `${textarea.scrollHeight}px`
        }
    }

    const handleBlur = (name: string) => {
        setTouched(prev => ({ ...prev, [name]: true }))
        const error = validateField(name, (formData as any)[name])
        if (error) setErrors(prev => ({ ...prev, [name]: error }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setGeneralError(null)

        // Validate all
        const newErrors: Record<string, string> = {}
        Object.keys(formData).forEach(key => {
            if (key === 'businessDescription' || key === 'primaryColor' || key === 'agreeToTerms') return
            const error = validateField(key, (formData as any)[key])
            if (error) newErrors[key] = error
        })

        // Check async validations
        if (!newErrors.ownerEmail) {
            const emailAvailable = await checkEmailAvailability(formData.ownerEmail)
            if (!emailAvailable) newErrors.ownerEmail = 'Email sudah terdaftar'
        }
        if (!newErrors.ownerPhone) {
            const phoneAvailable = await checkPhoneAvailability(formData.ownerPhone)
            if (!phoneAvailable) newErrors.ownerPhone = 'Nomor telepon sudah terdaftar'
        }

        // Validate slug
        if (!slug || slug.length < 3) {
            setSlugError('URL minimal 3 karakter')
            return
        }
        if (slugAvailable === false) {
            setSlugError('URL ini sudah digunakan')
            return
        }

        setErrors(newErrors)
        setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}))

        if (Object.keys(newErrors).length > 0) return
        if (!formData.agreeToTerms) {
            setGeneralError('Anda harus menyetujui syarat dan ketentuan')
            return
        }

        setLoading(true)

        try {
            const firstName = formData.ownerName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            const timestamp = Date.now().toString().slice(-4);
            const username = `${firstName}${timestamp}`;

            const result = await registerRestaurantOwner({
                ownerName: formData.ownerName,
                ownerEmail: formData.ownerEmail,
                ownerPassword: formData.ownerPassword,
                ownerPhone: formData.ownerPhone,
                username: username,
                businessName: formData.businessName,
                businessDescription: formData.businessDescription,
                businessEmail: formData.ownerEmail, // Use owner email for business initially
                primaryColor: formData.primaryColor,
                slug: slug // Pass the custom slug
            })

            if (result.success) {
                // Redirect to checkout page
                navigate(`/start/payment?tenantId=${result.tenantId}`)
            } else {
                setGeneralError(result.error || 'Pendaftaran gagal')
            }
        } catch (err: any) {
            setGeneralError(err.message || 'Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row font-sans text-[#1D1D1F] selection:bg-orange-100 selection:text-orange-900 bg-gray-50/50 overflow-hidden">
            {/* LEFT COLUMN: FORM */}
            <div className="w-full md:w-[45%] lg:w-[40%] bg-white h-screen flex flex-col shadow-2xl z-20 relative border-r border-gray-100">
                <div className="flex-1 overflow-y-auto py-8 px-8 scrollbar-hide">
                    <div className="w-full space-y-4 animate-fade-in-up pb-4">
                        {/* Header */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold tracking-widest text-orange-600 uppercase">Step 1 of 2</span>
                                <span className="text-[10px] font-medium text-gray-400">Payment Next</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
                                Buat Website Restoran
                            </h1>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Satu langkah mudah untuk memiliki website restoran instan dengan brand Anda sendiri.
                            </p>
                        </div>

                        {generalError && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-3 shadow-sm">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                {generalError}
                            </div>
                        )}

                        <form id="registration-form" onSubmit={handleSubmit} className="space-y-5">
                            {/* Owner Section */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4 relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
                                <div className="absolute -inset-[1px] border-l-4 border-orange-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <div className="p-1 bg-orange-50 rounded-md text-orange-600">
                                        <User className="w-3.5 h-3.5" />
                                    </div>
                                    Data Pemilik
                                </h3>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <InputField
                                            label="Nama Lengkap"
                                            name="ownerName"
                                            value={formData.ownerName}
                                            onChange={handleChange}
                                            onBlur={() => handleBlur('ownerName')}
                                            placeholder="Contoh: Budi Santoso"
                                            required
                                            error={errors.ownerName}
                                            touched={touched.ownerName}
                                            icon={User}
                                        />
                                        <InputField
                                            label="Email"
                                            name="ownerEmail"
                                            type="email"
                                            value={formData.ownerEmail}
                                            onChange={handleChange}
                                            onBlur={() => handleBlur('ownerEmail')}
                                            placeholder="nama@email.com"
                                            required
                                            error={errors.ownerEmail}
                                            touched={touched.ownerEmail}
                                            icon={Mail}
                                            rightElement={
                                                isCheckingEmail ? <Loader2 className="w-4 h-4 animate-spin text-orange-500" /> :
                                                    emailAvailable === true ? <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                                                        emailAvailable === false ? <XCircle className="w-4 h-4 text-red-500" /> : null
                                            }
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <InputField
                                            label="WhatsApp"
                                            name="ownerPhone"
                                            type="tel"
                                            value={formData.ownerPhone}
                                            onChange={handleChange}
                                            onBlur={() => handleBlur('ownerPhone')}
                                            placeholder="+62..."
                                            required
                                            error={errors.ownerPhone}
                                            touched={touched.ownerPhone}
                                            icon={Smartphone}
                                            rightElement={
                                                isCheckingPhone ? <Loader2 className="w-4 h-4 animate-spin text-orange-500" /> :
                                                    phoneAvailable === true ? <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                                                        phoneAvailable === false ? <XCircle className="w-4 h-4 text-red-500" /> : null
                                            }
                                        />
                                        <div className="space-y-1">
                                            <InputField
                                                label="Kata Sandi"
                                                name="ownerPassword"
                                                type="password"
                                                value={formData.ownerPassword}
                                                onChange={handleChange}
                                                onBlur={() => handleBlur('ownerPassword')}
                                                placeholder="••••••••"
                                                required
                                                minLength={8}
                                                error={errors.ownerPassword}
                                                touched={touched.ownerPassword}
                                                icon={Lock}
                                                tooltip="Minimal 8 karakter, kombinasi huruf dan angka"
                                            />
                                            {formData.ownerPassword && (
                                                <div className="ml-1">
                                                    <div className="flex gap-1 h-1 mb-1 overflow-hidden rounded-full bg-gray-100">
                                                        {[1, 2, 3].map((level) => {
                                                            const strength = (() => {
                                                                if (formData.ownerPassword.length < 8) return 1
                                                                if (!/\d/.test(formData.ownerPassword) || !/[a-zA-Z]/.test(formData.ownerPassword)) return 2
                                                                return 3
                                                            })()

                                                            let color = 'bg-transparent'
                                                            if (strength >= level) {
                                                                if (strength === 1) color = 'bg-red-500'
                                                                if (strength === 2) color = 'bg-yellow-500'
                                                                if (strength === 3) color = 'bg-green-500'
                                                            }

                                                            return (
                                                                <div key={level} className={`flex-1 transition-all duration-500 ${color}`} />
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Business Section */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4 relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
                                <div className="absolute -inset-[1px] border-l-4 border-blue-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <div className="p-1 bg-blue-50 rounded-md text-blue-600">
                                        <Store className="w-3.5 h-3.5" />
                                    </div>
                                    Data Restoran
                                </h3>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <InputField
                                            label="Nama Restoran"
                                            name="businessName"
                                            value={formData.businessName}
                                            onChange={handleChange}
                                            onBlur={() => handleBlur('businessName')}
                                            placeholder="Contoh: Kopi Kenangan"
                                            required
                                            error={errors.businessName}
                                            touched={touched.businessName}
                                            icon={Store}
                                            focusColor="blue"
                                        />

                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-1.5 ml-1">
                                                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                                                    Link Website
                                                </label>
                                                <div className="group/tooltip relative">
                                                    <Info className="w-3 h-3 text-gray-400 cursor-help" />
                                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                                                        Anda dapat menggunakan domain sendiri (contoh.com) nanti
                                                        <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-900"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="relative flex items-center">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                    <LinkIcon className="w-4 h-4" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={slug}
                                                    onChange={(e) => {
                                                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                                                        setIsSlugTouched(true)
                                                    }}
                                                    className={`block w-full pl-8 pr-24 py-2.5 bg-gray-50/50 hover:bg-white border-[1.5px] rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 ${slugError
                                                        ? 'border-red-300 focus:border-red-500 bg-red-50/30'
                                                        : 'border-gray-200 focus:border-blue-500'
                                                        }`}
                                                    placeholder="nama-restoran"
                                                    style={{ outline: '0', outlineOffset: '0', boxShadow: 'none' }}
                                                />
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                    <span className="text-gray-400 text-[10px] font-medium hidden sm:inline bg-gray-100 px-1.5 py-0.5 rounded">.careos.cloud</span>
                                                    {isCheckingSlug ? <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> :
                                                        slugAvailable === true ? <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                                                            slugAvailable === false ? <XCircle className="w-4 h-4 text-red-500" /> :
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newSlug = generateSlugFromBusinessName(formData.businessName)
                                                                        setSlug(newSlug)
                                                                        setIsSlugTouched(true)
                                                                    }}
                                                                    className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                                                                    title="Regenerate URL"
                                                                >
                                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                                </button>
                                                    }
                                                </div>
                                            </div>
                                            {slugError && (
                                                <p className="text-[11px] text-red-500 font-medium ml-1 animate-fade-in flex items-center gap-1.5">
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    {slugError}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide ml-1">
                                            Warna Brand
                                        </label>
                                        <div className="flex flex-wrap gap-2.5">
                                            {COLOR_PRESETS.map((preset) => (
                                                <button
                                                    key={preset.name}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, primaryColor: preset.value }))}
                                                    className={`w-7 h-7 rounded-full border-2 transition-all duration-200 shadow-sm hover:scale-110 ${formData.primaryColor === preset.value
                                                        ? 'border-blue-600 scale-110 ring-2 ring-blue-200'
                                                        : 'border-transparent hover:border-gray-200'
                                                        }`}
                                                    style={{ backgroundColor: preset.value }}
                                                    title={preset.name}
                                                />
                                            ))}
                                            <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-gray-200 hover:border-gray-400 transition-colors cursor-pointer group">
                                                <input
                                                    type="color"
                                                    name="primaryColor"
                                                    value={formData.primaryColor}
                                                    onChange={handleChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-white group-hover:bg-gray-50">
                                                    <Palette className="w-3.5 h-3.5 text-gray-500" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide ml-1">
                                            Deskripsi Singkat
                                        </label>
                                        <textarea
                                            ref={descriptionTextareaRef}
                                            name="businessDescription"
                                            value={formData.businessDescription}
                                            onChange={handleChange}
                                            className="block w-full px-3 py-2.5 bg-gray-50/50 hover:bg-white border-[1.5px] border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none overflow-hidden"
                                            placeholder="Ceritakan sedikit tentang restoran Anda..."
                                            style={{ outline: '0', outlineOffset: '0', boxShadow: 'none', minHeight: '56px' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="pt-2">
                                <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            name="agreeToTerms"
                                            checked={formData.agreeToTerms}
                                            onChange={handleChange}

                                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border-2 border-gray-300 transition-all checked:border-orange-500 checked:bg-orange-500 hover:border-orange-400"
                                        />
                                        <Check className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                                    </div>
                                    <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors leading-relaxed">
                                        Dengan membuat akun, saya menyetujui <button type="button" onClick={(e) => { e.preventDefault(); setShowTerms(true); }} className="text-orange-600 hover:underline font-bold">Syarat & Ketentuan</button> serta <button type="button" onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }} className="text-orange-600 hover:underline font-bold">Kebijakan Privasi</button> CareOS.
                                    </span>
                                </label>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sticky Footer CTA */}
                <div className="p-4 md:px-8 md:py-6 border-t border-gray-100 bg-white/90 backdrop-blur-md z-30">
                    <div className="w-full flex justify-end">
                        <button
                            type="submit"
                            form="registration-form"
                            disabled={loading || !formData.agreeToTerms}
                            className="bg-orange-600 text-white py-3.5 px-6 rounded-xl font-bold text-sm hover:bg-orange-700 transition-all duration-300 shadow-xl shadow-orange-500/20 hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    Buat Website
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: LIVE PREVIEW */}
            <div className="hidden md:block w-[55%] lg:w-[60%] bg-gray-100 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                <div className="absolute inset-0 flex items-center justify-center p-8 lg:p-12">
                    <div className={`w-full ${previewDevice === 'mobile' ? 'max-w-[320px]' : 'max-w-4xl'} bg-white rounded-[32px] shadow-2xl overflow-hidden border-[8px] border-gray-900/5 transform transition-all duration-500 scale-90 hover:scale-[0.92] flex flex-col h-[85vh]`}>
                        {/* Browser Bar */}
                        <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-3 shrink-0">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                            </div>
                            <div className="flex-1 bg-white border border-gray-200 rounded-md px-3 py-1.5 text-[10px] text-gray-500 font-mono text-center truncate shadow-sm flex items-center justify-center gap-1.5">
                                <Lock className="w-2.5 h-2.5 text-green-500" />
                                {slug ? `${slug}.careos.cloud` : 'your-restaurant.careos.cloud'}
                            </div>
                        </div>

                        {/* Preview Content */}
                        <div className="relative flex-1 overflow-y-auto scrollbar-hide flex flex-col">
                            {/* Hero Section */}
                            <div className="relative h-64 flex flex-col items-center justify-center text-center p-6 text-white transition-colors duration-500 shrink-0"
                                style={{ backgroundColor: formData.primaryColor }}>
                                <div className="absolute inset-0 bg-black/10"></div>
                                <div className="relative z-10 space-y-4">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold mx-auto border-2 border-white/30 shadow-lg transition-all duration-300">
                                        {formData.businessName ? formData.businessName.charAt(0).toUpperCase() : <Store className="w-8 h-8" />}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold leading-tight drop-shadow-md transition-all duration-300">
                                            {formData.businessName || "Nama Restoran"}
                                        </h2>
                                        <p className="text-white/90 text-sm mt-2 max-w-[200px] mx-auto line-clamp-2 drop-shadow-sm transition-all duration-300">
                                            {formData.businessDescription || "Deskripsi restoran Anda akan muncul di sini."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Preview */}
                            <div className="flex-1 bg-white p-6 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-gray-900">Menu Favorit</h3>
                                    <span className="text-xs text-gray-400 font-medium cursor-pointer hover:text-gray-600">Lihat Semua</span>
                                </div>

                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex gap-3 group cursor-pointer">
                                            <div className="w-16 h-16 bg-gray-100 rounded-xl shrink-0 overflow-hidden">
                                                <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                                <div className="h-3 bg-gray-50 rounded w-1/2"></div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shadow-sm transform group-hover:scale-110 transition-transform"
                                                        style={{ backgroundColor: formData.primaryColor }}>+</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button className="w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                                    style={{ backgroundColor: formData.primaryColor, boxShadow: `0 8px 20px -4px ${formData.primaryColor}60` }}>
                                    Lihat Menu Lengkap
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Floating Tools */}
                    <div className="absolute top-8 right-8 flex flex-col gap-3">
                        {/* Device Toggle */}
                        <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-white/50 flex flex-col gap-1">
                            <button
                                onClick={() => setPreviewDevice('desktop')}
                                className={`p-2 rounded-xl transition-all ${previewDevice === 'desktop' ? 'bg-gray-100 text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
                                title="Desktop View"
                            >
                                <Monitor className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPreviewDevice('mobile')}
                                className={`p-2 rounded-xl transition-all ${previewDevice === 'mobile' ? 'bg-gray-100 text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
                                title="Mobile View"
                            >
                                <MobileIcon className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Template Selector */}
                        <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-white/50 flex flex-col gap-1">
                            <div className="p-2 rounded-xl bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-orange-50 hover:text-orange-500 transition-colors" title="Classic">
                                <LayoutTemplate className="w-4 h-4" />
                            </div>
                            <div className="p-2 rounded-xl flex items-center justify-center cursor-pointer hover:bg-orange-50 hover:text-orange-500 transition-colors text-gray-400" title="Modern">
                                <Store className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Terms Modal */}
            <Modal
                isOpen={showTerms}
                onClose={() => setShowTerms(false)}
                title="Syarat & Ketentuan"
                mobileAs="bottom-sheet"
            >
                <div className="space-y-4 text-sm text-gray-600 max-h-[60vh] overflow-y-auto pr-2">
                    <p>Selamat datang di CareOS. Dengan mendaftar dan menggunakan layanan kami, Anda menyetujui syarat dan ketentuan berikut:</p>

                    <h4 className="font-bold text-gray-900">1. Pendaftaran Akun</h4>
                    <p>Anda wajib memberikan informasi yang akurat, lengkap, dan terbaru saat mendaftar. Anda bertanggung jawab penuh atas keamanan akun dan kata sandi Anda.</p>

                    <h4 className="font-bold text-gray-900">2. Penggunaan Layanan</h4>
                    <p>Layanan kami ditujukan untuk membantu operasional restoran Anda. Anda dilarang menggunakan layanan untuk tujuan ilegal atau yang melanggar hak pihak lain.</p>

                    <h4 className="font-bold text-gray-900">3. Pembayaran dan Berlangganan</h4>
                    <p>Beberapa fitur mungkin memerlukan pembayaran biaya berlangganan. Biaya ini tidak dapat dikembalikan kecuali dinyatakan lain dalam kebijakan pengembalian dana kami.</p>

                    <h4 className="font-bold text-gray-900">4. Hak Kekayaan Intelektual</h4>
                    <p>Seluruh konten, desain, dan teknologi dalam CareOS adalah milik kami atau pemberi lisensi kami. Anda diberikan lisensi terbatas untuk menggunakan layanan sesuai ketentuan.</p>

                    <h4 className="font-bold text-gray-900">5. Batasan Tanggung Jawab</h4>
                    <p>Kami tidak bertanggung jawab atas kerugian tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan layanan kami.</p>

                    <h4 className="font-bold text-gray-900">6. Perubahan Syarat</h4>
                    <p>Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan melalui layanan atau email.</p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={() => setShowTerms(false)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                    >
                        Saya Mengerti
                    </button>
                </div>
            </Modal>

            {/* Privacy Modal */}
            <Modal
                isOpen={showPrivacy}
                onClose={() => setShowPrivacy(false)}
                title="Kebijakan Privasi"
                mobileAs="bottom-sheet"
            >
                <div className="space-y-4 text-sm text-gray-600 max-h-[60vh] overflow-y-auto pr-2">
                    <p>Privasi Anda sangat penting bagi kami. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda.</p>

                    <h4 className="font-bold text-gray-900">1. Informasi yang Kami Kumpulkan</h4>
                    <p>Kami mengumpulkan informasi yang Anda berikan saat mendaftar (seperti nama, email, nomor telepon) dan data operasional restoran yang Anda masukkan ke dalam sistem.</p>

                    <h4 className="font-bold text-gray-900">2. Penggunaan Informasi</h4>
                    <p>Informasi digunakan untuk menyediakan, memelihara, dan meningkatkan layanan kami, serta untuk komunikasi terkait akun dan layanan.</p>

                    <h4 className="font-bold text-gray-900">3. Keamanan Data</h4>
                    <p>Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang wajar untuk melindungi data Anda dari akses yang tidak sah.</p>

                    <h4 className="font-bold text-gray-900">4. Berbagi Informasi</h4>
                    <p>Kami tidak menjual data pribadi Anda kepada pihak ketiga. Kami hanya membagikan informasi jika diwajibkan oleh hukum atau untuk penyediaan layanan (misalnya, pemrosesan pembayaran).</p>

                    <h4 className="font-bold text-gray-900">5. Hak Anda</h4>
                    <p>Anda memiliki hak untuk mengakses, memperbaiki, atau menghapus informasi pribadi Anda yang tersimpan di sistem kami.</p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={() => setShowPrivacy(false)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                    >
                        Saya Mengerti
                    </button>
                </div>
            </Modal>
        </div>
    )
}

export default RestaurantRegisterPage
