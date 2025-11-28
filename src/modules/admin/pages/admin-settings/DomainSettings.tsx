import React, { useState } from 'react';
import { Globe, Link2, Crown, Copy, Check, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { useTenant } from '@core/tenant';
import { useToast } from '@core/contexts/ToastContext';

const DomainSettingsPage: React.FC = () => {
    const { tenant } = useTenant();
    const { showToast } = useToast();

    // State
    const [domainType, setDomainType] = useState<'subdomain' | 'custom'>(tenant?.domainType || 'subdomain');
    const [subdomain, setSubdomain] = useState(tenant?.subdomain || tenant?.slug || '');
    const [customDomain, setCustomDomain] = useState(tenant?.customDomain || '');
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
    const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // DNS Records (simulated for MVP)
    const dnsRecords = {
        aRecord: {
            host: '@',
            value: '123.45.67.89',
            verified: tenant?.dnsRecords?.aRecord?.verified || false
        },
        cnameRecord: {
            host: 'www',
            value: 'dineos.com',
            verified: tenant?.dnsRecords?.cnameRecord?.verified || false
        }
    };

    // Check subdomain availability (simulated for MVP)
    const checkSubdomainAvailability = async (value: string) => {
        if (!value || value.length < 3) {
            setSubdomainAvailable(null);
            return;
        }

        setIsCheckingAvailability(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        // For MVP: assume available if different from current
        const available = value === tenant?.slug || value !== 'demo';
        setSubdomainAvailable(available);
        setIsCheckingAvailability(false);
    };

    // Validate subdomain format
    const validateSubdomain = (value: string): boolean => {
        const regex = /^[a-z0-9-]+$/;
        return regex.test(value) && value.length >= 3 && value.length <= 63;
    };

    // Handle subdomain change
    const handleSubdomainChange = (value: string) => {
        const lowercased = value.toLowerCase();
        setSubdomain(lowercased);

        if (validateSubdomain(lowercased)) {
            checkSubdomainAvailability(lowercased);
        } else {
            setSubdomainAvailable(null);
        }
    };

    // Copy to clipboard
    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        showToast('Disalin ke clipboard', 'success');
        setTimeout(() => setCopiedField(null), 2000);
    };

    // Verify DNS records (simulated for MVP)
    const verifyDNSRecords = async () => {
        setIsVerifying(true);

        // Simulate DNS verification
        await new Promise(resolve => setTimeout(resolve, 2000));

        // For MVP: randomly verify (in production, this would be real DNS lookup)
        const verified = Math.random() > 0.3; // 70% success rate for demo

        if (verified) {
            showToast('DNS records berhasil diverifikasi!', 'success');
        } else {
            showToast('DNS records tidak ditemukan. Harap tunggu propagasi DNS (hingga 48 jam)', 'error');
        }

        setIsVerifying(false);
    };

    // Save configuration
    const handleSave = async () => {
        setIsSaving(true);

        // Validate
        if (domainType === 'subdomain' && !validateSubdomain(subdomain)) {
            showToast('Format subdomain tidak valid', 'error');
            setIsSaving(false);
            return;
        }

        if (domainType === 'custom' && !customDomain) {
            showToast('Silakan masukkan domain kustom Anda', 'error');
            setIsSaving(false);
            return;
        }

        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1000));

        showToast('Konfigurasi domain berhasil disimpan!', 'success');
        setIsSaving(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Konfigurasi Domain</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Atur domain dan pengaturan DNS restoran Anda
                </p>
            </div>

            {/* Domain Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Free Subdomain */}
                <div
                    onClick={() => setDomainType('subdomain')}
                    className={`relative cursor-pointer border-2 rounded-2xl p-6 transition-all ${domainType === 'subdomain'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                >
                    <div className="flex items-start gap-4">
                        <input
                            type="radio"
                            name="domainType"
                            value="subdomain"
                            checked={domainType === 'subdomain'}
                            onChange={() => setDomainType('subdomain')}
                            className="mt-1"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Link2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-bold text-gray-900 dark:text-white">Subdomain DineOS</h3>
                                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                                    Gratis
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                namarestoran.dineos.com
                            </p>
                            <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    Tidak perlu setup
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    Sertifikat SSL included
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    Aktivasi instan
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Custom Domain */}
                <div
                    onClick={() => setDomainType('custom')}
                    className={`relative cursor-pointer border-2 rounded-2xl p-6 transition-all ${domainType === 'custom'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                >
                    <div className="flex items-start gap-4">
                        <input
                            type="radio"
                            name="domainType"
                            value="custom"
                            checked={domainType === 'custom'}
                            onChange={() => setDomainType('custom')}
                            className="mt-1"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-bold text-gray-900 dark:text-white">Domain Kustom</h3>
                                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium rounded-full flex items-center gap-1">
                                    <Crown className="w-3 h-3" />
                                    Premium
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                namarestoran.com
                            </p>
                            <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    Kontrol branding penuh
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    Tampilan profesional
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    Sertifikat SSL included
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subdomain Configuration */}
            {domainType === 'subdomain' && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Konfigurasi Subdomain Anda
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Pilih subdomain Anda
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={subdomain}
                                        onChange={(e) => handleSubdomainChange(e.target.value)}
                                        placeholder="namarestoran"
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    />
                                    {isCheckingAvailability && (
                                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                                    )}
                                </div>
                                <span className="text-gray-600 dark:text-gray-400 font-medium">.dineos.com</span>
                            </div>

                            {/* Validation Messages */}
                            {subdomain && !validateSubdomain(subdomain) && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    Hanya huruf kecil, angka, dan tanda hubung (3-63 karakter)
                                </p>
                            )}

                            {subdomainAvailable === true && (
                                <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                    <Check className="w-4 h-4" />
                                    Subdomain tersedia!
                                </p>
                            )}

                            {subdomainAvailable === false && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    Subdomain sudah digunakan
                                </p>
                            )}
                        </div>

                        {/* Preview */}
                        {subdomain && validateSubdomain(subdomain) && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                <p className="text-sm text-blue-900 dark:text-blue-200 mb-1">
                                    <strong>Pratinjau:</strong>
                                </p>
                                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                    {subdomain}.dineos.com
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Custom Domain Configuration */}
            {domainType === 'custom' && (
                <div className="space-y-6">
                    {/* Domain Input */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Masukkan Domain Kustom Anda
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nama domain
                                </label>
                                <input
                                    type="text"
                                    value={customDomain}
                                    onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
                                    placeholder="namarestoran.com"
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                                />
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    Masukkan domain tanpa http:// atau www
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* DNS Configuration */}
                    {customDomain && (
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Konfigurasi DNS
                                </h3>
                                <button
                                    onClick={verifyDNSRecords}
                                    disabled={isVerifying}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isVerifying ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Memverifikasi...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Verifikasi DNS
                                        </>
                                    )}
                                </button>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                Tambahkan DNS records berikut ke registrar domain Anda (GoDaddy, Namecheap, dll.)
                            </p>

                            <div className="space-y-4">
                                {/* A Record */}
                                <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded">
                                                    A
                                                </span>
                                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    Root Domain Record
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Mengarahkan root domain Anda ke server DineOS
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(`A @ ${dnsRecords.aRecord.value}`, 'aRecord')}
                                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                        >
                                            {copiedField === 'aRecord' ? (
                                                <Check className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 font-mono text-sm">
                                        <div className="grid grid-cols-3 gap-4 text-gray-900 dark:text-white">
                                            <div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Tipe</span>
                                                <span className="font-semibold">A</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Host</span>
                                                <span className="font-semibold">@</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Value</span>
                                                <span className="font-semibold">{dnsRecords.aRecord.value}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2">
                                        {dnsRecords.aRecord.verified ? (
                                            <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                                <Check className="w-4 h-4" />
                                                Terverifikasi
                                            </span>
                                        ) : (
                                            <span className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                Belum terverifikasi
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* CNAME Record */}
                                <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold rounded">
                                                    CNAME
                                                </span>
                                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    WWW Subdomain Record
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Mengarahkan www.{customDomain} ke root domain Anda
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(`CNAME www ${dnsRecords.cnameRecord.value}`, 'cnameRecord')}
                                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                        >
                                            {copiedField === 'cnameRecord' ? (
                                                <Check className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 font-mono text-sm">
                                        <div className="grid grid-cols-3 gap-4 text-gray-900 dark:text-white">
                                            <div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Tipe</span>
                                                <span className="font-semibold">CNAME</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Host</span>
                                                <span className="font-semibold">www</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Value</span>
                                                <span className="font-semibold">{dnsRecords.cnameRecord.value}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2">
                                        {dnsRecords.cnameRecord.verified ? (
                                            <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                                <Check className="w-4 h-4" />
                                                Terverifikasi
                                            </span>
                                        ) : (
                                            <span className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                Belum terverifikasi
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Help Link */}
                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                <p className="text-sm text-blue-900 dark:text-blue-200 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>
                                        Perubahan DNS dapat memakan waktu hingga 48 jam untuk propagasi.
                                        <a href="#" className="underline ml-1 inline-flex items-center gap-1">
                                            Butuh bantuan?
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={handleSave}
                    disabled={isSaving || (domainType === 'subdomain' && !subdomainAvailable)}
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

export default DomainSettingsPage;
