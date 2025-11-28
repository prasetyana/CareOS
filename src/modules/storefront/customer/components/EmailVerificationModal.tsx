import React from 'react';
import { Mail, X, RefreshCw, Loader2 } from 'lucide-react';

interface EmailVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    newEmail: string;
    onResendConfirmation: () => void;
    isLoading: boolean;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
    isOpen,
    onClose,
    newEmail,
    onResendConfirmation,
    isLoading
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>

                <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Verifikasi Email Baru
                    </h3>

                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Kami telah mengirimkan tautan verifikasi ke <strong>{newEmail}</strong>.
                        Silakan periksa kotak masuk Anda dan klik tautan tersebut untuk memverifikasi alamat email baru Anda.
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
                        >
                            Saya Mengerti
                        </button>

                        <button
                            onClick={onResendConfirmation}
                            disabled={isLoading}
                            className="w-full py-2.5 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50 text-orange-600 dark:text-orange-400 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                            Kirim Ulang Email
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationModal;
