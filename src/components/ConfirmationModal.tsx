import React from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'warning' | 'danger' | 'success' | 'info';
    confirmButtonClass?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Konfirmasi',
    cancelText = 'Batal',
    type = 'info',
    confirmButtonClass
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'warning':
                return <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />;
            case 'danger':
                return <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />;
            case 'success':
                return <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />;
            default:
                return <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
        }
    };

    const getHeaderColor = () => {
        switch (type) {
            case 'warning':
                return 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20';
            case 'danger':
                return 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20';
            case 'success':
                return 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20';
            default:
                return 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20';
        }
    };

    const getDefaultButtonClass = () => {
        if (confirmButtonClass) return confirmButtonClass;

        switch (type) {
            case 'warning':
                return 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600';
            case 'danger':
                return 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600';
            case 'success':
                return 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600';
            default:
                return 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600';
        }
    };

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className={`relative p-6 pb-4 bg-gradient-to-br ${getHeaderColor()} border-b border-gray-200 dark:border-gray-700`}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                                type === 'danger' ? 'bg-red-100 dark:bg-red-900/30' :
                                    type === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                                        'bg-blue-100 dark:bg-blue-900/30'
                            }`}>
                            {getIcon()}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {title}
                        </h3>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 pt-0">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`flex-1 px-4 py-3 text-white rounded-xl text-sm font-medium transition-colors ${getDefaultButtonClass()}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
