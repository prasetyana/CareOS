import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Globe, Save, Loader2, Clock, Navigation, Pencil, CheckCircle } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import { useToast } from '../../contexts/ToastContext';
import { updateTenantProfile } from '../../services/tenantService';
import EmailVerificationModal from '../../components/EmailVerificationModal';

const ProfilRestoran: React.FC = () => {
    const { tenant, refreshTenant } = useTenant();
    const { addToast } = useToast();

    // Form States
    const [businessName, setBusinessName] = useState('');
    const [phone, setPhone] = useState('');
    const [fullDescription, setFullDescription] = useState('');
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [fullAddress, setFullAddress] = useState('');
    const [city, setCity] = useState('');
    const [province, setProvince] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [operatingHours, setOperatingHours] = useState<any>({
        monday: { isOpen: true, openTime: '10:00', closeTime: '22:00' },
        tuesday: { isOpen: true, openTime: '10:00', closeTime: '22:00' },
        wednesday: { isOpen: true, openTime: '10:00', closeTime: '22:00' },
        thursday: { isOpen: true, openTime: '10:00', closeTime: '22:00' },
        friday: { isOpen: true, openTime: '10:00', closeTime: '23:00' },
        saturday: { isOpen: true, openTime: '10:00', closeTime: '23:00' },
        sunday: { isOpen: true, openTime: '10:00', closeTime: '22:00' },
    });

    // Images
    const [logoPreview, setLogoPreview] = useState(tenant?.logoUrl || '');
    const [logoUrl, setLogoUrl] = useState(tenant?.logoUrl || '');

    // Email Verification States
    const [originalEmail, setOriginalEmail] = useState('');
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
    const [isEmailVerificationModalOpen, setIsEmailVerificationModalOpen] = useState(false);
    const [pendingNewEmail, setPendingNewEmail] = useState('');

    // Saving States
    const [isSavingBasic, setIsSavingBasic] = useState(false);
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const [isSavingHours, setIsSavingHours] = useState(false);

    // Editing States
    const [isEditingBasic, setIsEditingBasic] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [isEditingHours, setIsEditingHours] = useState(false);

    useEffect(() => {
        if (tenant) {
            setBusinessName(tenant.businessName || '');
            setLogoPreview(tenant.logoUrl || '');
            setLogoUrl(tenant.logoUrl || '');
            setFullAddress(tenant.address || '');
            setCity(tenant.city || '');
            setProvince(tenant.province || '');
            setPostalCode(tenant.postalCode || '');
            setLatitude(tenant.latitude || '-6.2088');
            setLongitude(tenant.longitude || '106.8456');
            if (tenant.operatingHours) {
                setOperatingHours(tenant.operatingHours);
            }
            // Initialize email states
            setEmail(tenant.email || '');
            setOriginalEmail(tenant.email || '');
            setPhone(tenant.phone || '');
            setWebsite(tenant.website || '');
            setFullDescription(tenant.description || '');
        }
    }, [tenant]);

    const handleVerifyEmail = async () => {
        if (!email) return;

        setIsVerifyingEmail(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsVerifyingEmail(false);

        setPendingNewEmail(email);
        setIsEmailVerificationModalOpen(true);
        addToast('Email konfirmasi telah dikirim', 'info');
    };

    const dayNames: { [key: string]: string } = {
        monday: 'Senin',
        tuesday: 'Selasa',
        wednesday: 'Rabu',
        thursday: 'Kamis',
        friday: 'Jumat',
        saturday: 'Sabtu',
        sunday: 'Minggu'
    };

    const updateOperatingHours = (day: string, field: 'isOpen' | 'openTime' | 'closeTime', value: boolean | string) => {
        setOperatingHours((prev: any) => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value,
            },
        }));
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude.toFixed(6));
                    setLongitude(position.coords.longitude.toFixed(6));
                    addToast('Lokasi berhasil dideteksi!', 'success');
                },
                (error) => {
                    addToast('Gagal mendeteksi lokasi. Pastikan izin lokasi diaktifkan.', 'error');
                }
            );
        } else {
            addToast('Browser tidak mendukung geolocation', 'error');
        }
    };

    const handleSaveBasic = async () => {
        if (!tenant) return;

        console.log('Starting save basic info...');
        // Optimistic update: Switch to view mode immediately
        setIsEditingBasic(false);
        setIsSavingBasic(true);

        try {
            // Add a minimum delay of 800ms to prevent UI flickering and ensure user sees the state change
            const minDelay = new Promise(resolve => setTimeout(resolve, 800));

            const [result] = await Promise.all([
                updateTenantProfile(tenant.id, {
                    businessName,
                    phone,
                    description: fullDescription,
                    email,
                    website,
                    logoUrl
                }),
                minDelay
            ]);

            console.log('Save result:', result);

            if (result.success) {
                addToast('Informasi dasar berhasil disimpan', 'success');
                // Refresh tenant data to reflect changes
                await refreshTenant();
            } else {
                console.error('Save failed:', result.error);
                // Revert to edit mode if save failed
                setIsEditingBasic(true);
                addToast(result.error || 'Gagal menyimpan perubahan', 'error');
            }
        } catch (error) {
            console.error('Save exception:', error);
            // Revert to edit mode if error occurred
            setIsEditingBasic(true);
            addToast('Terjadi kesalahan saat menyimpan', 'error');
        } finally {
            setIsSavingBasic(false);
        }
    };

    const handleSaveAddress = async () => {
        setIsSavingAddress(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSavingAddress(false);
        setIsEditingAddress(false);
        addToast('Alamat berhasil disimpan!', 'success');
    };

    const handleSaveHours = async () => {
        if (!tenant) return;

        console.log('Starting save operating hours...');
        // Optimistic update
        setIsEditingHours(false);
        setIsSavingHours(true);

        try {
            // Add a minimum delay of 800ms
            const minDelay = new Promise(resolve => setTimeout(resolve, 800));

            const [result] = await Promise.all([
                updateTenantProfile(tenant.id, {
                    operatingHours
                }),
                minDelay
            ]);

            console.log('Save hours result:', result);

            if (result.success) {
                addToast('Jam operasional berhasil disimpan!', 'success');
                await refreshTenant();
            } else {
                console.error('Save hours failed:', result.error);
                setIsEditingHours(true);
                addToast(result.error || 'Gagal menyimpan jam operasional', 'error');
            }
        } catch (error) {
            console.error('Save hours exception:', error);
            setIsEditingHours(true);
            addToast('Terjadi kesalahan saat menyimpan jam operasional', 'error');
        } finally {
            setIsSavingHours(false);
        }
    };

    if (!tenant) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profil Restoran</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Kelola informasi publik dan identitas restoran Anda
                </p>
            </div>

            {/* Main Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Cover Image */}
                <div className="h-32 bg-gradient-to-r from-blue-500 to-cyan-400 relative">
                    <div className="absolute -bottom-12 left-8">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-xl bg-white dark:bg-gray-800 p-1 shadow-sm">
                                <div className="w-full h-full rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 className="w-10 h-10 text-gray-400" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Content */}
                <div className="pt-16 pb-8 px-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {businessName || 'Nama Restoran'}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    <Building2 className="w-3 h-3" />
                                    Utama
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    • {city || 'Lokasi belum diatur'}
                                </span>
                            </div>
                        </div>
                        {!isEditingBasic && (
                            <button
                                onClick={() => setIsEditingBasic(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                                <Pencil className="w-4 h-4" />
                                Edit Profil
                            </button>
                        )}
                    </div>

                    {isEditingBasic ? (
                        <div className="space-y-6 max-w-4xl">
                            {/* Edit Form */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nama Restoran *
                                    </label>
                                    <input
                                        type="text"
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="Contoh: Restoran Enak"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nomor Telepon *
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="+62 812-3456-7890"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Deskripsi Restoran
                                    </label>
                                    <textarea
                                        value={fullDescription}
                                        onChange={(e) => setFullDescription(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all"
                                        placeholder="Ceritakan tentang restoran Anda..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${email !== originalEmail ? 'pr-28' : ''}`}
                                            placeholder="info@restoran.com"
                                        />
                                        {email !== originalEmail && (
                                            <button
                                                type="button"
                                                onClick={handleVerifyEmail}
                                                disabled={isVerifyingEmail}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
                                            >
                                                {isVerifyingEmail ? (
                                                    <>
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                        Verifikasi
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="w-3 h-3" />
                                                        Verifikasi
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                    {email !== originalEmail && (
                                        <p className="mt-1 text-xs text-gray-500">Klik tombol Verifikasi untuk mengonfirmasi email baru</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Website
                                    </label>
                                    <input
                                        type="url"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="https://restoran.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Logo URL
                                    </label>
                                    <input
                                        type="url"
                                        value={logoUrl}
                                        onChange={(e) => {
                                            setLogoUrl(e.target.value);
                                            setLogoPreview(e.target.value);
                                        }}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="https://example.com/logo.png"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                <button
                                    type="button"
                                    onClick={() => setIsEditingBasic(false)}
                                    className="px-6 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSaveBasic}
                                    disabled={isSavingBasic}
                                    className="px-6 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSavingBasic ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Simpan Perubahan
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* View Mode */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                    <Phone className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Nomor Telepon</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{phone || 'Belum diatur'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                    <Mail className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Email</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{email || 'Belum diatur'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                    <Globe className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Website</p>
                                    <a href={website} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline">{website || 'Belum diatur'}</a>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                    <MapPin className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Lokasi</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{city || 'Belum diatur'}</p>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>

            {/* Address Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Alamat & Lokasi</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Kelola alamat lengkap dan titik lokasi peta
                            </p>
                        </div>
                    </div>
                    {!isEditingAddress && (
                        <button
                            onClick={() => setIsEditingAddress(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            title="Edit Alamat"
                        >
                            <Pencil className="w-4 h-4" />
                            Edit Alamat
                        </button>
                    )}
                </div>

                <div className="space-y-6">
                    {isEditingAddress ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Alamat Lengkap
                                </label>
                                <textarea
                                    value={fullAddress}
                                    onChange={(e) => setFullAddress(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all"
                                    placeholder="Jl. Contoh No. 123, RT/RW 01/02"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Kota
                                    </label>
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="Jakarta"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Provinsi
                                    </label>
                                    <input
                                        type="text"
                                        value={province}
                                        onChange={(e) => setProvince(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="DKI Jakarta"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Kode Pos
                                    </label>
                                    <input
                                        type="text"
                                        value={postalCode}
                                        onChange={(e) => setPostalCode(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="12345"
                                    />
                                </div>
                            </div>

                            {/* Location Coordinates */}
                            <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Navigation className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            Koordinat Lokasi
                                        </h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            Untuk akurasi pengiriman
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={getCurrentLocation}
                                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm"
                                    >
                                        <Navigation className="w-3 h-3" />
                                        Deteksi
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Latitude</label>
                                        <input
                                            type="text"
                                            value={latitude}
                                            onChange={(e) => setLatitude(e.target.value)}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-mono"
                                            placeholder="-6.2088"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Longitude</label>
                                        <input
                                            type="text"
                                            value={longitude}
                                            onChange={(e) => setLongitude(e.target.value)}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-mono"
                                            placeholder="106.8456"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                <button
                                    type="button"
                                    onClick={() => setIsEditingAddress(false)}
                                    className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSaveAddress}
                                    disabled={isSavingAddress}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSavingAddress ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Simpan
                                </button>
                            </div>
                        </>
                    ) : (
                        /* View Mode */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Alamat Lengkap</h4>
                                <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
                                    {fullAddress || 'Belum diatur'}
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Detail Wilayah</h4>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {[city, province, postalCode].filter(Boolean).join(', ') || 'Belum diatur'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Koordinat</h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white font-mono bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 rounded-lg w-fit">
                                        <Navigation className="w-3 h-3 text-blue-500" />
                                        {latitude && longitude ? `${latitude}, ${longitude}` : 'Belum diatur'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Operating Hours Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Jam Operasional</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Atur jadwal buka dan tutup restoran
                            </p>
                        </div>
                    </div>
                    {!isEditingHours && (
                        <button
                            onClick={() => setIsEditingHours(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            title="Edit Jam Operasional"
                        >
                            <Pencil className="w-4 h-4" />
                            Edit Jam
                        </button>
                    )}
                </div>

                <div className="space-y-2.5">
                    {isEditingHours ? (
                        <>
                            {Object.keys(operatingHours).map(day => (
                                <div key={day} className="flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <div className="w-20">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{dayNames[day]}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={operatingHours[day].isOpen}
                                            onChange={(e) => updateOperatingHours(day, 'isOpen', e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                                        />
                                        <span className="text-xs text-gray-600 dark:text-gray-400">Buka</span>
                                    </div>
                                    {operatingHours[day].isOpen && (
                                        <div className="flex items-center gap-2 flex-1">
                                            <input
                                                type="time"
                                                value={operatingHours[day].openTime}
                                                onChange={(e) => updateOperatingHours(day, 'openTime', e.target.value)}
                                                className="px-2.5 py-1.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                                            />
                                            <span className="text-gray-400 text-xs">-</span>
                                            <input
                                                type="time"
                                                value={operatingHours[day].closeTime}
                                                onChange={(e) => updateOperatingHours(day, 'closeTime', e.target.value)}
                                                className="px-2.5 py-1.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                                            />
                                        </div>
                                    )}
                                    {!operatingHours[day].isOpen && (
                                        <span className="text-xs text-gray-500 dark:text-gray-500 flex-1">Tutup</span>
                                    )}
                                </div>
                            ))}

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                <button
                                    type="button"
                                    onClick={() => setIsEditingHours(false)}
                                    className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSaveHours}
                                    disabled={isSavingHours}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSavingHours ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Simpan
                                </button>
                            </div>
                        </>
                    ) : (
                        /* View Mode */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.keys(operatingHours).map(day => (
                                <div key={day} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{dayNames[day]}</span>
                                    {operatingHours[day].isOpen ? (
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {operatingHours[day].openTime} - {operatingHours[day].closeTime}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-gray-500 dark:text-gray-500">Tutup</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>


            {/* Email Verification Modal */}
            <EmailVerificationModal
                isOpen={isEmailVerificationModalOpen}
                onClose={() => setIsEmailVerificationModalOpen(false)}
                newEmail={pendingNewEmail}
                onResendConfirmation={async () => {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    addToast('Email konfirmasi dikirim ulang', 'success');
                }}
            />
        </div>
    );
};

export default ProfilRestoran;
