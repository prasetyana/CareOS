import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Clock, RefreshCw } from 'lucide-react';

interface Email2FAModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerify: (code: string) => Promise<{ success: boolean; error?: string }>;
    onResend: () => Promise<void>;
    email: string;
}

const Email2FAModal: React.FC<Email2FAModalProps> = ({
    isOpen,
    onClose,
    onVerify,
    onResend,
    email
}) => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown timer for code expiry
    useEffect(() => {
        if (!isOpen) {
            setTimeRemaining(300);
            return;
        }

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setError('Kode verifikasi telah kedaluwarsa. Silakan kirim ulang.');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setCode(['', '', '', '', '', '']);
            setError('');
            setTimeRemaining(300);
            // Focus first input
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }
    }, [isOpen]);

    const handleChange = (index: number, value: string) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits are entered
        if (newCode.every(digit => digit !== '') && index === 5) {
            handleVerify(newCode.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newCode = [...code];

        for (let i = 0; i < pastedData.length; i++) {
            newCode[i] = pastedData[i];
        }

        setCode(newCode);

        // Focus last filled input or first empty
        const nextIndex = Math.min(pastedData.length, 5);
        inputRefs.current[nextIndex]?.focus();

        // Auto-submit if all 6 digits pasted
        if (pastedData.length === 6) {
            handleVerify(pastedData);
        }
    };

    const handleVerify = async (codeString: string) => {
        setIsVerifying(true);
        setError('');

        const result = await onVerify(codeString);

        setIsVerifying(false);

        if (!result.success) {
            setError(result.error || 'Kode verifikasi tidak valid');
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        setIsResending(true);
        setError('');

        await onResend();

        setIsResending(false);
        setResendCooldown(60); // 60 second cooldown
        setTimeRemaining(300); // Reset timer
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="relative p-6 pb-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-blue-500 rounded-xl">
                            <Mail className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Verifikasi Email
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                Masukkan kode 6 digit
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
                        Kami telah mengirim kode verifikasi ke<br />
                        <span className="font-semibold text-gray-900 dark:text-white">{email}</span>
                    </p>

                    {/* Code Input */}
                    <div className="flex gap-2 justify-center mb-4" onPaste={handlePaste}>
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleChange(index, e.target.value)}
                                onKeyDown={e => handleKeyDown(index, e)}
                                className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all ${error
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                        : digit
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                                disabled={isVerifying}
                            />
                        ))}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
                        </div>
                    )}

                    {/* Timer */}
                    <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>
                            Kode berlaku selama: <span className={`font-semibold ${timeRemaining < 60 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                {formatTime(timeRemaining)}
                            </span>
                        </span>
                    </div>

                    {/* Resend Button */}
                    <button
                        onClick={handleResend}
                        disabled={resendCooldown > 0 || isResending}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                        {isResending
                            ? 'Mengirim ulang...'
                            : resendCooldown > 0
                                ? `Kirim ulang (${resendCooldown}s)`
                                : 'Kirim ulang kode'
                        }
                    </button>

                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                        Tidak menerima kode? Periksa folder spam atau kirim ulang.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Email2FAModal;
