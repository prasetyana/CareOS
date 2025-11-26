import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Shield, Camera, Save, X, Pencil, Lock, Key, Activity, Calendar, Clock, Monitor, MapPin, Eye, EyeOff, CheckCircle, Loader2, Download, Filter, ChevronDown, AlertCircle, CheckCircle2, XCircle, Smartphone, Globe } from 'lucide-react';
import { UAParser } from 'ua-parser-js';
import { useToast } from '../../contexts/ToastContext';

import { getOwnerProfile, updateOwnerProfile, UserProfile, fetchActivityLogs, logActivity, ActivityLog, updateUserPassword } from '../../services/tenantService';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import EmailVerificationModal from '../../components/EmailVerificationModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import FloatingLabelInput from '../../components/FloatingLabelInput';

const AkunPemilik: React.FC = () => {
    const { showToast } = useToast();
    const { changeEmail, refreshProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [formData, setFormData] = useState<Partial<UserProfile>>({});
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [totalLogs, setTotalLogs] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);
    const [filterAction, setFilterAction] = useState<string>('all');
    const [filterDate, setFilterDate] = useState<string>('all');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Email verification states
    const [isEmailVerificationModalOpen, setIsEmailVerificationModalOpen] = useState(false);
    const [pendingNewEmail, setPendingNewEmail] = useState('');
    const [originalEmail, setOriginalEmail] = useState('');
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

    // Password change form
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // 2FA confirmation modal
    const [show2FAConfirmation, setShow2FAConfirmation] = useState(false);
    const [pending2FAStatus, setPending2FAStatus] = useState(false);

    // Load owner profile and activity logs
    // Load owner profile
    useEffect(() => {
        loadOwnerData();
    }, []);

    // Load logs when profile is loaded or filters change
    useEffect(() => {
        if (profile) {
            loadLogs(1, false);
        }
    }, [profile?.id, filterAction, filterDate]);

    const loadOwnerData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const ownerData = await getOwnerProfile(user.id);
                if (ownerData) {
                    setProfile(ownerData);
                    setFormData(ownerData);
                    setAvatarPreview(ownerData.avatar_url || null);
                }
            }
        } catch (error) {
            showToast('Gagal memuat data profil', 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadLogs = async (pageNum: number, isLoadMore: boolean = false) => {
        if (!profile) return;

        setIsLoadingLogs(true);
        try {
            let startDate: Date | undefined;
            const now = new Date();

            if (filterDate === 'today') {
                startDate = new Date(now.setHours(0, 0, 0, 0));
            } else if (filterDate === 'week') {
                startDate = new Date(now.setDate(now.getDate() - 7));
            } else if (filterDate === 'month') {
                startDate = new Date(now.setMonth(now.getMonth() - 1));
            }

            const { data, count } = await fetchActivityLogs(
                profile.id,
                5,
                (pageNum - 1) * 5,
                {
                    action: filterAction !== 'all' ? filterAction : undefined,
                    startDate
                }
            );

            if (isLoadMore) {
                setActivityLogs(prev => [...prev, ...data]);
            } else {
                setActivityLogs(data);
            }
            setTotalLogs(count);
            setPage(pageNum);
        } catch (error) {
            console.error('Error loading logs:', error);
            showToast('Gagal memuat riwayat aktivitas', 'error');
        } finally {
            setIsLoadingLogs(false);
        }
    };

    const handleLoadMore = () => {
        loadLogs(page + 1, true);
    };

    const formatDevice = (userAgent?: string) => {
        if (!userAgent) return 'Unknown Device';
        const parser = new UAParser(userAgent);
        const browser = parser.getBrowser();
        const os = parser.getOS();
        const device = parser.getDevice();

        const deviceName = device.model ? `${device.vendor || ''} ${device.model}` : 'Desktop';
        return `${browser.name || 'Browser'} on ${os.name || 'OS'} (${deviceName})`;
    };

    const handleExport = () => {
        if (activityLogs.length === 0) return;

        const headers = ['Date', 'Action', 'Description', 'Status', 'Severity', 'IP Address', 'Device', 'Location'];
        const csvContent = [
            headers.join(','),
            ...activityLogs.map(log => [
                new Date(log.created_at).toLocaleString(),
                log.action,
                `"${log.description}"`,
                log.status || 'success',
                log.severity || 'info',
                log.ip_address || '',
                `"${formatDevice(log.device)}"`,
                log.location || ''
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handleEditClick = () => {
        setFormData(profile || {});
        setOriginalEmail(profile?.email || '');
        setIsEditing(true);
    };

    const handleRemoveAvatar = async () => {
        setAvatarPreview(null);
        setFormData(prev => ({ ...prev, avatar_url: null }));

        // Auto-save avatar removal and log activity
        if (profile) {
            const result = await updateOwnerProfile(profile.id, { avatar_url: null });
            if (result.success) {
                setProfile(prev => prev ? { ...prev, avatar_url: null } : null);
                showToast('Foto profil berhasil dihapus', 'success');

                // Log the activity
                await logActivity({
                    userId: profile.id,
                    action: 'avatar_remove',
                    description: 'Removed profile picture',
                    severity: 'low',
                    status: 'success'
                });

                // Reload activity logs
                loadOwnerData();
            }
        }
    };
    const handleCancel = () => {
        setIsEditing(false);
        setFormData(profile || {});
        setAvatarPreview(profile?.avatar_url || null); // Reset avatar preview
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        // Just save profile fields, email verification is handled separately
        try {
            const result = await updateOwnerProfile(profile.id, formData);
            if (result.success) {
                setProfile(prev => prev ? { ...prev, ...formData } : null);
                setIsEditing(false);

                await logActivity({
                    userId: profile.id,
                    action: 'profile_update',
                    description: 'Updated profile information',
                    severity: 'info',
                    status: 'success'
                });

                showToast('Profil berhasil diperbarui', 'success');
                await refreshProfile();
                loadOwnerData();
            } else {
                showToast('Gagal memperbarui profil', 'error');
            }
        } catch (error) {
            showToast('Gagal memperbarui profil', 'error');
        }
    };

    const handleSaveAddress = async () => {
        if (!profile) return;

        try {
            const result = await updateOwnerProfile(profile.id, {
                address: formData.address,
                city: formData.city,
                province: formData.province,
                postal_code: formData.postal_code
            });

            if (result.success) {
                setProfile(prev => prev ? {
                    ...prev,
                    address: formData.address,
                    city: formData.city,
                    province: formData.province,
                    postal_code: formData.postal_code
                } : null);
                setIsEditingAddress(false);

                await logActivity({
                    userId: profile.id,
                    action: 'address_update',
                    description: 'Updated address and location details',
                    severity: 'info',
                    status: 'success'
                });

                showToast('Alamat berhasil diperbarui', 'success');
                loadOwnerData();
            } else {
                showToast('Gagal memperbarui alamat', 'error');
            }
        } catch (error) {
            showToast('Gagal memperbarui alamat', 'error');
        }
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
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = async () => {
                const newAvatarUrl = reader.result as string;
                setAvatarPreview(newAvatarUrl);
                setFormData(prev => ({ ...prev, avatar_url: newAvatarUrl }));

                // Auto-save avatar and log activity
                if (profile) {
                    const result = await updateOwnerProfile(profile.id, { avatar_url: newAvatarUrl });
                    if (result.success) {
                        setProfile(prev => prev ? { ...prev, avatar_url: newAvatarUrl } : null);
                        showToast('Foto profil berhasil diperbarui', 'success');

                        // Refresh global auth state
                        await refreshProfile();

                        // Log the activity
                        await logActivity({
                            userId: profile.id,
                            action: 'avatar_update',
                            description: 'Updated profile picture',
                            severity: 'low',
                            status: 'success'
                        });

                        // Reload activity logs
                        loadOwnerData();
                    } else {
                        showToast('Gagal memperbarui foto profil', 'error');
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        setPasswordErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    const validatePasswordForm = (): boolean => {
        const errors: { [key: string]: string } = {};

        if (!passwordForm.currentPassword) {
            errors.currentPassword = 'Password saat ini wajib diisi';
        }

        if (!passwordForm.newPassword) {
            errors.newPassword = 'Password baru wajib diisi';
        } else if (passwordForm.newPassword.length < 6) {
            errors.newPassword = 'Password minimal 6 karakter';
        }

        if (!passwordForm.confirmPassword) {
            errors.confirmPassword = 'Konfirmasi password wajib diisi';
        } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            errors.confirmPassword = 'Password tidak cocok';
        }

        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile || !validatePasswordForm()) return;

        try {
            const result = await updateUserPassword(
                profile.id,
                passwordForm.currentPassword,
                passwordForm.newPassword
            );

            if (result.success) {
                // Log password change
                await logActivity({
                    userId: profile.id,
                    action: 'password_change',
                    description: 'Changed account password',
                    severity: 'high',
                    status: 'success'
                });

                showToast('Password berhasil diubah', 'success');
                setIsChangingPassword(false);
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setPasswordErrors({}); // Clear errors on success
                loadOwnerData(); // Reload to get updated activity logs
            } else {
                // Log failed attempt
                await logActivity({
                    userId: profile.id,
                    action: 'password_change',
                    description: 'Failed password change attempt',
                    severity: 'high',
                    status: 'failure'
                });

                setPasswordErrors({ currentPassword: result.message });
                showToast(result.message, 'error');
            }
        } catch (error) {
            showToast('Gagal mengubah password', 'error');
        }
    };

    const handleToggle2FA = () => {
        if (!profile) return;

        const newStatus = !profile.two_factor_enabled;
        setPending2FAStatus(newStatus);
        setShow2FAConfirmation(true);
    };

    const confirm2FAToggle = async () => {
        if (!profile) return;

        try {
            const result = await updateOwnerProfile(profile.id, { two_factor_enabled: pending2FAStatus });

            if (result.success) {
                setProfile(prev => prev ? { ...prev, two_factor_enabled: pending2FAStatus } : null);
                showToast(
                    pending2FAStatus ? 'Autentikasi dua faktor diaktifkan' : 'Autentikasi dua faktor dinonaktifkan',
                    'success'
                );

                // Log the activity
                // Log the activity
                await logActivity({
                    userId: profile.id,
                    action: pending2FAStatus ? '2fa_enabled' : '2fa_disabled',
                    description: pending2FAStatus ? 'Enabled two-factor authentication' : 'Disabled two-factor authentication',
                    severity: 'medium',
                    status: 'success'
                });

                // Reload activity logs to show the new entry
                loadOwnerData();
            }
        } catch (error) {
            showToast('Gagal mengubah pengaturan 2FA', 'error');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getActionIcon = (action: string) => {
        const iconClass = "w-5 h-5";
        switch (action) {
            case 'login':
                return <Key className={`${iconClass} text-green-600 dark:text-green-400`} />;
            case 'profile_update':
                return <User className={`${iconClass} text-blue-600 dark:text-blue-400`} />;
            case 'password_change':
                return <Lock className={`${iconClass} text-orange-600 dark:text-orange-400`} />;
            case '2fa_enabled':
                return <Shield className={`${iconClass} text-green-600 dark:text-green-400`} />;
            case '2fa_disabled':
                return <Shield className={`${iconClass} text-gray-600 dark:text-gray-400`} />;
            case 'avatar_update':
                return <Camera className={`${iconClass} text-purple-600 dark:text-purple-400`} />;
            case 'avatar_remove':
                return <X className={`${iconClass} text-red-600 dark:text-red-400`} />;
            case 'email_change':
                return <Mail className={`${iconClass} text-blue-600 dark:text-blue-400`} />;
            default:
                return <Activity className={`${iconClass} text-gray-600 dark:text-gray-400`} />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Profil tidak ditemukan</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profil Pemilik</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Kelola informasi profil dan pengaturan akun utama Anda
                </p>
            </div>

            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Profile Header / Cover */}
                <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-600 relative">
                    <div className="absolute -bottom-12 left-8">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 p-1">
                                <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                    {avatarPreview || profile.avatar_url ? (
                                        <img src={avatarPreview || profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
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
                            <button
                                onClick={handleAvatarClick}
                                type="button"
                                className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                                <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Profile Content */}
                <div className="pt-16 pb-8 px-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {profile.full_name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                    <Shield className="w-3 h-3" />
                                    {profile.role === 'admin' ? 'Owner' : profile.role}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    • Bergabung sejak Nov 2025
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
                                    <FloatingLabelInput
                                        label="Nama Lengkap"
                                        name="full_name"
                                        value={formData.full_name || ''}
                                        onChange={handleChange}
                                        icon={<User className="w-5 h-5" />}
                                    />
                                </div>
                                <div>
                                    <FloatingLabelInput
                                        label="Avatar URL"
                                        name="avatar_url"
                                        value={formData.avatar_url || ''}
                                        onChange={(e) => {
                                            handleChange(e);
                                            setAvatarPreview(e.target.value);
                                        }}
                                        icon={<Camera className="w-5 h-5" />}
                                    />
                                </div>
                                <div>
                                    <FloatingLabelInput
                                        label="Username"
                                        name="username"
                                        value={formData.username || ''}
                                        onChange={handleChange}
                                        disabled={!!(profile?.last_username_change && (new Date().getTime() - new Date(profile.last_username_change).getTime()) / (1000 * 3600 * 24) < 14)}
                                        className={(profile?.last_username_change && (new Date().getTime() - new Date(profile.last_username_change).getTime()) / (1000 * 3600 * 24) < 14)
                                            ? 'opacity-60 cursor-not-allowed'
                                            : ''
                                        }
                                        icon={<User className="w-5 h-5" />}
                                    />
                                    {profile?.last_username_change && (new Date().getTime() - new Date(profile.last_username_change).getTime()) / (1000 * 3600 * 24) < 14 && (
                                        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                            Username hanya dapat diubah setiap 14 hari.
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <FloatingLabelInput
                                        label="Nomor Telepon"
                                        type="tel"
                                        name="phone"
                                        value={formData.phone || ''}
                                        onChange={handleChange}
                                        icon={<Phone className="w-5 h-5" />}
                                    />
                                </div>
                                <div>
                                    <FloatingLabelInput
                                        label="Tanggal Lahir"
                                        type="date"
                                        name="birthdate"
                                        value={formData.birthdate || ''}
                                        onChange={handleChange}
                                        icon={<Calendar className="w-5 h-5" />}
                                    />
                                </div>
                                <div>
                                    <FloatingLabelInput
                                        label="Email"
                                        type="email"
                                        name="email"
                                        value={formData.email || ''}
                                        onChange={handleChange}
                                        icon={<Mail className="w-5 h-5" />}
                                        rightElement={
                                            formData.email !== originalEmail && (
                                                <button
                                                    type="button"
                                                    onClick={handleVerifyEmail}
                                                    disabled={isVerifyingEmail}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
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
                                            )
                                        }
                                    />
                                    {formData.email !== originalEmail && (
                                        <p className="mt-1 text-xs text-gray-500 ml-1">Klik tombol Verifikasi untuk mengonfirmasi email baru</p>
                                    )}
                                </div>

                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-6 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                    <Mail className="w-5 h-5 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                        Email Address
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {profile.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                    <Phone className="w-5 h-5 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                        Phone Number
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {profile.phone || 'Belum diatur'}
                                    </p>
                                </div>
                            </div>

                            {profile.username && (
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                        <User className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                            Username
                                        </p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            @{profile.username}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {profile.birthdate && (
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                        <Calendar className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                            Tanggal Lahir
                                        </p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {new Date(profile.birthdate).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Address Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Alamat & Lokasi</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Kelola alamat lengkap Anda
                            </p>
                        </div>
                    </div>
                    {!isEditingAddress && (
                        <button
                            onClick={() => {
                                setFormData(profile || {});
                                setIsEditingAddress(true);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
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
                                <FloatingLabelInput
                                    label="Alamat Lengkap"
                                    name="address"
                                    value={formData.address || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    multiline
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <FloatingLabelInput
                                        label="Kota"
                                        name="city"
                                        value={formData.city || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <FloatingLabelInput
                                        label="Provinsi"
                                        name="province"
                                        value={formData.province || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <FloatingLabelInput
                                        label="Kode Pos"
                                        name="postal_code"
                                        value={formData.postal_code || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                                    />
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
                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
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
                                    {profile.address || 'Belum diatur'}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Detail Wilayah</h4>
                                <p className="text-sm text-gray-900 dark:text-white">
                                    {[profile.city, profile.province, profile.postal_code].filter(Boolean).join(', ') || 'Belum diatur'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Lock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Keamanan Akun</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Kelola password dan pengaturan keamanan
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Password Change */}
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Password</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Terakhir diubah 30 hari yang lalu
                                </p>
                            </div>
                            {!isChangingPassword && (
                                <button
                                    onClick={() => setIsChangingPassword(true)}
                                    className="px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                >
                                    Ubah Password
                                </button>
                            )}
                        </div>

                        {isChangingPassword && (
                            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                                <div>
                                    <FloatingLabelInput
                                        label="Password Saat Ini"
                                        type={showPasswords.current ? "text" : "password"}
                                        name="currentPassword"
                                        value={passwordForm.currentPassword}
                                        onChange={handlePasswordChange}
                                        error={passwordErrors.currentPassword}
                                        icon={<Lock className="w-5 h-5" />}
                                        rightElement={
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            >
                                                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        }
                                    />
                                </div>

                                <div>
                                    <FloatingLabelInput
                                        label="Password Baru"
                                        type={showPasswords.new ? "text" : "password"}
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordChange}
                                        error={passwordErrors.newPassword}
                                        icon={<Lock className="w-5 h-5" />}
                                        rightElement={
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            >
                                                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        }
                                    />
                                </div>

                                <div>
                                    <FloatingLabelInput
                                        label="Konfirmasi Password Baru"
                                        type={showPasswords.confirm ? "text" : "password"}
                                        name="confirmPassword"
                                        value={passwordForm.confirmPassword}
                                        onChange={handlePasswordChange}
                                        error={passwordErrors.confirmPassword}
                                        icon={<Lock className="w-5 h-5" />}
                                        rightElement={
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            >
                                                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        }
                                    />
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsChangingPassword(false);
                                            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                            setPasswordErrors({});
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm"
                                    >
                                        Simpan Password
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Two-Factor Authentication */}
                    <div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Autentikasi Dua Faktor (2FA)
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Tambahkan lapisan keamanan ekstra untuk akun Anda
                                </p>
                            </div>
                            <button
                                onClick={handleToggle2FA}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile.two_factor_enabled
                                    ? 'bg-orange-500'
                                    : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile.two_factor_enabled ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div >

            {/* Activity Log */}
            < div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8" >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Aktivitas Terbaru</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Riwayat aktivitas akun Anda
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <select
                                value={filterAction}
                                onChange={(e) => setFilterAction(e.target.value)}
                                className="appearance-none pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            >
                                <option value="all">Semua Aktivitas</option>
                                <option value="login">Login</option>
                                <option value="profile_update">Update Profil</option>
                                <option value="password_change">Ganti Password</option>
                                <option value="2fa_enabled">2FA Aktif</option>
                                <option value="2fa_disabled">2FA Nonaktif</option>
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>

                        <div className="relative">
                            <select
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="appearance-none pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            >
                                <option value="all">Semua Waktu</option>
                                <option value="today">Hari Ini</option>
                                <option value="week">7 Hari Terakhir</option>
                                <option value="month">30 Hari Terakhir</option>
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>

                        <button
                            onClick={handleExport}
                            disabled={activityLogs.length === 0}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                            title="Export CSV"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    {activityLogs.length > 0 ? (
                        <>
                            {activityLogs.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                                >
                                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm relative">
                                        {getActionIcon(log.action)}
                                        {log.status === 'failure' && (
                                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full">
                                                <XCircle className="w-4 h-4 text-red-500 fill-white dark:fill-gray-800" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {log.description}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDate(log.created_at)}
                                                    </span>
                                                    {log.device && (
                                                        <span className="flex items-center gap-1" title={log.device}>
                                                            <Monitor className="w-3 h-3" />
                                                            {formatDevice(log.device)}
                                                        </span>
                                                    )}
                                                    {log.ip_address && (
                                                        <span className="flex items-center gap-1">
                                                            <Globe className="w-3 h-3" />
                                                            {log.ip_address}
                                                        </span>
                                                    )}
                                                    {log.location && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {log.location}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {log.severity && log.severity !== 'info' && (
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider
                                                    ${log.severity === 'critical' || log.severity === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        log.severity === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}
                                                >
                                                    {log.severity}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {activityLogs.length < totalLogs && (
                                <div className="pt-4 text-center">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={isLoadingLogs}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isLoadingLogs ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Memuat...
                                            </>
                                        ) : (
                                            <>
                                                Muat Lebih Banyak
                                                <ChevronDown className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                                <Activity className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Tidak ada aktivitas ditemukan
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Coba ubah filter pencarian Anda
                            </p>
                        </div>
                    )}
                </div>
            </div >

            {/* Email Verification Modal */}
            < EmailVerificationModal
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

            {/* 2FA Confirmation Modal */}
            <ConfirmationModal
                isOpen={show2FAConfirmation}
                onClose={() => setShow2FAConfirmation(false)}
                onConfirm={confirm2FAToggle}
                title={pending2FAStatus ? 'Aktifkan 2FA?' : 'Nonaktifkan 2FA?'}
                message={
                    pending2FAStatus
                        ? 'Anda akan menerima kode verifikasi via email setiap kali login. Ini akan meningkatkan keamanan akun Anda.'
                        : 'Akun Anda akan kurang aman tanpa verifikasi tambahan. Yakin ingin menonaktifkan autentikasi dua faktor?'
                }
                confirmText={pending2FAStatus ? 'Aktifkan' : 'Nonaktifkan'}
                cancelText="Batal"
                type={pending2FAStatus ? 'success' : 'warning'}
            />
        </div >
    );
};

export default AkunPemilik;
