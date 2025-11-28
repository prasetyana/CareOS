import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@core/contexts/AuthContext';
import { useToast } from '@core/contexts/ToastContext';
import { updateUser } from '@core/data/mockDB';
import { Upload, Trash2, Loader2, Check, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@ui/Modal';
import EmailVerificationModal from '../components/EmailVerificationModal';

const formElementVariants = {
    hidden: (direction: number) => ({ opacity: 0, x: direction * 10 }),
    visible: { opacity: 1, x: 0 },
    exit: (direction: number) => ({ opacity: 0, x: direction * -10 }),
};

const FormField: React.FC<{ label: string; isEditing: boolean; displayContent: React.ReactNode; editContent: React.ReactNode; }> = ({ label, isEditing, displayContent, editContent }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start py-4">
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 col-span-1 pt-2">{label}</dt>
        <dd className="col-span-2 text-gray-900 dark:text-gray-200 relative min-h-[40px] flex items-center">
            <AnimatePresence mode="wait" initial={false}>
                {isEditing ? (
                    <motion.div
                        key="edit"
                        custom={1}
                        variants={formElementVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="w-full"
                    >
                        {editContent}
                    </motion.div>
                ) : (
                    <motion.div
                        key="display"
                        custom={-1}
                        variants={formElementVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="w-full"
                    >
                        {displayContent}
                    </motion.div>
                )}
            </AnimatePresence>
        </dd>
    </div>
);


interface ProfileAvatarProps {
    isEditing: boolean;
    avatarPreview: string | null;
    userName: string;
    userAvatarUrl: string | null | undefined;
    onAvatarClick: () => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemovePreview: () => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
    isEditing,
    avatarPreview,
    userName,
    userAvatarUrl,
    onAvatarClick,
    onFileChange,
    onRemovePreview,
    fileInputRef
}) => {
    const finalAvatarSrc = avatarPreview ?? userAvatarUrl;

    const AvatarDisplay = () => {
        if (finalAvatarSrc) {
            return <img src={finalAvatarSrc} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />;
        }
        return (
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-5xl text-blue-600">
                {userName.charAt(0).toUpperCase()}
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center">
            <div
                className={`relative w-24 h-24 rounded-full mb-4 ring-4 ring-white dark:ring-neutral-800/50 group ${isEditing ? 'cursor-pointer' : ''}`}
                onClick={onAvatarClick}
            >
                <AvatarDisplay />
                {isEditing && (
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload size={24} className="text-white" />
                    </div>
                )}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={onFileChange}
                className="hidden"
                accept="image/*"
            />
            <div className="h-10">
                <AnimatePresence>
                    {isEditing && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center gap-3"
                        >
                            <button type="button" onClick={onAvatarClick} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <Upload size={16} /> Ubah
                            </button>
                            {(avatarPreview || userAvatarUrl) && (
                                <button type="button" onClick={onRemovePreview} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 text-red-500 transition-colors">
                                    <Trash2 size={16} /> Hapus
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">JPG, GIF atau PNG. Ukuran maks 800KB.</p>
        </div>
    );
};

interface ProfileFormProps {
    isEditing: boolean;
    formData: { name: string; username: string; email: string; phone: string; birthdate: string };
    errors: { name?: string; username?: string; email?: string; phone?: string; birthdate?: string };
    isSubmitting: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    originalEmail: string;
    onVerifyEmail: () => void;
    isVerifyingEmail: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ isEditing, formData, errors, isSubmitting, onChange, originalEmail, onVerifyEmail, isVerifyingEmail }) => {
    const getInputBorderClass = (field: keyof typeof errors) =>
        errors[field] ? 'border-red-500 focus:ring-red-500/50' : 'border-black/10 dark:border-white/20 focus:ring-blue-500';

    const inputClasses = `block w-full shadow-sm py-2 px-3 rounded-lg sm:text-sm transition focus:outline-none focus:ring-1 bg-white dark:bg-neutral-800 disabled:opacity-50`;

    return (
        <dl className="divide-y divide-black/10 dark:divide-white/10 -my-4">
            <FormField
                label="Nama Lengkap"
                isEditing={isEditing}
                displayContent={<p className="font-medium">{formData.name}</p>}
                editContent={
                    <div>
                        <input id="name" name="name" type="text" value={formData.name} onChange={onChange} disabled={isSubmitting} className={`${inputClasses} ${getInputBorderClass('name')}`} />
                        {errors.name && <p className="text-xs text-red-500 mt-1.5">{errors.name}</p>}
                    </div>
                }
            />
            <FormField
                label="Username"
                isEditing={isEditing}
                displayContent={<p className="text-gray-500">{formData.username || '-'}</p>}
                editContent={
                    <div>
                        <input id="username" name="username" type="text" value={formData.username} onChange={onChange} disabled={isSubmitting} className={`${inputClasses} ${getInputBorderClass('username')}`} placeholder="username" />
                        {errors.username && <p className="text-xs text-red-500 mt-1.5">{errors.username}</p>}
                    </div>
                }
            />
            <FormField
                label="Alamat Email"
                isEditing={isEditing}
                displayContent={<p className="text-gray-500">{formData.email}</p>}
                editContent={
                    <div>
                        <div className="relative">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={onChange}
                                disabled={isSubmitting}
                                className={`${inputClasses} ${getInputBorderClass('email')} ${formData.email !== originalEmail ? 'pr-28' : ''}`}
                            />
                            {formData.email !== originalEmail && (
                                <button
                                    type="button"
                                    onClick={onVerifyEmail}
                                    disabled={isVerifyingEmail || isSubmitting}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
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
                        {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email}</p>}
                        {formData.email !== originalEmail && (
                            <p className="text-xs text-gray-500 mt-1.5">Klik tombol Verifikasi untuk mengonfirmasi email baru</p>
                        )}
                    </div>
                }
            />
            <FormField
                label="Nomor Telepon"
                isEditing={isEditing}
                displayContent={<p>{formData.phone || '-'}</p>}
                editContent={
                    <div>
                        <input id="phone" name="phone" type="tel" value={formData.phone} onChange={onChange} disabled={isSubmitting} className={`${inputClasses} ${getInputBorderClass('phone')}`} />
                        {errors.phone && <p className="text-xs text-red-500 mt-1.5">{errors.phone}</p>}
                    </div>
                }
            />
            <FormField
                label="Tanggal Lahir"
                isEditing={isEditing}
                displayContent={<p>{formData.birthdate ? new Date(formData.birthdate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</p>}
                editContent={
                    <div>
                        <input id="birthdate" name="birthdate" type="date" value={formData.birthdate} onChange={onChange} disabled={isSubmitting} className={`${inputClasses} ${getInputBorderClass('birthdate')}`} />
                        {errors.birthdate && <p className="text-xs text-red-500 mt-1.5">{errors.birthdate}</p>}
                    </div>
                }
            />
        </dl>
    );
};


// --- Main Page Component ---

const CustomerProfile: React.FC = () => {
    const { user, updateUserData, changeEmail } = useAuth();
    const { addToast } = useToast();

    // States
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', username: '', email: '', phone: '', birthdate: '' });
    const [errors, setErrors] = useState<{ name?: string; username?: string; email?: string; phone?: string; birthdate?: string }>({});
    const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // States for unsaved changes & email verification
    const [isDirty, setIsDirty] = useState(false);
    const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
    const [isEmailVerificationModalOpen, setIsEmailVerificationModalOpen] = useState(false);
    const [pendingNewEmail, setPendingNewEmail] = useState('');
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

    const [originalData, setOriginalData] = useState({ name: '', username: '', email: '', phone: '', birthdate: '', avatarUrl: null as string | null | undefined });

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

    useEffect(() => {
        if (!isEditing) {
            setIsDirty(false);
            return;
        }
        const formDataChanged = formData.name !== originalData.name ||
            formData.username !== originalData.username ||
            formData.email !== originalData.email ||
            formData.phone !== originalData.phone ||
            formData.birthdate !== originalData.birthdate;
        const avatarChanged = avatarPreview !== originalData.avatarUrl;

        setIsDirty(formDataChanged || avatarChanged);
    }, [formData, avatarPreview, originalData, isEditing]);

    if (!user) return null;

    const validateField = (name: string, value: string): string => {
        switch (name) {
            case 'name':
                if (!value.trim()) return 'Nama lengkap tidak boleh kosong.';
                break;
            case 'username':
                if (value && !/^[a-zA-Z0-9_]{3,20}$/.test(value)) return 'Username harus 3-20 karakter (huruf, angka, underscore).';
                break;
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Format email tidak valid.';
                break;
            case 'phone':
                if (value && !/^08\d{8,11}$/.test(value)) return 'Format nomor telepon tidak valid (cth: 081234567890).';
                break;
            case 'birthdate':
                if (value && new Date(value) > new Date()) return 'Tanggal lahir tidak boleh di masa depan.';
                break;
            default: break;
        }
        return '';
    };

    const handleDiscardChanges = () => {
        setFormData({ name: originalData.name, username: originalData.username, email: originalData.email, phone: originalData.phone, birthdate: originalData.birthdate });
        setAvatarPreview(originalData.avatarUrl || null);
        setErrors({});
        setIsEditing(false);
        setShowUnsavedChangesModal(false);
    };

    const handleEditToggle = () => {
        if (isEditing) {
            if (isDirty) {
                setShowUnsavedChangesModal(true);
            } else {
                setIsEditing(false);
            }
        } else {
            setOriginalData({
                name: user.name || '',
                username: user.username || '',
                email: user.email || '',
                phone: user.phone || '',
                birthdate: user.birthdate || '',
                avatarUrl: user.avatarUrl,
            });
            setIsEditing(true);
        }
    };

    const performSave = async (emailToSave?: string) => {
        setSaveStatus('loading');
        try {
            const updatedData = {
                name: formData.name,
                username: formData.username,
                phone: formData.phone,
                birthdate: formData.birthdate,
                avatarUrl: avatarPreview,
                email: emailToSave || user.email,
            };
            const updatedUser = await updateUser(user.id, updatedData);
            if (updatedUser) {
                updateUserData(updatedUser);
                setSaveStatus('success');
                addToast('Profil berhasil diperbarui!', 'success');
                setTimeout(() => {
                    setIsEditing(false);
                    setSaveStatus('idle');
                    setOriginalData({ ...formData, email: updatedData.email, avatarUrl: avatarPreview });
                }, 1500);
                return true;
            } else {
                throw new Error("User update failed");
            }
        } catch (error) {
            addToast('Gagal memperbarui profil.', 'error');
            setSaveStatus('idle');
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = {
            name: validateField('name', formData.name),
            username: validateField('username', formData.username),
            email: validateField('email', formData.email),
            phone: validateField('phone', formData.phone),
            birthdate: validateField('birthdate', formData.birthdate),
        };
        const activeErrors = Object.fromEntries(Object.entries(validationErrors).filter(([_, value]) => value));
        setErrors(activeErrors);

        if (Object.keys(activeErrors).length > 0) {
            addToast('Harap perbaiki kesalahan pada form.', 'error');
            return;
        }

        // Just save the profile, email verification is handled separately
        await performSave();
    };

    const handleVerifyEmail = async () => {
        // Validate email first
        const emailError = validateField('email', formData.email);
        if (emailError) {
            setErrors(prev => ({ ...prev, email: emailError }));
            addToast('Format email tidak valid', 'error');
            return;
        }

        setIsVerifyingEmail(true);
        const result = await changeEmail(formData.email);
        setIsVerifyingEmail(false);

        if (result.success) {
            setPendingNewEmail(formData.email);
            setIsEmailVerificationModalOpen(true);
            addToast('Email konfirmasi telah dikirim', 'info');
        } else {
            addToast(result.error || 'Gagal mengubah email', 'error');
            setFormData(prev => ({ ...prev, email: originalData.email }));
        }
    };

    const handleResendEmailConfirmation = async () => {
        if (!pendingNewEmail) return;

        const result = await changeEmail(pendingNewEmail);
        if (result.success) {
            addToast('Email konfirmasi telah dikirim ulang', 'success');
        } else {
            addToast(result.error || 'Gagal mengirim ulang email', 'error');
        }
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleAvatarClick = () => isEditing && fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePreview = () => {
        setAvatarPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const saveButtonContent = () => {
        if (saveStatus === 'loading') return <Loader2 className="w-5 h-5 animate-spin" />;
        if (saveStatus === 'success') return <><Check className="w-5 h-5 mr-2" /> Tersimpan</>;
        return 'Simpan Perubahan';
    };
    const isSubmitting = saveStatus === 'loading';

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Profil Saya</h1>

            <div className="space-y-8">
                <div className="bg-white dark:bg-neutral-800/50 rounded-2xl shadow-sm border border-black/10 dark:border-white/10">
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-medium tracking-tight text-gray-900 dark:text-white">Informasi Pribadi</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Perbarui foto dan detail pribadi Anda di sini.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {isEditing && (
                                    <button type="button" onClick={handleEditToggle} disabled={isSubmitting} className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:bg-black/5 dark:hover:bg-white/10">
                                        Batal
                                    </button>
                                )}
                                {isEditing ? (
                                    <button type="submit" disabled={isSubmitting || !isDirty} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors duration-300 disabled:opacity-50 flex items-center gap-2">
                                        {saveButtonContent()}
                                    </button>
                                ) : (
                                    <button type="button" onClick={handleEditToggle} className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors">
                                        Edit
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1">
                                <ProfileAvatar
                                    isEditing={isEditing}
                                    avatarPreview={avatarPreview}
                                    userName={user.name}
                                    userAvatarUrl={user.avatarUrl}
                                    onAvatarClick={handleAvatarClick}
                                    onFileChange={handleFileChange}
                                    onRemovePreview={handleRemovePreview}
                                    fileInputRef={fileInputRef}
                                />
                            </div>
                            <div className="lg:col-span-2">
                                <ProfileForm
                                    isEditing={isEditing}
                                    formData={formData}
                                    errors={errors}
                                    isSubmitting={isSubmitting}
                                    onChange={handleChange}
                                    originalEmail={originalData.email}
                                    onVerifyEmail={handleVerifyEmail}
                                    isVerifyingEmail={isVerifyingEmail}
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <Modal isOpen={showUnsavedChangesModal} onClose={() => setShowUnsavedChangesModal(false)} title="Perubahan Belum Disimpan">
                    <p className="text-gray-500">Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin membatalkannya?</p>
                    <div className="flex justify-end gap-4 mt-8">
                        <button onClick={() => setShowUnsavedChangesModal(false)} className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:bg-black/5 dark:hover:bg-white/10">Lanjut Mengedit</button>
                        <button onClick={handleDiscardChanges} className="bg-red-100 text-red-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-200">
                            Buang Perubahan
                        </button>
                    </div>
                </Modal>

                <EmailVerificationModal
                    isOpen={isEmailVerificationModalOpen}
                    onClose={() => setIsEmailVerificationModalOpen(false)}
                    newEmail={pendingNewEmail}
                    onResendConfirmation={handleResendEmailConfirmation}
                    isLoading={saveStatus === 'loading'}
                />
            </div>
        </div>
    );
};

export default CustomerProfile;
