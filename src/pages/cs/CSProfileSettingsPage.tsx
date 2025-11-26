import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Camera, Save, X, Pencil, Upload, Trash2, Loader2, Check, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { updateUser, User as UserType } from '../../data/mockDB';
import EmailVerificationModal from '../../components/EmailVerificationModal';

const CSProfileSettingsPage: React.FC = () => {
    const { user, updateUserData, changeEmail } = useAuth();
    const { showToast } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<UserType>>({});
    const [originalData, setOriginalData] = useState<Partial<UserType>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Email verification states
    const [isEmailVerificationModalOpen, setIsEmailVerificationModalOpen] = useState(false);
    const [pendingNewEmail, setPendingNewEmail] = useState('');
    const [originalEmail, setOriginalEmail] = useState('');
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

    useEffect(() => {
        if (user) {
            const userData = {
                name: user.name || '',
                username: user.username || '',
                email: user.email || '',
                phone: user.phone || '',
                birthdate: user.birthdate || '',
                avatarUrl: user.avatarUrl
            };
            setFormData(userData);
            setOriginalData(userData);
            setAvatarPreview(user.avatarUrl || null);
        }
    }, [user]);

    if (!user) return null;

    const handleEditClick = () => {
        setFormData(originalData);
        setOriginalEmail(user.email || '');
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(originalData);
        setAvatarPreview(originalData.avatarUrl || null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);

        // Just save profile fields, email verification is handled separately
        try {
            const updatedUser = await updateUser(user.id, formData);
            if (updatedUser) {
                updateUserData(updatedUser);
                setOriginalData(formData);
                setIsEditing(false);
                showToast('Profil berhasil diperbarui', 'success');
            }
        } catch (error) {
            showToast('Gagal memperbarui profil', 'error');
        }

        setLoading(false);
    };

    const handleVerifyEmail = async () => {
        if (!formData.email) return;

        setIsVerifyingEmail(true);
        const result = await changeEmail(formData.email);
        setIsVerifyingEmail(false);

        if (result.success) {
            setPendingNewEmail(formData.email);
            setIsEmailVerificationModalOpen(true);
            showToast('Email konfirmasi telah dikirim', 'info');
        } else {
            showToast(result.error || 'Gagal mengubah email', 'error');
            setFormData(prev => ({ ...prev, email: originalEmail }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarClick = () => {
        if (isEditing) {
            fileInputRef.current?.click();
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
                setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAvatar = () => {
        setAvatarPreview(null);
        setFormData(prev => ({ ...prev, avatarUrl: null }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const finalAvatarSrc = avatarPreview ?? user.avatarUrl;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profil Saya</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Kelola informasi profil dan akun Anda
                </p>
            </div>

            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Profile Header / Cover */}
                <div className="h-32 bg-gradient-to-r from-blue-400 to-blue-600 relative">
                    <div className="absolute -bottom-12 left-8">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 p-1">
                                <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                    {finalAvatarSrc ? (
                                        <img src={finalAvatarSrc} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-10 h-10 text-gray-400" />
                                    )}
                                </div>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                            {isEditing && (
                                <button
                                    onClick={handleAvatarClick}
                                    type="button"
                                    className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Content */}
                <div className="pt-16 pb-8 px-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {user.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    Customer Service
                                </span>
                            </div>
                        </div>
                        {!isEditing && (
                            <button
                                onClick={handleEditClick}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                                <Pencil className="w-4 h-4" />
                                Edit Profil
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleSave} className="max-w-2xl space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nama Lengkap
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nomor Telepon
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tanggal Lahir
                                    </label>
                                    <input
                                        type="date"
                                        name="birthdate"
                                        value={formData.birthdate || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email || ''}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${formData.email !== originalEmail ? 'pr-28' : ''}`}
                                        />
                                        {formData.email !== originalEmail && (
                                            <button
                                                type="button"
                                                onClick={handleVerifyEmail}
                                                disabled={isVerifyingEmail || loading}
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
                                    {formData.email !== originalEmail && (
                                        <p className="mt-1 text-xs text-gray-500">Klik tombol Verifikasi untuk mengonfirmasi email baru</p>
                                    )}
                                </div>
                            </div>

                            {avatarPreview && (
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handleRemoveAvatar}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={16} /> Hapus Foto
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Simpan Perubahan
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                    <Mail className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                        Email Address
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                    <Phone className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                        Phone Number
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {user.phone || 'Belum diatur'}
                                    </p>
                                </div>
                            </div>

                            {user.username && (
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                        <User className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                            Username
                                        </p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {user.username}
                                        </p>
                                    </div>
                                </div>
                            )}
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
                    if (!pendingNewEmail) return;
                    const result = await changeEmail(pendingNewEmail);
                    if (result.success) {
                        showToast('Email konfirmasi telah dikirim ulang', 'success');
                    } else {
                        showToast(result.error || 'Gagal mengirim ulang email', 'error');
                    }
                }}
            />
        </div>
    );
};

export default CSProfileSettingsPage;
