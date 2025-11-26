import React, { useState } from 'react';
import { Mail, Server, Crown, Check, AlertCircle, Loader2, Send, Shield, ShieldCheck } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import { useToast } from '../../contexts/ToastContext';

const EmailSettingsPage: React.FC = () => {
    const { tenant } = useTenant();
    const { showToast } = useToast();

    // State
    const [provider, setProvider] = useState<'default' | 'smtp'>(tenant?.emailSettings?.provider || 'default');
    const [senderName, setSenderName] = useState(tenant?.emailSettings?.senderName || tenant?.businessName || '');
    const [senderEmail, setSenderEmail] = useState(tenant?.emailSettings?.senderEmail || `noreply@${tenant?.slug || 'dineos'}.com`);

    // SMTP State
    const [smtpHost, setSmtpHost] = useState(tenant?.emailSettings?.smtpConfig?.host || '');
    const [smtpPort, setSmtpPort] = useState(tenant?.emailSettings?.smtpConfig?.port?.toString() || '587');
    const [smtpUsername, setSmtpUsername] = useState(tenant?.emailSettings?.smtpConfig?.username || '');
    const [smtpPassword, setSmtpPassword] = useState('');
    const [smtpSecure, setSmtpSecure] = useState(tenant?.emailSettings?.smtpConfig?.secure !== false);

    const [isSaving, setIsSaving] = useState(false);
    const [isSendingTest, setIsSendingTest] = useState(false);

    // Save configuration
    const handleSave = async () => {
        setIsSaving(true);

        // Validation
        if (!senderName.trim()) {
            showToast('Nama pengirim wajib diisi', 'error');
            setIsSaving(false);
            return;
        }

        if (provider === 'smtp') {
            if (!smtpHost || !smtpPort || !smtpUsername) {
                showToast('Semua kolom SMTP wajib diisi', 'error');
                setIsSaving(false);
                return;
            }
        }

        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1000));

        showToast('Konfigurasi email berhasil disimpan!', 'success');
        setIsSaving(false);
    };

    // Send test email
    const handleSendTest = async () => {
        setIsSendingTest(true);

        // Simulate sending
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Success for demo
        showToast('Email tes berhasil dikirim!', 'success');

        setIsSendingTest(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Konfigurasi Email</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Atur layanan pengiriman email untuk notifikasi dan transaksi
                </p>
            </div>

            {/* Provider Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Default Provider */}
                <div
                    onClick={() => setProvider('default')}
                    className={`relative cursor-pointer border-2 rounded-2xl p-6 transition-all ${provider === 'default'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                >
                    <div className="flex items-start gap-4">
                        <input
                            type="radio"
                            name="provider"
                            value="default"
                            checked={provider === 'default'}
                            onChange={() => setProvider('default')}
                            className="mt-1"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-bold text-gray-900 dark:text-white">Email Bawaan DineOS</h3>
                                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                                    Gratis
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Gunakan layanan email standar kami
                            </p>
                            <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    Setup instan
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    Reliabilitas tinggi
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    Tanpa konfigurasi
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* SMTP Provider */}
                <div
                    onClick={() => setProvider('smtp')}
                    className={`relative cursor-pointer border-2 rounded-2xl p-6 transition-all ${provider === 'smtp'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                >
                    <div className="flex items-start gap-4">
                        <input
                            type="radio"
                            name="provider"
                            value="smtp"
                            checked={provider === 'smtp'}
                            onChange={() => setProvider('smtp')}
                            className="mt-1"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Server className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-bold text-gray-900 dark:text-white">SMTP Kustom</h3>
                                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium rounded-full flex items-center gap-1">
                                    <Crown className="w-3 h-3" />
                                    Premium
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Gunakan server email Anda sendiri
                            </p>
                            <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    Branding penuh
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    Kontrol deliverability
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    Custom domain
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sender Configuration */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Informasi Pengirim
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nama Pengirim
                        </label>
                        <input
                            type="text"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            placeholder="Contoh: Restoran Enak"
                            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                        />
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Nama yang akan muncul di inbox pelanggan
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email Pengirim
                        </label>
                        <input
                            type="email"
                            value={senderEmail}
                            onChange={(e) => setSenderEmail(e.target.value)}
                            disabled={provider === 'default'}
                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white ${provider === 'default'
                                ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                                }`}
                        />
                        {provider === 'default' && (
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Gunakan SMTP Kustom untuk mengubah alamat email
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* SMTP Configuration */}
            {provider === 'smtp' && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Konfigurasi SMTP
                    </h3>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Host SMTP
                                </label>
                                <input
                                    type="text"
                                    value={smtpHost}
                                    onChange={(e) => setSmtpHost(e.target.value)}
                                    placeholder="smtp.gmail.com"
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Port SMTP
                                </label>
                                <input
                                    type="number"
                                    value={smtpPort}
                                    onChange={(e) => setSmtpPort(e.target.value)}
                                    placeholder="587"
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={smtpUsername}
                                    onChange={(e) => setSmtpUsername(e.target.value)}
                                    placeholder="user@example.com"
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={smtpPassword}
                                    onChange={(e) => setSmtpPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                            <div
                                onClick={() => setSmtpSecure(!smtpSecure)}
                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${smtpSecure ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${smtpSecure ? 'translate-x-6' : 'translate-x-0'
                                    }`} />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    {smtpSecure ? <ShieldCheck className="w-4 h-4 text-green-500" /> : <Shield className="w-4 h-4 text-gray-400" />}
                                    Koneksi Aman (SSL/TLS)
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Direkomendasikan untuk keamanan data
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={handleSendTest}
                    disabled={isSendingTest || (provider === 'smtp' && (!smtpHost || !smtpUsername))}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSendingTest ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Mengirim...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            Kirim Email Tes
                        </>
                    )}
                </button>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Check className="w-5 h-5" />
                            Simpan Konfigurasi
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default EmailSettingsPage;
