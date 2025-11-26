import React, { useState } from 'react';
import { Mail, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Modal from './Modal';

interface EmailVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    newEmail: string;
    onResendConfirmation: () => Promise<void>;
    isLoading?: boolean;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
    isOpen,
    onClose,
    newEmail,
    onResendConfirmation,
    isLoading = false
}) => {
    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);

    const handleResend = async () => {
        setIsResending(true);
        setResendSuccess(false);
        try {
            await onResendConfirmation();
            setResendSuccess(true);
            setTimeout(() => setResendSuccess(false), 3000);
        } catch (error) {
            console.error('Error resending confirmation:', error);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Verifikasi Email Baru">
            <div className="space-y-6">
                {/* Icon and Status */}
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                        <Mail className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                        Email Konfirmasi Terkirim
                    </h3>
                    <p className="text-sm text-text-muted">
                        Kami telah mengirimkan email konfirmasi ke:
                    </p>
                    <p className="text-sm font-semibold text-text-primary mt-1">
                        {newEmail}
                    </p>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900 dark:text-blue-100">
                            <p className="font-medium mb-2">Langkah selanjutnya:</p>
                            <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
                                <li>Buka inbox email Anda</li>
                                <li>Cari email dari DineOS</li>
                                <li>Klik link konfirmasi di email tersebut</li>
                                <li>Email Anda akan diperbarui secara otomatis</li>
                            </ol>
                        </div>
                    </div>
                </div>

                {/* Resend Success Message */}
                {resendSuccess && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                Email konfirmasi baru telah dikirim!
                            </p>
                        </div>
                    </div>
                )}

                {/* Resend Button */}
                <div className="text-center">
                    <p className="text-xs text-text-muted mb-3">
                        Tidak menerima email?
                    </p>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={isResending || isLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isResending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Mengirim ulang...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                Kirim Ulang Email
                            </>
                        )}
                    </button>
                </div>

                {/* Help Text */}
                <div className="text-center pt-4 border-t border-black/10 dark:border-white/10">
                    <p className="text-xs text-text-muted">
                        Periksa folder spam jika Anda tidak menemukan email dalam beberapa menit.
                    </p>
                </div>

                {/* Close Button */}
                <div className="flex justify-end pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg text-sm font-semibold text-text-muted hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                        Mengerti
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default EmailVerificationModal;
